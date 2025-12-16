"use client";

import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
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
}

export function FinancialSummary({ records, ownershipPercentage = 100 }: FinancialSummaryProps) {
    const totalIncome = records
        .filter((r) => r.type === "INCOME")
        .reduce((sum, r) => sum + Number(r.amount), 0);

    const totalExpense = records
        .filter((r) => r.type === "EXPENSE")
        .reduce((sum, r) => sum + Number(r.amount), 0);

    const netProfit = totalIncome - totalExpense;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Income */}
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

            {/* User Share (if not 100%) */}
            {ownershipPercentage < 100 && (
                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                        <CardDescription className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-purple-600" />
                            Tu Ganancia ({ownershipPercentage}%)
                        </CardDescription>
                        <CardTitle className="text-3xl text-purple-700 dark:text-purple-400">
                            {formatCurrency(netProfit * (ownershipPercentage / 100))}
                        </CardTitle>
                    </CardHeader>
                </Card>
            )}

            {/* Net Profit/Loss */}
            <Card
                className={`border-l-4 ${netProfit >= 0
                    ? "border-l-blue-500"
                    : "border-l-orange-500"
                    }`}
            >
                <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        {netProfit >= 0 ? "Ganancia Neta" : "Pérdida Neta"}
                    </CardDescription>
                    <CardTitle
                        className={`text-3xl ${netProfit >= 0
                            ? "text-blue-700 dark:text-blue-400"
                            : "text-orange-700 dark:text-orange-400"
                            }`}
                    >
                        {formatCurrency(Math.abs(netProfit))}
                    </CardTitle>
                </CardHeader>
            </Card>
        </div>
    );
}
