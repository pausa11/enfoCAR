"use client";

import { useState } from "react";
import { Asset, MaintenanceType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { TrendingUp, TrendingDown, Calendar, Wrench } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Type for asset with Decimal converted to number for client components
type SerializedAsset = Omit<Asset, 'value'> & {
    value: number | null;
};

interface FinancialRecordFormProps {
    assets: SerializedAsset[];
    preselectedAssetId?: string;
    onSuccess?: () => void;
}

const MAINTENANCE_TYPE_OPTIONS: { value: MaintenanceType; label: string }[] = [
    { value: "CAMBIO_ACEITE_MOTOR", label: "Cambio de Aceite de Motor" },
    { value: "CAMBIO_ACEITE_TRANSMISION", label: "Cambio de Aceite de Transmisión" },
    { value: "CAMBIO_LLANTAS", label: "Cambio de Llantas" },
    { value: "CAMBIO_FILTROS", label: "Cambio de Filtros" },
    { value: "REVISION_FRENOS", label: "Revisión de Frenos" },
    { value: "ALINEACION_BALANCEO", label: "Alineación y Balanceo" },
    { value: "BATERIA", label: "Batería" },
    { value: "REPUESTOS", label: "Repuestos" },
    { value: "OTRO", label: "Otro" },
];

export function FinancialRecordForm({ assets, preselectedAssetId, onSuccess }: FinancialRecordFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Determine if the preselected asset is a business asset
    const preselectedAsset = assets.find(a => a.id === preselectedAssetId);
    const isBusinessAsset = preselectedAsset?.isBusinessAsset ?? true;

    // Form state
    const [assetId, setAssetId] = useState(preselectedAssetId || "");
    const [type, setType] = useState<"INCOME" | "EXPENSE">(isBusinessAsset ? "INCOME" : "EXPENSE");
    const [amount, setAmount] = useState("");
    const [dateMode, setDateMode] = useState<"single" | "range">("single");
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [description, setDescription] = useState("");

    // Maintenance creation state
    const [createMaintenance, setCreateMaintenance] = useState(false);
    const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>("CAMBIO_ACEITE_MOTOR");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            // Validation
            if (!assetId) {
                setError("¡Ey parce! Tienes que elegir una nave");
                setIsLoading(false);
                return;
            }

            const cleanAmount = parseFloat(amount.replace(/\./g, ""));

            if (!cleanAmount || cleanAmount <= 0) {
                setError("¡Ojo! La plata tiene que ser mayor a cero");
                setIsLoading(false);
                return;
            }

            if (!startDate) {
                setError("¡No olvides la fecha, llave!");
                setIsLoading(false);
                return;
            }

            if (dateMode === "range" && !endDate) {
                setError("¡Falta la fecha final del rango, parcero!");
                setIsLoading(false);
                return;
            }

            // If creating maintenance for an expense, validate single date mode
            if (createMaintenance && type === "EXPENSE" && dateMode === "range") {
                setError("Para crear un mantenimiento, usa un solo día (no rango de fechas)");
                setIsLoading(false);
                return;
            }

            // First, create the financial record
            const response = await fetch("/api/financial-records", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    assetId,
                    type,
                    amount: cleanAmount,
                    date: startDate.toISOString(),
                    endDate: dateMode === "range" && endDate ? endDate.toISOString() : null,
                    description: description || null,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Error al crear el registro");
            }

            const financialRecord = await response.json();

            // If creating maintenance for an expense, create it and link it
            if (createMaintenance && type === "EXPENSE") {
                const maintenanceResponse = await fetch(`/api/assets/${assetId}/maintenance`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        type: maintenanceType,
                        description: description || undefined,
                        cost: cleanAmount,
                        date: startDate.toISOString(),
                        createExpense: false, // Don't create another expense
                    }),
                });

                if (maintenanceResponse.ok) {
                    const maintenanceData = await maintenanceResponse.json();
                    // Link the financial record to the maintenance
                    if (maintenanceData.maintenanceRecord) {
                        await fetch(`/api/financial-records/${financialRecord.id}`, {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                                maintenanceRecordId: maintenanceData.maintenanceRecord.id,
                            }),
                        });
                    }
                }
            }

            // Reset form
            setAmount("");
            setStartDate(undefined);
            setEndDate(undefined);
            setDescription("");
            setCreateMaintenance(false);

            // Refresh the page data
            router.refresh();

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "¡Uy! Algo salió mal");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle className="text-2xl">Registrar Movimiento</CardTitle>
                <CardDescription>
                    {isBusinessAsset
                        ? "Anota aquí la plata que generó o gastó tu nave"
                        : "Anota aquí los gastos de tu vehículo personal"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Asset Selection */}
                    {!preselectedAssetId && (
                        <div className="space-y-2">
                            <Label htmlFor="asset">¿Cuál nave?</Label>
                            <Select value={assetId} onValueChange={setAssetId}>
                                <SelectTrigger id="asset">
                                    <SelectValue placeholder="Elige tu carro" />
                                </SelectTrigger>
                                <SelectContent>
                                    {assets.map((asset) => (
                                        <SelectItem key={asset.id} value={asset.id}>
                                            {asset.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Type Selection - Only show for business assets */}
                    {isBusinessAsset ? (
                        <div className="space-y-2">
                            <Label>¿Qué pasó?</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    type="button"
                                    variant={type === "INCOME" ? "default" : "outline"}
                                    className={type === "INCOME" ? "bg-green-500 hover:bg-green-600" : ""}
                                    onClick={() => setType("INCOME")}
                                >
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    Generó plata
                                </Button>
                                <Button
                                    type="button"
                                    variant={type === "EXPENSE" ? "default" : "outline"}
                                    className={type === "EXPENSE" ? "bg-red-500 hover:bg-red-600" : ""}
                                    onClick={() => setType("EXPENSE")}
                                >
                                    <TrendingDown className="mr-2 h-4 w-4" />
                                    Gastó plata
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label>Tipo de movimiento</Label>
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 flex items-center gap-2">
                                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                                <span className="text-sm font-medium text-red-900 dark:text-red-100">Solo gastos (vehículo personal)</span>
                            </div>
                        </div>
                    )}

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="amount">¿Cuánta plata?</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                $
                            </span>
                            <Input
                                id="amount"
                                type="text"
                                inputMode="numeric"
                                placeholder="150.000"
                                value={amount}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Remove non-digits
                                    const number = value.replace(/\D/g, "");
                                    // Format with thousands separator
                                    const formatted = number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                    setAmount(formatted);
                                }}
                                className="pl-7"
                            />
                        </div>
                    </div>

                    {/* Date Mode Toggle */}
                    <div className="space-y-2">
                        <Label>¿Cuándo fue?</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                type="button"
                                variant={dateMode === "single" ? "default" : "outline"}
                                onClick={() => setDateMode("single")}
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                Un solo día
                            </Button>
                            <Button
                                type="button"
                                variant={dateMode === "range" ? "default" : "outline"}
                                onClick={() => setDateMode("range")}
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                Varios días
                            </Button>
                        </div>
                    </div>

                    {/* Date Pickers */}
                    {dateMode === "single" ? (
                        <div className="space-y-2">
                            <Label htmlFor="date">Fecha</Label>
                            <DatePicker
                                date={startDate}
                                onDateChange={setStartDate}
                                placeholder="Selecciona el día"
                            />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Desde</Label>
                                <DatePicker
                                    date={startDate}
                                    onDateChange={setStartDate}
                                    placeholder="Fecha inicial"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">Hasta</Label>
                                <DatePicker
                                    date={endDate}
                                    onDateChange={setEndDate}
                                    placeholder="Fecha final"
                                />
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Notas (opcional)</Label>
                        <Input
                            id="description"
                            placeholder="Ej: Viaje a Medellín, mantenimiento, etc."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Create Maintenance Option - Only for expenses */}
                    {type === "EXPENSE" && dateMode === "single" && (
                        <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="createMaintenance"
                                    checked={createMaintenance}
                                    onCheckedChange={(checked) => setCreateMaintenance(checked as boolean)}
                                />
                                <div className="flex-1">
                                    <Label htmlFor="createMaintenance" className="cursor-pointer font-medium flex items-center gap-2">
                                        <Wrench className="h-4 w-4" />
                                        Registrar como mantenimiento
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Se creará un registro de mantenimiento vinculado con este gasto
                                    </p>
                                </div>
                            </div>

                            {createMaintenance && (
                                <div className="space-y-2 pt-2 border-t border-blue-200 dark:border-blue-900">
                                    <Label htmlFor="maintenanceType">Tipo de Mantenimiento</Label>
                                    <Select
                                        value={maintenanceType}
                                        onValueChange={(value) => setMaintenanceType(value as MaintenanceType)}
                                    >
                                        <SelectTrigger id="maintenanceType">
                                            <SelectValue placeholder="Selecciona un tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MAINTENANCE_TYPE_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Guardando..." : "Guardar Movimiento"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
