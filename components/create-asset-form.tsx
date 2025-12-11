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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const VEHICLE_TYPES = [
    { value: "CARRO", label: "Carro" },
    { value: "JEEP", label: "Jeep" },
    { value: "BUSETA", label: "Buseta" },
    { value: "TURBO", label: "Turbo" },
];

export function CreateAssetForm() {
    const router = useRouter();
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

            // Success - redirect to list
            router.refresh();
            router.push("/app/activos");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al crear el activo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Crear Nuevo Activo</CardTitle>
                <CardDescription>
                    Agrega un nuevo vehículo a tu inventario. Los campos marcados son obligatorios.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-6">
                    <div className="grid gap-4">
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
                        <div className="border-t pt-4">
                            <h4 className="text-sm font-medium mb-3">Atributos Personalizados (Opcionales)</h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="marca">Marca</Label>
                                    <Input
                                        id="marca"
                                        placeholder="Ej: Toyota"
                                        value={marca}
                                        onChange={(e) => setMarca(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="modelo">Modelo</Label>
                                    <Input
                                        id="modelo"
                                        placeholder="Ej: Hilux"
                                        value={modelo}
                                        onChange={(e) => setModelo(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="color">Color</Label>
                                    <Input
                                        id="color"
                                        placeholder="Ej: Blanco"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
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
                        <div className="text-sm text-red-500">
                            {error}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Creando..." : "Crear Activo"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
