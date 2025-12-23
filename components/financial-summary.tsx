"use client";

import { TrendingUp, TrendingDown, DollarSign, User } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

interface FinancialRecord {
    id: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
}

interface FinancialSummaryProps {
    records: FinancialRecord[];
    ownershipPercentage?: number;
    driverPercentage?: number;
    driverName?: string | null;
    driverPaymentMode?: "PERCENTAGE" | "FIXED_SALARY" | null;
    driverMonthlySalary?: number | null;
    isBusinessAsset?: boolean;
}

export function FinancialSummary({
    records,
    ownershipPercentage = 100,
    driverPercentage = 0,
    driverName = null,
    driverPaymentMode = null,
    driverMonthlySalary = null,
    isBusinessAsset = true,
}: FinancialSummaryProps) {
    const totalIncome = records
        .filter((r) => r.type === "INCOME")
        .reduce((sum, r) => sum + Number(r.amount), 0);

    const totalExpense = records
        .filter((r) => r.type === "EXPENSE")
        .reduce((sum, r) => sum + Number(r.amount), 0);

    // Gross profit (before driver share)
    const grossProfit = totalIncome - totalExpense;

    // Calculate driver earnings based on payment mode
    let driverEarnings = 0;
    if (driverPaymentMode === 'PERCENTAGE') {
        driverEarnings = totalIncome * (driverPercentage / 100);
    } else if (driverPaymentMode === 'FIXED_SALARY' && driverMonthlySalary) {
        driverEarnings = driverMonthlySalary;
    }

    // Net profit after driver share
    const netProfitAfterDriver = grossProfit - driverEarnings;

    // User earnings (ownership percentage of net profit after driver)
    const userEarnings = netProfitAfterDriver * (ownershipPercentage / 100);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const hasDriver = driverPaymentMode && (
        (driverPaymentMode === 'PERCENTAGE' && driverPercentage > 0) ||
        (driverPaymentMode === 'FIXED_SALARY' && driverMonthlySalary && driverMonthlySalary > 0)
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Total Income - Only show for business assets */}
            {isBusinessAsset && (
                <StatCard
                    title="Total Generado"
                    value={formatCurrency(totalIncome)}
                    subtitle="Ingresos brutos"
                    icon={TrendingUp}
                    colorClass="text-green-600 dark:text-green-400"
                    bgClass="from-green-500/10 via-green-500/5 to-transparent"
                />
            )}

            {/* Total Expense */}
            <StatCard
                title="Total Gastado"
                value={formatCurrency(totalExpense)}
                subtitle="Gastos brutos"
                icon={TrendingDown}
                colorClass="text-red-600 dark:text-red-400"
                bgClass="from-red-500/10 via-red-500/5 to-transparent"
            />

            {/* Driver Earnings (if driver exists) */}
            {hasDriver && (
                <StatCard
                    title={driverPaymentMode === 'PERCENTAGE'
                        ? `Ganancia del Conductor (${driverPercentage}%)`
                        : 'Salario del Conductor'
                    }
                    value={formatCurrency(driverEarnings)}
                    subtitle={driverName ? driverName : undefined}
                    icon={User}
                    colorClass="text-amber-600 dark:text-amber-400"
                    bgClass="from-amber-500/10 via-amber-500/5 to-transparent"
                />
            )}

            {/* User Share (if not 100% ownership OR driver exists) */}
            {(ownershipPercentage < 100 || hasDriver) && (
                <StatCard
                    title={`Tu Ganancia (${ownershipPercentage}%)`}
                    value={formatCurrency(userEarnings)}
                    icon={DollarSign}
                    colorClass="text-purple-600 dark:text-purple-400"
                    bgClass="from-purple-500/10 via-purple-500/5 to-transparent"
                />
            )}

            {/* Net Profit/Loss (after driver share) - Only show for business assets */}
            {isBusinessAsset && (
                <StatCard
                    title={netProfitAfterDriver >= 0 ? "Ganancia Neta" : "Pérdida Neta"}
                    value={formatCurrency(Math.abs(netProfitAfterDriver))}
                    subtitle={hasDriver
                        ? (driverPaymentMode === 'PERCENTAGE'
                            ? `Después del ${driverPercentage}% del conductor`
                            : 'Después del salario del conductor')
                        : undefined
                    }
                    icon={DollarSign}
                    colorClass={netProfitAfterDriver >= 0
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-orange-600 dark:text-orange-400"
                    }
                    bgClass={netProfitAfterDriver >= 0
                        ? "from-blue-500/10 via-blue-500/5 to-transparent"
                        : "from-orange-500/10 via-orange-500/5 to-transparent"
                    }
                />
            )}
        </div>
    );
}
