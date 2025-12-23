"use client";

import { useEffect, useState } from 'react';
import { AnalysisCard } from '@/components/analysis-card';
import ShinyText from '@/components/ShinyText';
import { Asset, FinancialRecord } from "@prisma/client";

type SerializedAsset = Omit<Asset, 'value'> & {
    value: number | null;
    financialRecords: Array<Omit<FinancialRecord, 'amount'> & { amount: number }>;
};

interface PersonalVehicleDashboardAnalysisProps {
    vehicles: SerializedAsset[];
    totalExpenses: number;
    avgMonthlyExpense: number;
    maintenances: any[];
    documents: any[];
}

// Cache configuration
const CACHE_KEY = 'personal_dashboard_analysis_cache';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface AnalysisCache {
    analysis: string;
    timestamp: number;
    dataHash: string;
}

// Simple hash function for stats comparison
function generateStatsHash(vehicles: SerializedAsset[], totalExpenses: number, maintenances: any[], documents: any[]): string {
    return JSON.stringify({
        vehicleIds: vehicles.map(v => v.id).sort(),
        totalExpenses,
        maintenanceCount: maintenances?.length || 0,
        documentsCount: documents?.length || 0,
        lastUpdated: new Date().toISOString().split('T')[0] // Granularity of 1 day
    });
}
// check getCachedAnalysis is not changing signature but we need to update usage later

// Get cached analysis if valid
function getCachedAnalysis(currentStatsHash: string): string | null {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const parsedCache: AnalysisCache = JSON.parse(cached);
        const now = Date.now();

        // Check if cache is expired (older than 24 hours)
        if (now - parsedCache.timestamp > CACHE_DURATION_MS) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }

        // Check if data has changed
        if (parsedCache.dataHash !== currentStatsHash) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }

        return parsedCache.analysis;
    } catch (error) {
        console.error('Error reading cache:', error);
        return null;
    }
}

// Save analysis to cache
function saveToCache(analysis: string, dataHash: string): void {
    try {
        const cacheData: AnalysisCache = {
            analysis,
            timestamp: Date.now(),
            dataHash,
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Error saving to cache:', error);
    }
}

export function PersonalVehicleDashboardAnalysis({
    vehicles,
    totalExpenses,
    avgMonthlyExpense,
    maintenances,
    documents,
}: PersonalVehicleDashboardAnalysisProps) {
    const [analysis, setAnalysis] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [usingCache, setUsingCache] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const fetchAnalysis = async (forceRefresh = false) => {
        const currentHash = generateStatsHash(vehicles, totalExpenses, maintenances, documents);

        // Try to use cache if not forcing refresh
        if (!forceRefresh) {
            const cachedAnalysis = getCachedAnalysis(currentHash);
            if (cachedAnalysis) {
                setAnalysis(cachedAnalysis);
                setUsingCache(true);
                return;
            }
        }

        setUsingCache(false);
        setIsLoading(true);
        setError(false);

        try {
            const vehicleSummary = vehicles.map(v => ({
                name: v.name,
                model: v.customAttributes ? (v.customAttributes as any).modelo : '',
                year: v.customAttributes ? (v.customAttributes as any).año : '',
                mileage: v.customAttributes ? (v.customAttributes as any).kilometraje : '',
                expenses: v.financialRecords.filter(r => r.type === "EXPENSE").reduce((sum, r) => sum + r.amount, 0)
            }));

            const prompt = `
            Actúa como un experto en autos y "parcero" (amigo colombiano) conocedor.
            Analiza estos vehículos de uso personal:
            ${JSON.stringify(vehicleSummary)}

            Total Gastos: ${formatCurrency(totalExpenses)}
            Promedio Mensual: ${formatCurrency(avgMonthlyExpense)}
            
            Mantenimientos Recientes: ${JSON.stringify(maintenances?.map(m => ({
                fecha: m.date,
                costo: m.cost,
                tipo: m.type,
                vehiculo: m.asset?.name
            })) || [])}
            
            Estado Documentos: ${JSON.stringify(documents?.map(d => ({
                tipo: d.type,
                vence: d.expirationDate,
                vehiculo: d.asset?.name
            })) || [])}

            1. Dame un análisis ultra-corto de cómo va el mantenimiento financiero de mis naves.
            2. Si hay mantenimientos recientes costosos o documentos por vencer, menciónalo como advertencia amistosa.
            3. Para cada modelo de vehículo mencionado, tira un "Dato Curioso" o un "Tip Pro" específico de ese modelo (mecánica, historia, o cuidado). Que sea interesante.
            
            Mantén el tono relajado pero útil.
            `;

            const res = await fetch('/api/analysis', {
                method: 'POST',
                body: JSON.stringify({ prompt }),
            });

            if (!res.ok) throw new Error("Failed");
            const text = await res.text();

            setAnalysis(text);
            saveToCache(text, currentHash);
        } catch (e) {
            setError(true);
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (vehicles.length > 0) {
            fetchAnalysis();
        }
    }, [vehicles.length]);

    const handleRefresh = () => {
        fetchAnalysis(true);
    };

    return (
        <div className="flex flex-col gap-6">
            {vehicles.length > 0 && (
                <AnalysisCard
                    title="Tu experto en motores dice:"
                    analysis={analysis}
                    isLoading={isLoading}
                    error={error}
                    usingCache={usingCache}
                    onRefresh={handleRefresh}
                    loadingText="Revisando el motor..."
                    cardClassName="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800"
                    titleClassName="text-purple-800 dark:text-purple-300"
                    refreshButtonClassName="hover:bg-purple-100 dark:hover:bg-purple-900"
                />
            )}
        </div>
    );
}
