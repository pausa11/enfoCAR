"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format, isToday, isThisWeek, isThisMonth, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Trash2, TrendingUp, TrendingDown, Calendar, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
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

type GroupedRecords = {
    today: FinancialRecord[];
    thisWeek: FinancialRecord[];
    thisMonth: FinancialRecord[];
    older: FinancialRecord[];
};

export function FinancialRecordsList({ records, showAssetName = false }: FinancialRecordsListProps) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

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
        return format(d, "d 'de' MMMM", { locale: es });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Group records by time period
    const groupedRecords = useMemo(() => {
        const groups: GroupedRecords = {
            today: [],
            thisWeek: [],
            thisMonth: [],
            older: [],
        };

        records.forEach((record) => {
            const recordDate = typeof record.date === "string" ? new Date(record.date) : record.date;

            if (isToday(recordDate)) {
                groups.today.push(record);
            } else if (isThisWeek(recordDate, { weekStartsOn: 1 })) {
                groups.thisWeek.push(record);
            } else if (isThisMonth(recordDate)) {
                groups.thisMonth.push(record);
            } else {
                groups.older.push(record);
            }
        });

        return groups;
    }, [records]);

    // Calculate totals for each group
    const calculateGroupTotal = (groupRecords: FinancialRecord[]) => {
        return groupRecords.reduce((total, record) => {
            return record.type === "INCOME"
                ? total + Number(record.amount)
                : total - Number(record.amount);
        }, 0);
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

    const renderGroup = (title: string, groupRecords: FinancialRecord[], showTotal: boolean = true) => {
        if (groupRecords.length === 0) return null;

        const total = calculateGroupTotal(groupRecords);

        return (
            <div key={title} className="mb-8">
                {/* Group Header */}
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        {title}
                    </h3>
                    {showTotal && (
                        <span className={`text-sm font-semibold tabular-nums ${total >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}>
                            {total >= 0 ? "+" : ""}{formatCurrency(total)}
                        </span>
                    )}
                </div>

                {/* Timeline Container */}
                <div className="relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-border via-border to-transparent" />

                    {/* Records */}
                    <div className="space-y-1">
                        {groupRecords.map((record, index) => {
                            const isIncome = record.type === "INCOME";
                            const hasDateRange = !!record.endDate;
                            const isHovered = hoveredId === record.id;

                            return (
                                <div
                                    key={record.id}
                                    className={`relative pl-12 pr-4 py-3 rounded-lg transition-all duration-200 ${isHovered
                                            ? "bg-accent/50 shadow-sm"
                                            : "hover:bg-accent/30"
                                        }`}
                                    onMouseEnter={() => setHoveredId(record.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                >
                                    {/* Timeline Dot */}
                                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full border-2 transition-all duration-200 ${isIncome
                                            ? "bg-green-500 border-green-600 dark:bg-green-400 dark:border-green-500"
                                            : "bg-red-500 border-red-600 dark:bg-red-400 dark:border-red-500"
                                        } ${isHovered ? "scale-125 shadow-md" : ""}`} />

                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left Content */}
                                        <div className="flex-1 min-w-0 space-y-1">
                                            {/* Amount and Icon */}
                                            <div className="flex items-center gap-2">
                                                {isIncome ? (
                                                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                                ) : (
                                                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                                                )}
                                                <span className={`text-base font-semibold tabular-nums ${isIncome
                                                        ? "text-green-700 dark:text-green-400"
                                                        : "text-red-700 dark:text-red-400"
                                                    }`}>
                                                    {isIncome ? "+" : "-"} {formatCurrency(Number(record.amount))}
                                                </span>
                                            </div>

                                            {/* Description */}
                                            {record.description && (
                                                <p className="text-sm text-foreground font-medium truncate">
                                                    {record.description}
                                                </p>
                                            )}

                                            {/* Date and Asset Name */}
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {hasDateRange ? (
                                                        <span>
                                                            {formatDate(record.date)} - {formatDate(record.endDate!)}
                                                        </span>
                                                    ) : (
                                                        <span>{formatDate(record.date)}</span>
                                                    )}
                                                </div>

                                                {showAssetName && record.asset && (
                                                    <span className="font-medium text-foreground/70">
                                                        • {record.asset.name}
                                                    </span>
                                                )}

                                                {/* Maintenance Link Badge */}
                                                {record.maintenanceRecord && (
                                                    <Badge variant="outline" className="gap-1 h-5 px-1.5 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400">
                                                        <Wrench className="h-2.5 w-2.5" />
                                                        <span className="text-[10px]">Mantenimiento</span>
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>

                                        {/* Delete Button - Shows on hover */}
                                        <div className={`flex-shrink-0 transition-opacity duration-200 ${isHovered ? "opacity-100" : "opacity-0"
                                            }`}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(record.id)}
                                                disabled={deletingId === record.id}
                                                className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                <span className="sr-only">Eliminar</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {renderGroup("Hoy", groupedRecords.today)}
            {renderGroup("Esta Semana", groupedRecords.thisWeek)}
            {renderGroup("Este Mes", groupedRecords.thisMonth)}
            {renderGroup("Anteriores", groupedRecords.older)}
        </div>
    );
}
