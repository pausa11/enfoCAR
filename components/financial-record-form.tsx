"use client";

import { useState } from "react";
import { Asset } from "@prisma/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
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

export function FinancialRecordForm({ assets, preselectedAssetId, onSuccess }: FinancialRecordFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [assetId, setAssetId] = useState(preselectedAssetId || "");
    const [type, setType] = useState<"INCOME" | "EXPENSE">("INCOME");
    const [amount, setAmount] = useState("");
    const [dateMode, setDateMode] = useState<"single" | "range">("single");
    const [startDate, setStartDate] = useState<Date>();
    const [endDate, setEndDate] = useState<Date>();
    const [description, setDescription] = useState("");

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

            // Reset form
            setAmount("");
            setStartDate(undefined);
            setEndDate(undefined);
            setDescription("");

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
                    Anota aquí la plata que generó o gastó tu nave
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

                    {/* Type Selection */}
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
