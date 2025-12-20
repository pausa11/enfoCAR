"use client";

import { TrendingUp, TrendingDown, DollarSign, User } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

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
        driverEarnings = grossProfit * (driverPercentage / 100);
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
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                        <CardDescription className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            Total Generado
                        </CardDescription>
                        <CardTitle className="text-3xl text-green-700 dark:text-green-400">
                            {formatCurrency(totalIncome)}
                        </CardTitle>
                    </CardHeader>
                </Card>
            )}

            {/* Total Expense */}
            <Card className="border-l-4 border-l-red-500">
                <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4 text-red-600" />
                        Total Gastado
                    </CardDescription>
                    <CardTitle className="text-3xl text-red-700 dark:text-red-400">
                        {formatCurrency(totalExpense)}
                    </CardTitle>
                </CardHeader>
            </Card>

            {/* Driver Earnings (if driver exists) */}
            {hasDriver && (
                <Card className="border-l-4 border-l-amber-500">
                    <CardHeader className="pb-3">
                        <CardDescription className="flex items-center gap-2">
                            <User className="h-4 w-4 text-amber-600" />
                            {driverPaymentMode === 'PERCENTAGE'
                                ? `Ganancia del Conductor (${driverPercentage}%)`
                                : 'Salario del Conductor'
                            }
                        </CardDescription>
                        <CardTitle className="text-3xl text-amber-700 dark:text-amber-400">
                            {formatCurrency(driverEarnings)}
                        </CardTitle>
                        {driverName && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {driverName}
                            </p>
                        )}
                    </CardHeader>
                </Card>
            )}

            {/* User Share (if not 100% ownership OR driver exists) */}
            {(ownershipPercentage < 100 || hasDriver) && (
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                        <CardDescription className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-purple-600" />
                            Tu Ganancia ({ownershipPercentage}%)
                        </CardDescription>
                        <CardTitle className="text-3xl text-purple-700 dark:text-purple-400">
                            {formatCurrency(userEarnings)}
                        </CardTitle>
                    </CardHeader>
                </Card>
            )}

            {/* Net Profit/Loss (after driver share) - Only show for business assets */}
            {isBusinessAsset && (
                <Card
                    className={`border-l-4 ${netProfitAfterDriver >= 0
                        ? "border-l-blue-500"
                        : "border-l-orange-500"
                        }`}
                >
                    <CardHeader className="pb-3">
                        <CardDescription className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            {netProfitAfterDriver >= 0 ? "Ganancia Neta" : "Pérdida Neta"}
                        </CardDescription>
                        <CardTitle
                            className={`text-3xl ${netProfitAfterDriver >= 0
                                ? "text-blue-700 dark:text-blue-400"
                                : "text-orange-700 dark:text-orange-400"
                                }`}
                        >
                            {formatCurrency(Math.abs(netProfitAfterDriver))}
                        </CardTitle>
                        {hasDriver && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {driverPaymentMode === 'PERCENTAGE'
                                    ? `Después del ${driverPercentage}% del conductor`
                                    : 'Después del salario del conductor'
                                }
                            </p>
                        )}
                    </CardHeader>
                </Card>
            )}
        </div>
    );
}
