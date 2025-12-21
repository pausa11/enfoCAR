"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Car } from "lucide-react";
import { DashboardAnalysis } from "@/components/dashboard-analysis";
import { FinancialCharts } from "@/components/financial-charts";
import SplitText from "@/components/SplitText";

interface BusinessDashboardProps {
    userEmail: string;
    assetCount: number;
    businessAssetCount: number;
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    profitMargin: number;
    monthlyStats: Record<string, { income: number; expense: number }>;
    monthlyStatsArray: Array<{ month: string; income: number; expense: number }>;
    incomeByAssetTypeData: Array<{ name: string; value: number }>;
}

export function BusinessDashboard({
    userEmail,
    assetCount,
    businessAssetCount,
    totalIncome,
    totalExpenses,
    netIncome,
    profitMargin,
    monthlyStats,
    monthlyStatsArray,
    incomeByAssetTypeData,
}: BusinessDashboardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatPercentage = (percent: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "percent",
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
        }).format(percent / 100);
    };

    const sortedMonths = Object.keys(monthlyStats).sort();

    return (
        <div className="flex flex-col gap-6 sm:gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col gap-2">
                    <SplitText
                        text="Mi Tablero de Negocio"
                        tag="h2"
                        className="text-2xl sm:text-3xl font-bold"
                        delay={100}
                        duration={0.6}
                        ease="power3.out"
                        splitType="chars"
                        from={{ opacity: 0, y: 40 }}
                        to={{ opacity: 1, y: 0 }}
                        threshold={0.1}
                        rootMargin="-100px"
                        textAlign="left"
                    />
                    <p className="text-sm sm:text-base text-muted-foreground">
                        ¡Todo bien, {userEmail}! Aquí tienes el resumen de la jugada.
                    </p>
                </div>
                <Link href="/app/activos">
                    <Button id="view-assets-button" className="gap-2">
                        <Car className="h-4 w-4" />
                        Ver mis Naves
                    </Button>
                </Link>
            </div>

            <DashboardAnalysis
                stats={{
                    totalIncome,
                    totalExpenses,
                    assetCount: businessAssetCount,
                    monthlyStats
                }}
            />

            {/* Summary Cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Naves</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent id="stats-total-assets">
                        <div className="text-2xl font-bold">{assetCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {businessAssetCount} de negocio
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Margen de Ganancia</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPercentage(profitMargin)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Eficiencia de tu operación
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lo que entra (Ingresos)</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(totalIncome)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lo que sale (Gastos)</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(totalExpenses)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Net Income Highlight */}
            <div className="grid gap-4 grid-cols-1">
                <Card id="net-income-card" className={`${netIncome >= 0 ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"}`}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Utilidad Neta (Lo que te queda libre)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-4xl font-bold ${netIncome >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                            {formatCurrency(netIncome)}
                        </div>
                        <p className="text-muted-foreground mt-1">
                            Ingresos - Gastos
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Visual Charts */}
            <SplitText
                text="Echele pues el ojo"
                tag="h2"
                className="text-lg sm:text-xl font-semibold mt-2"
                delay={100}
                duration={0.6}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.1}
                rootMargin="-100px"
                textAlign="left"
            />
            <FinancialCharts
                monthlyStats={monthlyStatsArray}
                incomeByAssetType={incomeByAssetTypeData}
            />

            {/* Monthly Breakdown Table */}
            <div className="flex flex-col gap-4">
                <SplitText
                    text="Detalle Mensual"
                    tag="h2"
                    className="text-lg sm:text-xl font-semibold mt-4"
                    delay={100}
                    duration={0.6}
                    ease="power3.out"
                    splitType="chars"
                    from={{ opacity: 0, y: 40 }}
                    to={{ opacity: 1, y: 0 }}
                    threshold={0.1}
                    rootMargin="-100px"
                    textAlign="left"
                />
                <div className="border rounded-md overflow-x-auto">
                    <div className="grid grid-cols-4 p-3 sm:p-4 font-medium border-b bg-muted/50 text-sm sm:text-base min-w-[500px]">
                        <div>Mes</div>
                        <div>Ingresos</div>
                        <div>Gastos</div>
                        <div>Utilidad</div>
                    </div>
                    {sortedMonths.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground text-sm sm:text-base">
                            Todavía no hay movimiento, ¡a camellar!
                        </div>
                    ) : (
                        sortedMonths.map((month) => {
                            const inc = monthlyStats[month].income;
                            const exp = monthlyStats[month].expense;
                            const util = inc - exp;

                            return (
                                <div key={month} className="grid grid-cols-4 p-3 sm:p-4 border-b last:border-0 hover:bg-muted/10 transition-colors text-sm sm:text-base min-w-[500px]">
                                    <div>{month}</div>
                                    <div className="text-green-600">
                                        {formatCurrency(inc)}
                                    </div>
                                    <div className="text-red-600">
                                        {formatCurrency(exp)}
                                    </div>
                                    <div className={`font-semibold ${util >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(util)}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
