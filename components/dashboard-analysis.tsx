'use client';

import { useCompletion } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardAnalysisProps {
    stats: {
        totalIncome: number;
        totalExpenses: number;
        assetCount: number;
        monthlyStats: Record<string, { income: number; expense: number }>;
    };
}

export function DashboardAnalysis({ stats }: DashboardAnalysisProps) {
    const [analysis, setAnalysis] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);

    const fetchAnalysis = async () => {
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
        fetchAnalysis();
    };

    return (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2 text-blue-800 dark:text-blue-300">
                    Tu mecanico de confianza dice:  
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900"
                >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>
            <CardContent>
                {analysis ? (
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                        {analysis}
                    </p>
                ) : isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="animate-pulse">Analizando tus finanzas...</span>
                    </div>
                ) : error ? (
                    <p className="text-sm text-red-500">No se pudo cargar el análisis. Intenta de nuevo.</p>
                ) : null}
            </CardContent>
        </Card>
    );
}
