"use client";

import { Asset, FinancialRecord } from "@prisma/client";
import { ArrowUpCircle, ArrowDownCircle, Calendar, Filter } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Type for serialized asset
type SerializedAsset = Omit<Asset, 'value'> & {
    value: number | null;
};

interface RecentTransactionsTableProps {
    assets: SerializedAsset[];
}

interface TransactionWithAsset extends FinancialRecord {
    assetName: string;
}

export function RecentTransactionsTable({ assets }: RecentTransactionsTableProps) {
    const [transactions, setTransactions] = useState<TransactionWithAsset[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithAsset[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [typeFilter, setTypeFilter] = useState<string>("ALL");
    const [assetFilter, setAssetFilter] = useState<string>("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        async function fetchTransactions() {
            try {
                const promises = assets.map(async (asset) => {
                    const response = await fetch(`/api/financial-records?assetId=${asset.id}`);
                    if (!response.ok) return [];
                    const data = await response.json();
                    const records = data || [];
                    return records.map((record: FinancialRecord) => ({
                        ...record,
                        assetName: asset.name,
                    }));
                });

                const allTransactionsArrays = await Promise.all(promises);
                const allTransactions = allTransactionsArrays.flat();

                // Sort by date (most recent first)
                allTransactions.sort((a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                );

                setTransactions(allTransactions);
                setFilteredTransactions(allTransactions);
            } catch (error) {
                console.error("Error fetching transactions:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchTransactions();
    }, [assets]);

    // Apply filters
    useEffect(() => {
        let filtered = [...transactions];

        // Type filter
        if (typeFilter !== "ALL") {
            filtered = filtered.filter(t => t.type === typeFilter);
        }

        // Asset filter
        if (assetFilter !== "ALL") {
            filtered = filtered.filter(t => t.assetId === assetFilter);
        }

        setFilteredTransactions(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    }, [typeFilter, assetFilter, transactions]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString("es-CO", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Transacciones Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle>Transacciones Recientes</CardTitle>

                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos</SelectItem>
                                <SelectItem value="INCOME">Ingresos</SelectItem>
                                <SelectItem value="EXPENSE">Gastos</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={assetFilter} onValueChange={setAssetFilter}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Vehículo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Todos los vehículos</SelectItem>
                                {assets.map((asset) => (
                                    <SelectItem key={asset.id} value={asset.id}>
                                        {asset.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {currentTransactions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg">No hay transacciones para mostrar</p>
                        <p className="text-sm mt-2">
                            {transactions.length === 0
                                ? "Agrega tu primera transacción desde la página de un vehículo"
                                : "Intenta ajustar los filtros"}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[120px]">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Fecha
                                            </div>
                                        </TableHead>
                                        <TableHead>Vehículo</TableHead>
                                        <TableHead className="w-[100px]">Tipo</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead className="text-right w-[140px]">Monto</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currentTransactions.map((transaction) => (
                                        <TableRow key={transaction.id} className="hover:bg-muted/50">
                                            <TableCell className="font-medium text-sm">
                                                {formatDate(transaction.date)}
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/app/activos/${transaction.assetId}`}
                                                    className="text-primary hover:underline"
                                                >
                                                    {transaction.assetName}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                {transaction.type === "INCOME" ? (
                                                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-500 font-medium">
                                                        <ArrowUpCircle className="h-4 w-4" />
                                                        Ingreso
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-500 font-medium">
                                                        <ArrowDownCircle className="h-4 w-4" />
                                                        Gasto
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">
                                                {transaction.description || "-"}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                <span className={
                                                    transaction.type === "INCOME"
                                                        ? "text-green-700 dark:text-green-400"
                                                        : "text-red-700 dark:text-red-400"
                                                }>
                                                    {formatCurrency(Number(transaction.amount))}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando {startIndex + 1} - {Math.min(endIndex, filteredTransactions.length)} de {filteredTransactions.length}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Anterior
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Siguiente
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
