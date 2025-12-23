"use client";

import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Car, TrendingUp, TrendingDown } from "lucide-react";
import { PersonalVehicleDashboardAnalysis } from "@/components/personal-vehicle-dashboard-analysis";
import SplitText from "@/components/SplitText";
import { Asset, FinancialRecord } from "@prisma/client";

type SerializedAsset = Omit<Asset, 'value'> & {
    value: number | null;
    financialRecords: Array<Omit<FinancialRecord, 'amount'> & { amount: number }>;
};

interface PersonalDashboardProps {
    userEmail: string;
    vehicles: SerializedAsset[];
    totalExpenses: number;
    avgMonthlyExpense: number;
    monthlyExpenses: Record<string, number>;
}

export function PersonalDashboard({
    userEmail,
    vehicles,
    totalExpenses,
    avgMonthlyExpense,
    monthlyExpenses,
}: PersonalDashboardProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const sortedMonths = Object.keys(monthlyExpenses).sort();

    return (
        <div className="flex flex-col gap-6 sm:gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col gap-2">
                    <SplitText
                        text="Mi Tablero Personal"
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
                        Mantén el control de los gastos de tus vehículos personales
                    </p>
                </div>
                <Link href="/app/vehiculos-personales">
                    <Button className="gap-2">
                        <Car className="h-4 w-4" />
                        Ver Vehículos Personales
                    </Button>
                </Link>
            </div>

            <PersonalVehicleDashboardAnalysis
                vehicles={vehicles}
                totalExpenses={totalExpenses}
                avgMonthlyExpense={avgMonthlyExpense}
            />

            <div id="summary" className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Vehículos Personales"
                    value={vehicles.length.toString()}
                    subtitle="Total registrados"
                    icon={Car}
                    colorClass="text-blue-600 dark:text-blue-400"
                    bgClass="from-blue-500/10 via-blue-500/5 to-transparent"
                />

                <StatCard
                    title="Gasto Total"
                    value={formatCurrency(totalExpenses)}
                    subtitle="Inversión en tus vehículos"
                    icon={TrendingDown}
                    colorClass="text-blue-600 dark:text-blue-400"
                    bgClass="from-blue-500/10 via-blue-500/5 to-transparent"
                />

                <StatCard
                    title="Promedio Mensual"
                    value={formatCurrency(avgMonthlyExpense)}
                    subtitle="Gasto promedio por mes"
                    icon={TrendingUp} // Using TrendingUp for average
                    colorClass="text-purple-600 dark:text-purple-400"
                    bgClass="from-purple-500/10 via-purple-500/5 to-transparent"
                />
            </div>

            {sortedMonths.length > 0 && (
                <div id="monthly-breakdown" className="flex flex-col gap-4">
                    <SplitText
                        text="Gastos Mensuales"
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
                        <div className="grid grid-cols-2 p-3 sm:p-4 font-medium border-b bg-muted/50 text-sm sm:text-base min-w-[400px]">
                            <div>Mes</div>
                            <div>Gastos</div>
                        </div>
                        {sortedMonths.map((month) => (
                            <div key={month} className="grid grid-cols-2 p-3 sm:p-4 border-b last:border-0 hover:bg-muted/10 transition-colors text-sm sm:text-base min-w-[400px]">
                                <div>{month}</div>
                                <div className="text-blue-600 dark:text-blue-400 font-medium">
                                    {formatCurrency(monthlyExpenses[month])}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {vehicles.length === 0 && (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                        <Car className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No tienes vehículos personales registrados</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Agrega tu primer vehículo personal para comenzar a rastrear sus gastos
                        </p>
                        <Link href="/app/vehiculos-personales">
                            <Button>
                                <Car className="h-4 w-4 mr-2" />
                                Ir a Vehículos Personales
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
