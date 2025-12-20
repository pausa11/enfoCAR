"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingDown, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

export function PersonalVehicleDashboardAnalysis({
    vehicles,
    totalExpenses,
    avgMonthlyExpense,
}: PersonalVehicleDashboardAnalysisProps) {

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Analyze spending patterns
    const analyzeSpending = () => {
        const insights: Array<{
            type: 'positive' | 'neutral' | 'warning';
            title: string;
            description: string;
        }> = [];

        // Calculate expenses per vehicle
        const expensesPerVehicle = vehicles.map(vehicle => {
            const expenses = vehicle.financialRecords
                .filter(r => r.type === "EXPENSE")
                .reduce((sum, r) => sum + r.amount, 0);

            const customAttrs = vehicle.customAttributes as Record<string, string> | null;

            return {
                name: vehicle.name,
                expenses,
                type: vehicle.type,
                year: customAttrs?.año,
                mileage: customAttrs?.kilometraje,
            };
        });

        // Check if there are vehicles
        if (vehicles.length === 0) {
            insights.push({
                type: 'neutral',
                title: 'Sin vehículos registrados',
                description: 'Agrega tus vehículos personales para comenzar a rastrear sus gastos y recibir análisis inteligentes.',
            });
            return insights;
        }

        // Analyze total spending
        if (totalExpenses === 0) {
            insights.push({
                type: 'neutral',
                title: 'Sin gastos registrados',
                description: 'Comienza a registrar los gastos de tus vehículos para obtener análisis detallados y recomendaciones personalizadas.',
            });
        } else if (avgMonthlyExpense < 500000) {
            insights.push({
                type: 'positive',
                title: 'Gastos controlados',
                description: `Tu gasto promedio mensual de ${formatCurrency(avgMonthlyExpense)} está dentro de un rango saludable para vehículos personales.`,
            });
        } else if (avgMonthlyExpense < 1000000) {
            insights.push({
                type: 'neutral',
                title: 'Gastos moderados',
                description: `Con un promedio de ${formatCurrency(avgMonthlyExpense)} al mes, tus gastos son típicos para el mantenimiento de vehículos personales.`,
            });
        } else {
            insights.push({
                type: 'warning',
                title: 'Gastos elevados detectados',
                description: `Tu gasto promedio de ${formatCurrency(avgMonthlyExpense)} al mes es superior al promedio. Considera revisar los gastos recurrentes.`,
            });
        }

        // Analyze vehicle age and expenses
        expensesPerVehicle.forEach(vehicle => {
            if (vehicle.year) {
                const currentYear = new Date().getFullYear();
                const vehicleAge = currentYear - parseInt(vehicle.year);

                if (vehicleAge > 10 && vehicle.expenses > 2000000) {
                    insights.push({
                        type: 'neutral',
                        title: `${vehicle.name} - Vehículo antiguo`,
                        description: `Con ${vehicleAge} años de antigüedad, es normal que ${vehicle.name} requiera más mantenimiento. Has invertido ${formatCurrency(vehicle.expenses)} en su cuidado.`,
                    });
                } else if (vehicleAge < 5 && vehicle.expenses > 1500000) {
                    insights.push({
                        type: 'warning',
                        title: `${vehicle.name} - Gastos inusuales`,
                        description: `Para un vehículo de ${vehicleAge} años, los gastos de ${formatCurrency(vehicle.expenses)} parecen elevados. Verifica si hay problemas recurrentes.`,
                    });
                }
            }
        });

        // Analyze mileage
        expensesPerVehicle.forEach(vehicle => {
            if (vehicle.mileage) {
                const km = parseInt(vehicle.mileage.replace(/\D/g, ''));
                if (km > 100000 && vehicle.expenses > 0) {
                    insights.push({
                        type: 'positive',
                        title: `${vehicle.name} - Alto kilometraje`,
                        description: `Con ${vehicle.mileage} km, es importante mantener un buen programa de mantenimiento preventivo. Estás invirtiendo adecuadamente en su cuidado.`,
                    });
                }
            }
        });

        // If no specific insights, add a general positive message
        if (insights.length === 0 || (insights.length === 1 && insights[0].type === 'neutral')) {
            insights.push({
                type: 'positive',
                title: 'Mantenimiento saludable',
                description: 'Estás llevando un buen control de los gastos de tus vehículos. Continúa registrando todos los gastos para obtener mejores análisis.',
            });
        }

        return insights;
    };

    const insights = analyzeSpending();

    const getIcon = (type: string) => {
        switch (type) {
            case 'positive':
                return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
            case 'warning':
                return <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
            default:
                return <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
        }
    };

    const getBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (type) {
            case 'positive':
                return 'default';
            case 'warning':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    return (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle>Análisis Inteligente</CardTitle>
                </div>
                <CardDescription>
                    Insights automáticos sobre tus gastos de vehículos personales
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {insights.map((insight, index) => (
                    <div
                        key={index}
                        className="flex gap-3 p-4 rounded-lg bg-card border hover:shadow-md transition-shadow"
                    >
                        <div className="flex-shrink-0 mt-0.5">
                            {getIcon(insight.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-sm">{insight.title}</h4>
                                <Badge variant={getBadgeVariant(insight.type)} className="text-xs">
                                    {insight.type === 'positive' ? 'Bien' : insight.type === 'warning' ? 'Atención' : 'Info'}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {insight.description}
                            </p>
                        </div>
                    </div>
                ))}

                {/* AI Disclaimer */}
                <div className="mt-4 p-3 rounded-lg bg-muted/50 border-l-4 border-primary">
                    <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">💡 Análisis automático:</strong> Estos insights se generan automáticamente basándose en tus datos.
                        Los gastos en vehículos personales son normales y necesarios para mantener tu movilidad y seguridad.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
