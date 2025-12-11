"use client";

import { useState } from "react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

const VEHICLE_TYPES = [
    { value: "CARRO", label: "Carro" },
    { value: "JEEP", label: "Jeep" },
    { value: "BUSETA", label: "Buseta" },
    { value: "TURBO", label: "Turbo" },
];

export function CreateAssetForm() {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Required fields
    const [name, setName] = useState("");
    const [type, setType] = useState("");

    // Custom attributes
    const [marca, setMarca] = useState("");
    const [color, setColor] = useState("");
    const [modelo, setModelo] = useState("");
    const [año, setAño] = useState("");
    const [placa, setPlaca] = useState("");
    const [kilometraje, setKilometraje] = useState("");

    const resetForm = () => {
        setName("");
        setType("");
        setMarca("");
        setColor("");
        setModelo("");
        setAño("");
        setPlaca("");
        setKilometraje("");
        setError("");
    };

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

            const response = await fetch("/api/assets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    type,
                    customAttributes: Object.keys(customAttributes).length > 0 ? customAttributes : null,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Error al crear el activo");
            }

            // Success - close dialog and refresh
            setOpen(false);
            resetForm();
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al crear el activo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Crear Nuevo Activo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Crear Nuevo Activo</DialogTitle>
                        <DialogDescription>
                            Agrega un nuevo vehículo a tu inventario. Los campos marcados son obligatorios.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* Required Fields */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Nombre del Activo <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="Ej: Camioneta de Transporte"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">
                                Tipo de Vehículo <span className="text-red-500">*</span>
                            </Label>
                            <Select value={type} onValueChange={setType} required>
                                <SelectTrigger id="type">
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
                                    <Label htmlFor="marca">Marca</Label>
                                    <Input
                                        id="marca"
                                        placeholder="Ej: Toyota, Chevrolet"
                                        value={marca}
                                        onChange={(e) => setMarca(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="color">Color</Label>
                                    <Input
                                        id="color"
                                        placeholder="Ej: Blanco, Rojo"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="modelo">Modelo</Label>
                                    <Input
                                        id="modelo"
                                        placeholder="Ej: Hilux, Spark"
                                        value={modelo}
                                        onChange={(e) => setModelo(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="año">Año</Label>
                                    <Input
                                        id="año"
                                        type="number"
                                        placeholder="Ej: 2020"
                                        value={año}
                                        onChange={(e) => setAño(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="placa">Placa</Label>
                                    <Input
                                        id="placa"
                                        placeholder="Ej: ABC-123"
                                        value={placa}
                                        onChange={(e) => setPlaca(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="kilometraje">Kilometraje</Label>
                                    <Input
                                        id="kilometraje"
                                        type="number"
                                        placeholder="Ej: 50000"
                                        value={kilometraje}
                                        onChange={(e) => setKilometraje(e.target.value)}
                                    />
                                </div>
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
                            onClick={() => {
                                setOpen(false);
                                resetForm();
                            }}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creando..." : "Crear Activo"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
