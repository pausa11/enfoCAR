"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Asset } from "@prisma/client";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const VEHICLE_TYPES = [
    { value: "CARRO", label: "Carro" },
    { value: "JEEP", label: "Jeep" },
    { value: "BUSETA", label: "Buseta" },
    { value: "TURBO", label: "Turbo" },
];

// Type for asset with Decimal converted to number for client components
type SerializedAsset = Omit<Asset, 'value'> & {
    value: number | null;
};

interface EditAssetDialogProps {
    asset: SerializedAsset;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditAssetDialog({ asset, open, onOpenChange }: EditAssetDialogProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Required fields
    const [name, setName] = useState(asset.name);
    const [type, setType] = useState(asset.type);

    // Custom attributes
    const customAttrs = (asset.customAttributes as Record<string, string> | null) || {};
    const [marca, setMarca] = useState(customAttrs.marca || "");
    const [color, setColor] = useState(customAttrs.color || "");
    const [modelo, setModelo] = useState(customAttrs.modelo || "");
    const [año, setAño] = useState(customAttrs.año || "");
    const [placa, setPlaca] = useState(customAttrs.placa || "");
    const [kilometraje, setKilometraje] = useState(customAttrs.kilometraje || "");
    const [conductor, setConductor] = useState(customAttrs.conductor || "");
    const [driverPercentage, setDriverPercentage] = useState(asset.driverPercentage.toString());
    const [driverPaymentMode, setDriverPaymentMode] = useState<"PERCENTAGE" | "FIXED_SALARY">(asset.driverPaymentMode || "PERCENTAGE");

    // Reset form when asset changes
    useEffect(() => {
        setName(asset.name);
        setType(asset.type);
        const attrs = (asset.customAttributes as Record<string, string> | null) || {};
        setMarca(attrs.marca || "");
        setColor(attrs.color || "");
        setModelo(attrs.modelo || "");
        setAño(attrs.año || "");
        setPlaca(attrs.placa || "");
        setKilometraje(attrs.kilometraje || "");
        setConductor(attrs.conductor || "");
        setDriverPercentage(asset.driverPercentage.toString());
        setDriverPaymentMode(asset.driverPaymentMode || "PERCENTAGE");
        setError("");
    }, [asset]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name || !type) {
            setError("El nombre y tipo de vehículo son obligatorios");
            return;
        }

        setLoading(true);

        try {
            // Build custom attributes object
            const customAttributes: Record<string, string> = {};
            if (marca) customAttributes.marca = marca;
            if (color) customAttributes.color = color;
            if (modelo) customAttributes.modelo = modelo;
            if (año) customAttributes.año = año;
            if (placa) customAttributes.placa = placa;
            if (kilometraje) customAttributes.kilometraje = kilometraje;
            if (conductor) customAttributes.conductor = conductor;

            const response = await fetch(`/api/assets/${asset.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    type,
                    customAttributes: Object.keys(customAttributes).length > 0 ? customAttributes : null,
                    driverPercentage: parseFloat(driverPercentage),
                    driverPaymentMode: conductor ? driverPaymentMode : null,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Error al actualizar el activo");
            }

            // Success - close dialog and refresh
            onOpenChange(false);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al actualizar el activo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Editar Activo</DialogTitle>
                        <DialogDescription>
                            Actualiza la información del activo. Los campos marcados son obligatorios.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Required Fields */}
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">
                                Nombre del Activo <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit-name"
                                placeholder="Ej: Camioneta de Transporte"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="edit-type">
                                Tipo de Vehículo <span className="text-red-500">*</span>
                            </Label>
                            <Select value={type} onValueChange={(value) => setType(value as typeof type)} required>
                                <SelectTrigger id="edit-type">
                                    <SelectValue placeholder="Selecciona un tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {VEHICLE_TYPES.map((vehicle) => (
                                        <SelectItem key={vehicle.value} value={vehicle.value}>
                                            {vehicle.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Custom Attributes */}
                        <div className="border-t pt-4 mt-2">
                            <h4 className="text-sm font-medium mb-3">Atributos Personalizados (Opcionales)</h4>

                            <div className="grid gap-3">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-marca">Marca</Label>
                                    <Input
                                        id="edit-marca"
                                        placeholder="Ej: Toyota, Chevrolet"
                                        value={marca}
                                        onChange={(e) => setMarca(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-color">Color</Label>
                                    <Input
                                        id="edit-color"
                                        placeholder="Ej: Blanco, Rojo"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-modelo">Modelo</Label>
                                    <Input
                                        id="edit-modelo"
                                        placeholder="Ej: Hilux, Spark"
                                        value={modelo}
                                        onChange={(e) => setModelo(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-año">Año</Label>
                                    <Input
                                        id="edit-año"
                                        type="number"
                                        placeholder="Ej: 2020"
                                        value={año}
                                        onChange={(e) => setAño(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-placa">Placa</Label>
                                    <Input
                                        id="edit-placa"
                                        placeholder="Ej: ABC-123"
                                        value={placa}
                                        onChange={(e) => setPlaca(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-kilometraje">Kilometraje</Label>
                                    <Input
                                        id="edit-kilometraje"
                                        type="number"
                                        placeholder="Ej: 50000"
                                        value={kilometraje}
                                        onChange={(e) => setKilometraje(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="edit-conductor">Conductor</Label>
                                    <Input
                                        id="edit-conductor"
                                        placeholder="Ej: Juan Pérez"
                                        value={conductor}
                                        onChange={(e) => setConductor(e.target.value)}
                                    />
                                </div>

                                {conductor && (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-driverPaymentMode">
                                                Modo de Pago del Conductor
                                            </Label>
                                            <Select
                                                value={driverPaymentMode}
                                                onValueChange={(value) => setDriverPaymentMode(value as "PERCENTAGE" | "FIXED_SALARY")}
                                            >
                                                <SelectTrigger id="edit-driverPaymentMode">
                                                    <SelectValue placeholder="Selecciona el modo de pago" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="PERCENTAGE">Porcentaje de Ganancias</SelectItem>
                                                    <SelectItem value="FIXED_SALARY">Salario Fijo Mensual</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {driverPaymentMode === "PERCENTAGE" && (
                                            <div className="grid gap-2">
                                                <Label htmlFor="edit-driverPercentage">
                                                    % de Ganancia del Conductor
                                                </Label>
                                                <Input
                                                    id="edit-driverPercentage"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    placeholder="30"
                                                    value={driverPercentage}
                                                    onChange={(e) => setDriverPercentage(e.target.value)}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Porcentaje de las ganancias que le corresponde al conductor
                                                </p>
                                            </div>
                                        )}

                                        {driverPaymentMode === "FIXED_SALARY" && (
                                            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md text-sm">
                                                <p className="text-blue-800 dark:text-blue-200">
                                                    💡 Configura el salario mensual en la página del activo.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-500 mb-4">
                            {error}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
