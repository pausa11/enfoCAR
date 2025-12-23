"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { Button } from '@/components/ui/button';
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
function generateStatsHash(vehicles: SerializedAsset[], totalExpenses: number): string {
    return JSON.stringify({
        vehicleIds: vehicles.map(v => v.id).sort(),
        totalExpenses,
        lastUpdated: new Date().toISOString().split('T')[0] // Granularity of 1 day to avoid too many refreshes
    });
}

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
        const currentHash = generateStatsHash(vehicles, totalExpenses);

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

            1. Dame un análisis ultra-corto de cómo va el mantenimiento financiero de mis naves.
            2. Para cada modelo de vehículo mencionado, tira un "Dato Curioso" o un "Tip Pro" específico de ese modelo (mecánica, historia, o cuidado). Que sea interesante.
            
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
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium flex items-center gap-2 text-purple-800 dark:text-purple-300">
                            <ShinyText
                                text="Tu experto en motores dice:"
                                className=""
                                speed={3}
                            />
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="h-8 w-8 hover:bg-purple-100 dark:hover:bg-purple-900"
                            title={usingCache ? "Actualizar análisis (usando cache)" : "Actualizar análisis"}
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {analysis ? (
                            <>
                                <ShinyText
                                    text={analysis}
                                    className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap"
                                    speed={4}
                                />
                                {usingCache && (
                                    <p className="text-xs text-muted-foreground mt-2 opacity-60">
                                        💾 Análisis en cache
                                    </p>
                                )}
                            </>
                        ) : isLoading ? (
                            <div className="flex items-center gap-2 text-sm">
                                <ShinyText
                                    text="Revisando el motor..."
                                    className="animate-pulse"
                                    speed={2}
                                />
                            </div>
                        ) : error ? (
                            <ShinyText
                                text="No se pudo cargar el análisis. Intenta de nuevo."
                                className="text-sm text-red-600 dark:text-red-400"
                                speed={3}
                            />
                        ) : (
                            <ShinyText
                                text="Esperando datos para analizar..."
                                className="text-sm text-muted-foreground"
                                speed={2}
                            />
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
