"use client";

import { Asset, FinancialRecord } from "@prisma/client";
import { StatCard } from "@/components/ui/stat-card";
import { TrendingUp, TrendingDown, DollarSign, Car, User, Wallet } from "lucide-react";
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
                    <div key={i} className="h-32 rounded-xl bg-muted/20 animate-pulse" />
                ))}
            </div>
        );
    }


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <StatCard
                title="Total Generado"
                value={formatCurrency(stats.totalIncome)}
                subtitle="Ingresos brutos totales"
                icon={TrendingUp}
                colorClass="text-emerald-600 dark:text-emerald-400"
                bgClass="from-emerald-500/10 via-emerald-500/5 to-transparent"
            />

            <StatCard
                title="Tu Ingreso"
                value={formatCurrency(stats.userNetIncome)}
                subtitle="Según tu % de propiedad"
                icon={User}
                colorClass="text-teal-600 dark:text-teal-400"
                bgClass="from-teal-500/10 via-teal-500/5 to-transparent"
            />

            <StatCard
                title="Total Gastado"
                value={formatCurrency(stats.totalExpense)}
                subtitle="Gastos brutos totales"
                icon={TrendingDown}
                colorClass="text-rose-600 dark:text-rose-400"
                bgClass="from-rose-500/10 via-rose-500/5 to-transparent"
            />

            <StatCard
                title="Tu Gasto"
                value={formatCurrency(stats.userNetExpense)}
                subtitle="Según tu % de propiedad"
                icon={User}
                colorClass="text-orange-600 dark:text-orange-400"
                bgClass="from-orange-500/10 via-orange-500/5 to-transparent"
            />

            <StatCard
                title="Utilidad Neta"
                value={formatCurrency(Math.abs(stats.balance))}
                subtitle="Ingresos - Gastos"
                icon={DollarSign}
                colorClass={stats.balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}
                bgClass={stats.balance >= 0 ? "from-blue-500/10 via-blue-500/5 to-transparent" : "from-red-500/10 via-red-500/5 to-transparent"}
            />

            <StatCard
                title="Tu Parte (Utilidad)"
                value={formatCurrency(Math.abs(stats.userNetProfit))}
                subtitle="Tu ingreso - Tu gasto"
                icon={Wallet}
                colorClass={stats.userNetProfit >= 0 ? "text-violet-600 dark:text-violet-400" : "text-red-600 dark:text-red-400"}
                bgClass={stats.userNetProfit >= 0 ? "from-violet-500/10 via-violet-500/5 to-transparent" : "from-red-500/10 via-red-500/5 to-transparent"}
            />
        </div>
    );
}
