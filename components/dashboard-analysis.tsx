'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2 text-blue-800 dark:text-blue-300">
                    <ShinyText
                        text="Tu mecanico de confianza dice:"
                        className=""
                        speed={3}
                    />
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900"
                    title={usingCache ? "Actualizar análisis (usando cache)" : "Actualizar análisis"}
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                {analysis ? (
                    <div className="text-sm sm:text-base leading-relaxed space-y-4">
                        {analysis.split('\n').map((line, i) => {
                            // Handle bold text with **
                            const parts = line.split('**');
                            const formattedLine = parts.map((part, index) =>
                                index % 2 === 1 ? <strong key={index} className="font-bold">{part}</strong> : part
                            );

                            // Handle bullet points
                            if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
                                return (
                                    <div key={i} className="flex gap-2 ml-4">
                                        <span className="text-primary">•</span>
                                        <div className='flex-1'>{
                                            parts.map((part, index) => {
                                                // Clean the first part if it has the bullet
                                                if (index === 0) return part.replace(/^[\*\-]\s*/, '');
                                                return index % 2 === 1 ? <strong key={index} className="font-bold text-foreground">{part}</strong> : part
                                            })
                                        }</div>
                                    </div>
                                );
                            }

                            // Handle numbered lists
                            if (/^\d+\./.test(line.trim())) {
                                return (
                                    <div key={i} className="flex gap-2 ml-4">
                                        <span className="font-bold text-primary">{line.trim().split('.')[0]}.</span>
                                        <div className='flex-1'>{
                                            parts.map((part, index) => {
                                                if (index === 0) return part.replace(/^\d+\.\s*/, '');
                                                return index % 2 === 1 ? <strong key={index} className="font-bold text-foreground">{part}</strong> : part
                                            })
                                        }</div>
                                    </div>
                                );
                            }

                            // Empty lines
                            if (!line.trim()) return <br key={i} />;

                            // Regular paragraphs
                            return <p key={i}>{formattedLine}</p>;
                        })}

                        {usingCache && (
                            <div className="mt-2 flex justify-end" title="Análisis en memoria">
                                <Brain className="h-3 w-3 text-muted-foreground/50" />
                            </div>
                        )}
                    </div>
                ) : isLoading ? (
                    <div className="flex items-center gap-2 text-sm">
                        <ShinyText
                            text="Analizando tus finanzas..."
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
                ) : null}
            </CardContent>
        </Card>
    );
}
