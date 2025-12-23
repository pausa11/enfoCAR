"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Edit, Trash2, TrendingUp, TrendingDown, Calendar, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    date: Date | string;
    endDate?: Date | string | null;
    description?: string | null;
    asset?: {
        id: string;
        name: string;
        type: string;
    };
    maintenanceRecord?: {
        id: string;
        type: string;
        description?: string | null;
    } | null;
}

interface FinancialRecordsListProps {
    records: FinancialRecord[];
    showAssetName?: boolean;
}

export function FinancialRecordsList({ records, showAssetName = false }: FinancialRecordsListProps) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm("¿Seguro que quieres borrar este registro, parce?")) {
            return;
        }

        setDeletingId(id);
        try {
            const response = await fetch(`/api/financial-records/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Error al eliminar el registro");
            }

            router.refresh();
        } catch (error) {
            alert("¡Uy! No se pudo borrar el registro");
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (date: Date | string) => {
        const d = typeof date === "string" ? new Date(date) : date;
        return format(d, "d 'de' MMMM, yyyy", { locale: es });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (records.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                        Todavía no hay movimientos registrados, parce.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        ¡Empieza a anotar la plata que genera o gasta tu nave!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-3">
            {records.map((record) => {
                const isIncome = record.type === "INCOME";
                const hasDateRange = !!record.endDate;

                return (
                    <Card
                        key={record.id}
                        className={`border-l-4 ${isIncome
                            ? "border-l-green-500 bg-green-50/50 dark:bg-green-950/20"
                            : "border-l-red-500 bg-red-50/50 dark:bg-red-950/20"
                            }`}
                    >
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                    {/* Amount and Type */}
                                    <div className="flex items-center gap-2">
                                        {isIncome ? (
                                            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                                        )}
                                        <span
                                            className={`text-xl font-bold ${isIncome
                                                ? "text-green-700 dark:text-green-400"
                                                : "text-red-700 dark:text-red-400"
                                                }`}
                                        >
                                            {isIncome ? "+" : "-"} {formatCurrency(Number(record.amount))}
                                        </span>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        {hasDateRange ? (
                                            <span>
                                                Del {formatDate(record.date)} al {formatDate(record.endDate!)}
                                            </span>
                                        ) : (
                                            <span>{formatDate(record.date)}</span>
                                        )}
                                    </div>

                                    {/* Asset Name */}
                                    {showAssetName && record.asset && (
                                        <div className="text-sm font-medium">
                                            {record.asset.name}
                                        </div>
                                    )}

                                    {/* Description */}
                                    {record.description && (
                                        <p className="text-sm text-muted-foreground">
                                            {record.description}
                                        </p>
                                    )}

                                    {/* Maintenance Link Badge */}
                                    {record.maintenanceRecord && (
                                        <Badge variant="outline" className="gap-1 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400">
                                            <Wrench className="h-3 w-3" />
                                            Vinculado a mantenimiento
                                        </Badge>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(record.id)}
                                        disabled={deletingId === record.id}
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Eliminar</span>
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
