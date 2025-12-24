"use client";

import { Asset, FinancialRecord } from "@prisma/client";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

// Type for serialized asset
type SerializedAsset = Omit<Asset, 'value'> & {
    value: number | null;
};

interface FinancialChartsOverviewProps {
    assets: SerializedAsset[];
}

interface MonthlyData {
    month: string;
    income: number;
    expense: number;
    balance: number;
}

export function FinancialChartsOverview({ assets }: FinancialChartsOverviewProps) {
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchAndProcessData() {
            try {
                // Fetch financial records for all assets
                const promises = assets.map(async (asset) => {
                    const response = await fetch(`/api/financial-records?assetId=${asset.id}`);
                    if (!response.ok) return [];
                    const data = await response.json();
                    return data || [];
                });

                const allRecordsArrays = await Promise.all(promises);
                const allRecords: FinancialRecord[] = allRecordsArrays.flat();

                // Process data by month (last 6 months)
                const monthsData = new Map<string, { income: number; expense: number }>();
                const now = new Date();

                // Initialize last 6 months
                for (let i = 5; i >= 0; i--) {
                    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                    const monthKey = date.toLocaleDateString("es-CO", { month: "short", year: "numeric" });
                    monthsData.set(monthKey, { income: 0, expense: 0 });
                }

                // Aggregate records by month
                allRecords.forEach((record) => {
                    const recordDate = new Date(record.date);
                    const monthKey = recordDate.toLocaleDateString("es-CO", { month: "short", year: "numeric" });

                    if (monthsData.has(monthKey)) {
                        const data = monthsData.get(monthKey)!;
                        if (record.type === "INCOME") {
                            data.income += Number(record.amount);
                        } else {
                            data.expense += Number(record.amount);
                        }
                    }
                });

                // Convert to array format for charts
                const chartData: MonthlyData[] = Array.from(monthsData.entries()).map(([month, data]) => ({
                    month,
                    income: data.income,
                    expense: data.expense,
                    balance: data.income - data.expense,
                }));

                setMonthlyData(chartData);
            } catch (error) {
                console.error("Error processing financial data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchAndProcessData();
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
            <div className="grid gap-4 md:grid-cols-2 mb-8">
                <Card className="animate-pulse">
                    <CardHeader>
                        <div className="h-6 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] bg-muted rounded"></div>
                    </CardContent>
                </Card>
                <Card className="animate-pulse">
                    <CardHeader>
                        <div className="h-6 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] bg-muted rounded"></div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const hasData = monthlyData.some(d => d.income > 0 || d.expense > 0);

    return (
        <div className="grid gap-4 md:grid-cols-2 mb-8">
            {/* Income vs Expense Bar Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Ingresos vs Gastos (Últimos 6 Meses)</CardTitle>
                </CardHeader>
                <CardContent>
                    {hasData ? (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={monthlyData}
                                    margin={{
                                        top: 5,
                                        right: 10,
                                        left: 10,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="month"
                                        className="text-xs"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        className="text-xs"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => formatCurrency(Number(value))}
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--background))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "6px",
                                        }}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="income"
                                        name="Ingresos"
                                        fill="#16a34a"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={50}
                                    />
                                    <Bar
                                        dataKey="expense"
                                        name="Gastos"
                                        fill="#dc2626"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={50}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                            <p className="text-sm">No hay datos financieros para mostrar</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Balance Trend Line Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Tendencia del Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    {hasData ? (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={monthlyData}
                                    margin={{
                                        top: 5,
                                        right: 10,
                                        left: 10,
                                        bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="month"
                                        className="text-xs"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        className="text-xs"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => formatCurrency(Number(value))}
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--background))",
                                            border: "1px solid hsl(var(--border))",
                                            borderRadius: "6px",
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="balance"
                                        name="Balance"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        dot={{ fill: "#2563eb", r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                            <p className="text-sm">No hay datos financieros para mostrar</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
