"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Car, TrendingUp, TrendingDown } from "lucide-react";
import { DashboardAnalysis } from "@/components/ai/dashboard-analysis";
import { FinancialCharts } from "@/components/financials/financial-charts";
import SplitText from "@/components/reactBits/SplitText";

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
    maintenances: any[];
    documents: any[];
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
    maintenances,
    documents,
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
                        className="text-4xl sm:text-5xl font-bold"
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
                    <p className="text-base sm:text-lg text-muted-foreground">
                        ¡Todo bien, {userEmail}! Aquí tienes el resumen de la jugada.
                    </p>
                </div>
                <Link href="/app/activos">
                    <Button id="view-assets-button" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Car className="h-4 w-4" />
                        Ver Mis Naves
                    </Button>
                </Link>
            </div>

            <DashboardAnalysis
                stats={{
                    totalIncome,
                    totalExpenses,
                    assetCount: businessAssetCount,
                    monthlyStats,
                    maintenances,
                    documents
                }}
            />

            {/* Summary Cards */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total de Naves"
                    value={assetCount.toString()}
                    subtitle={`${businessAssetCount} de negocio`}
                    icon={Car}
                    colorClass="text-emerald-600 dark:text-emerald-400"
                    bgClass="from-emerald-500/10 via-emerald-500/5 to-transparent"
                />

                <StatCard
                    title="Margen de Ganancia"
                    value={formatPercentage(profitMargin)}
                    subtitle="Eficiencia de tu operación"
                    icon={TrendingUp} // Using TrendingUp as generic icon for margin
                    colorClass={profitMargin >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}
                    bgClass={profitMargin >= 0 ? "from-emerald-500/10 via-emerald-500/5 to-transparent" : "from-red-500/10 via-red-500/5 to-transparent"}
                />

                <StatCard
                    title="Lo que entra (Ingresos)"
                    value={formatCurrency(totalIncome)}
                    icon={TrendingUp}
                    colorClass="text-emerald-600 dark:text-emerald-400"
                    bgClass="from-emerald-500/10 via-emerald-500/5 to-transparent"
                />

                <StatCard
                    title="Lo que sale (Gastos)"
                    value={formatCurrency(totalExpenses)}
                    icon={TrendingDown}
                    colorClass="text-red-600 dark:text-red-400"
                    bgClass="from-red-500/10 via-red-500/5 to-transparent"
                />
            </div>

            {/* Net Income Highlight */}
            <div className="grid gap-4 grid-cols-1">
                <StatCard
                    title="Utilidad Neta (Lo que te queda libre)"
                    value={formatCurrency(netIncome)}
                    subtitle="Ingresos - Gastos"
                    icon={TrendingUp} // Using TrendingUp generic
                    colorClass={netIncome >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}
                    bgClass={netIncome >= 0 ? "from-emerald-500/10 via-emerald-500/5 to-transparent" : "from-red-500/10 via-red-500/5 to-transparent"}
                />
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
                                    <div className="text-emerald-600">
                                        {formatCurrency(inc)}
                                    </div>
                                    <div className="text-red-600">
                                        {formatCurrency(exp)}
                                    </div>
                                    <div className={`font-semibold ${util >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {formatCurrency(util)}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
                {/* Maintenance and Documents Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                    {/* Maintenance Summary */}
                    <div className="flex flex-col gap-4">
                        <SplitText
                            text="Mantenimientos Recientes"
                            tag="h2"
                            className="text-lg sm:text-xl font-semibold"
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
                        <div className="border rounded-md bg-muted/20">
                            {maintenances.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground text-sm">
                                    Todo al pelo, sin mantenimientos recientes.
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {maintenances.map((m, i) => (
                                        <div key={i} className="p-3 text-sm flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{m.asset?.name || 'Vehículo'}</p>
                                                <p className="text-muted-foreground text-xs">{new Date(m.date).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{formatCurrency(m.cost)}</p>
                                                <p className="text-xs text-muted-foreground">{m.type.replace(/_/g, ' ')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Documents Summary */}
                    <div className="flex flex-col gap-4">
                        <SplitText
                            text="Papeles al día"
                            tag="h2"
                            className="text-lg sm:text-xl font-semibold"
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
                        <div className="border rounded-md bg-muted/20">
                            {documents.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground text-sm">
                                    No hay documentos registrados.
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {documents.slice(0, 5).map((d, i) => {
                                        const daysUntilExpiration = d.expirationDate
                                            ? Math.ceil((new Date(d.expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                                            : null;

                                        const isUrgent = daysUntilExpiration !== null && daysUntilExpiration < 30;

                                        return (
                                            <div key={i} className="p-3 text-sm flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">{d.asset?.name || 'Vehículo'}</p>
                                                    <p className="text-xs text-muted-foreground">{d.type.replace(/_/g, ' ')}</p>
                                                </div>
                                                <div className="text-right">
                                                    {d.expirationDate ? (
                                                        <p className={`font-semibold ${isUrgent ? 'text-red-500' : 'text-emerald-600'}`}>
                                                            {daysUntilExpiration && daysUntilExpiration < 0
                                                                ? 'Vencido'
                                                                : `${daysUntilExpiration} días`}
                                                        </p>
                                                    ) : (
                                                        <p className="text-muted-foreground">Sin fecha</p>
                                                    )}
                                                    <p className="text-xs text-muted-foreground">
                                                        Vence: {d.expirationDate ? new Date(d.expirationDate).toLocaleDateString() : 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
