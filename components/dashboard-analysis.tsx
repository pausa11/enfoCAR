'use client';

import { useEffect, useState } from 'react';
import { AnalysisCard } from '@/components/analysis-card';
import ShinyText from '@/components/ShinyText';

interface DashboardAnalysisProps {
    stats: {
        totalIncome: number;
        totalExpenses: number;
        assetCount: number;
        monthlyStats: Record<string, { income: number; expense: number }>;
    };
}

// Cache configuration
const CACHE_KEY = 'dashboard_analysis_cache';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface AnalysisCache {
    analysis: string;
    timestamp: number;
    dataHash: string;
}

// Simple hash function for stats comparison
function generateStatsHash(stats: DashboardAnalysisProps['stats']): string {
    return JSON.stringify({
        totalIncome: stats.totalIncome,
        totalExpenses: stats.totalExpenses,
        assetCount: stats.assetCount,
        monthlyStatsKeys: Object.keys(stats.monthlyStats).sort(),
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

export function DashboardAnalysis({ stats }: DashboardAnalysisProps) {
    const [analysis, setAnalysis] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const [usingCache, setUsingCache] = useState(false);

    const fetchAnalysis = async (forceRefresh = false) => {
        const currentHash = generateStatsHash(stats);

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
            const prompt = `
            Actúa como un experto financiero financiero amigable y "parcero" (usando jerga colombiana moderada).
            Analiza estos datos de mi flota de vehículos:
            - Total Veículos: ${stats.assetCount}
            - Ingresos Totales: $${stats.totalIncome}
            - Gastos Totales: $${stats.totalExpenses}
            - Desglose Mensual: ${JSON.stringify(stats.monthlyStats)}
            
            Dame un resumen corto de 2-3 frases sobre cómo va el negocio. 
            Si hay pérdidas, dame un consejo rápido. 
            Si hay ganancias, felicítame.
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
        fetchAnalysis();
    }, []);

    const handleRefresh = () => {
        fetchAnalysis(true); // Force refresh
    };


    return (
        <AnalysisCard
            title="Tu mecanico de confianza dice:"
            analysis={analysis}
            isLoading={isLoading}
            error={error}
            usingCache={usingCache}
            onRefresh={handleRefresh}
            loadingText="Analizando tus finanzas..."
        />
    );
}
