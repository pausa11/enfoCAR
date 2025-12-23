"use client";

import { Asset, FinancialRecord } from "@prisma/client";
import { TrendingUp, TrendingDown, DollarSign, Car, User, Wallet } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";

// Type for asset with financial records
type AssetWithRecords = Asset & {
    financialRecords: FinancialRecord[];
};

// Type for serialized asset (Decimal converted to number)
type SerializedAsset = Omit<Asset, 'value'> & {
    value: number | null;
};

interface GlobalFinancialKPIsProps {
    assets: SerializedAsset[];
}

interface FinancialStats {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    activeVehicles: number;
    totalDriverEarnings: number;
    userNetProfit: number;
    userNetIncome: number;
    userNetExpense: number;
}

export function GlobalFinancialKPIs({ assets }: GlobalFinancialKPIsProps) {
    const [stats, setStats] = useState<FinancialStats>({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        activeVehicles: 0,
        totalDriverEarnings: 0,
        userNetProfit: 0,
        userNetIncome: 0,
        userNetExpense: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchFinancialData() {
            try {
                // Fetch financial records for all assets
                const promises = assets.map(async (asset) => {
                    const response = await fetch(`/api/financial-records?assetId=${asset.id}`);
                    if (!response.ok) return { asset, records: [] };
                    const data = await response.json();
                    return { asset, records: data || [] };
                });

                const allAssetRecords = await Promise.all(promises);

                let totalIncome = 0;
                let totalExpense = 0;
                let userNetIncome = 0;
                let userNetExpense = 0;
                const vehiclesWithTransactions = new Set<string>();

                // Calculate per-asset and aggregate totals
                allAssetRecords.forEach(({ asset, records }) => {
                    if (records.length > 0) {
                        vehiclesWithTransactions.add(asset.id);
                    }

                    records.forEach((record: FinancialRecord) => {
                        const amount = Number(record.amount);
                        const userAmount = amount * (asset.ownershipPercentage / 100);

                        if (record.type === "INCOME") {
                            totalIncome += amount;
                            userNetIncome += userAmount;
                        } else {
                            totalExpense += amount;
                            userNetExpense += userAmount;
                        }
                    });
                });

                const balance = totalIncome - totalExpense;
                const userNetProfit = userNetIncome - userNetExpense;

                setStats({
                    totalIncome,
                    totalExpense,
                    balance,
                    activeVehicles: vehiclesWithTransactions.size,
                    totalDriverEarnings: 0, // Not calculated in global view
                    userNetProfit,
                    userNetIncome,
                    userNetExpense,
                });
            } catch (error) {
                console.error("Error fetching financial data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchFinancialData();
    }, [assets]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardHeader className="pb-3">
                            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                            <div className="h-8 bg-muted rounded w-3/4"></div>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        );
    }

    const hasDriverPayments = stats.totalDriverEarnings > 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {/* Total Income (Gross) */}
            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2 text-green-600 dark:text-green-500">
                        <TrendingUp className="h-4 w-4" />
                        Total Generado
                    </CardDescription>
                    <CardTitle className="text-3xl font-bold text-green-700 dark:text-green-400">
                        {formatCurrency(stats.totalIncome)}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Ingresos brutos totales</p>
                </CardHeader>
            </Card>

            {/* User Income (with ownership %) */}
            <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
                        <TrendingUp className="h-4 w-4" />
                        Tu Ingreso
                    </CardDescription>
                    <CardTitle className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(stats.userNetIncome)}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Según tu % de propiedad</p>
                </CardHeader>
            </Card>

            {/* Total Expense (Gross) */}
            <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2 text-red-600 dark:text-red-500">
                        <TrendingDown className="h-4 w-4" />
                        Total Gastado
                    </CardDescription>
                    <CardTitle className="text-3xl font-bold text-red-700 dark:text-red-400">
                        {formatCurrency(stats.totalExpense)}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Gastos brutos totales</p>
                </CardHeader>
            </Card>

            {/* User Expense (with ownership %) */}
            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2 text-orange-600 dark:text-orange-500">
                        <TrendingDown className="h-4 w-4" />
                        Tu Gasto
                    </CardDescription>
                    <CardTitle className="text-3xl font-bold text-orange-700 dark:text-orange-400">
                        {formatCurrency(stats.userNetExpense)}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Según tu % de propiedad</p>
                </CardHeader>
            </Card>

            {/* Net Profit (Gross) */}
            <Card
                className={`border-l-4 hover:shadow-lg transition-shadow ${stats.balance >= 0
                        ? "border-l-blue-500"
                        : "border-l-rose-500"
                    }`}
            >
                <CardHeader className="pb-3">
                    <CardDescription
                        className={`flex items-center gap-2 ${stats.balance >= 0
                                ? "text-blue-600 dark:text-blue-500"
                                : "text-rose-600 dark:text-rose-500"
                            }`}
                    >
                        <DollarSign className="h-4 w-4" />
                        Utilidad Neta
                    </CardDescription>
                    <CardTitle
                        className={`text-3xl font-bold ${stats.balance >= 0
                                ? "text-blue-700 dark:text-blue-400"
                                : "text-rose-700 dark:text-rose-400"
                            }`}
                    >
                        {formatCurrency(Math.abs(stats.balance))}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                        Ingresos - Gastos
                    </p>
                </CardHeader>
            </Card>

            {/* User Net Profit (with ownership percentage) */}
            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2 text-purple-600 dark:text-purple-500">
                        <Wallet className="h-4 w-4" />
                        Tu Parte
                    </CardDescription>
                    <CardTitle
                        className={`text-3xl font-bold ${stats.userNetProfit >= 0
                                ? "text-purple-700 dark:text-purple-400"
                                : "text-rose-700 dark:text-rose-400"
                            }`}
                    >
                        {formatCurrency(Math.abs(stats.userNetProfit))}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                        Tu ingreso - Tu gasto
                    </p>
                </CardHeader>
            </Card>
        </div>
    );
}
