"use client";

import { MaintenanceRecord, MaintenanceType } from "@prisma/client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

interface MaintenanceFormProps {
    assetId: string;
    maintenance?: (Omit<MaintenanceRecord, "cost"> & { cost: number | MaintenanceRecord["cost"] }) | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
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

export function MaintenanceForm({ assetId, maintenance, open, onOpenChange }: MaintenanceFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        type: "CAMBIO_ACEITE_MOTOR" as MaintenanceType,
        description: "",
        cost: "",
        date: "",
        mileage: "",
        nextServiceDate: "",
        nextServiceMileage: "",
        notes: "",
        createExpense: true, // Default to creating expense
    });

    useEffect(() => {
        if (maintenance) {
            setFormData({
                type: maintenance.type,
                description: maintenance.description || "",
                cost: maintenance.cost.toString(),
                date: new Date(maintenance.date).toISOString().split("T")[0],
                mileage: maintenance.mileage?.toString() || "",
                nextServiceDate: maintenance.nextServiceDate
                    ? new Date(maintenance.nextServiceDate).toISOString().split("T")[0]
                    : "",
                nextServiceMileage: maintenance.nextServiceMileage?.toString() || "",
                notes: maintenance.notes || "",
                createExpense: false, // Don't create expense when editing
            });
        } else {
            setFormData({
                type: "CAMBIO_ACEITE_MOTOR",
                description: "",
                cost: "",
                date: new Date().toISOString().split("T")[0],
                mileage: "",
                nextServiceDate: "",
                nextServiceMileage: "",
                notes: "",
                createExpense: true, // Create expense by default for new records
            });
        }
    }, [maintenance]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                type: formData.type,
                description: formData.description || undefined,
                cost: parseFloat(formData.cost),
                date: formData.date,
                mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
                nextServiceDate: formData.nextServiceDate || undefined,
                nextServiceMileage: formData.nextServiceMileage ? parseInt(formData.nextServiceMileage) : undefined,
                notes: formData.notes || undefined,
                createExpense: formData.createExpense,
            };

            if (maintenance) {
                const response = await fetch(`/api/maintenance/${maintenance.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) throw new Error("Failed to update maintenance");
            } else {
                const response = await fetch(`/api/assets/${assetId}/maintenance`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) throw new Error("Failed to create maintenance");
            }

            router.refresh();
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving maintenance:", error);
            alert("Error al guardar el mantenimiento. Por favor intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!maintenance) return;

        if (!confirm("¿Estás seguro de que deseas eliminar este registro de mantenimiento?")) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/maintenance/${maintenance.id}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete maintenance");

            router.refresh();
            onOpenChange(false);
        } catch (error) {
            console.error("Error deleting maintenance:", error);
            alert("Error al eliminar el mantenimiento. Por favor intenta de nuevo.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" data-lenis-prevent>
                <DialogHeader>
                    <DialogTitle>{maintenance ? "Editar Mantenimiento" : "Agregar Mantenimiento"}</DialogTitle>
                    <DialogDescription>
                        {maintenance
                            ? "Actualiza la información del mantenimiento"
                            : "Agrega un nuevo registro de mantenimiento para este vehículo"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo de Mantenimiento</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value as MaintenanceType })}
                            >
                                <SelectTrigger id="type">
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

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción (Opcional)</Label>
                            <Input
                                id="description"
                                placeholder="Ej: Cambio de aceite Mobil 1"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cost">Costo *</Label>
                                <Input
                                    id="cost"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date">Fecha *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mileage">Kilometraje Actual (Opcional)</Label>
                            <Input
                                id="mileage"
                                type="number"
                                placeholder="Ej: 50000"
                                value={formData.mileage}
                                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                            />
                        </div>

                        <div className="border-t pt-4 space-y-4">
                            <h4 className="font-medium text-sm">Próximo Servicio (Opcional)</h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nextServiceDate">Fecha Estimada</Label>
                                    <Input
                                        id="nextServiceDate"
                                        type="date"
                                        value={formData.nextServiceDate}
                                        onChange={(e) => setFormData({ ...formData, nextServiceDate: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="nextServiceMileage">Kilometraje Estimado</Label>
                                    <Input
                                        id="nextServiceMileage"
                                        type="number"
                                        placeholder="Ej: 55000"
                                        value={formData.nextServiceMileage}
                                        onChange={(e) => setFormData({ ...formData, nextServiceMileage: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notas Adicionales (Opcional)</Label>
                            <Textarea
                                id="notes"
                                placeholder="Agrega cualquier información adicional..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                            />
                        </div>

                        {!maintenance && (
                            <div className="flex items-center space-x-2 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                                <Checkbox
                                    id="createExpense"
                                    checked={formData.createExpense}
                                    onCheckedChange={(checked) => setFormData({ ...formData, createExpense: checked as boolean })}
                                />
                                <div className="flex-1">
                                    <Label htmlFor="createExpense" className="cursor-pointer font-medium">
                                        Registrar como gasto automáticamente
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Se creará un registro de gasto vinculado con este mantenimiento
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        {maintenance && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting || isLoading}
                                className="mr-auto"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Eliminando...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Eliminar
                                    </>
                                )}
                            </Button>
                        )}
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                "Guardar"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
