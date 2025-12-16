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

import { createClient } from "@/lib/supabase/client";

export function CreateAssetForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);

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
    const [conductor, setConductor] = useState("");

    const [ownershipPercentage, setOwnershipPercentage] = useState("100");
    const [assetValue, setAssetValue] = useState("");
    const [driverPercentage, setDriverPercentage] = useState("0");
    const [driverPaymentMode, setDriverPaymentMode] = useState<"PERCENTAGE" | "FIXED_SALARY">("PERCENTAGE");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name || !type) {
            setError("¡Ey! Necesitamos que nos digas el nombre y tipo de tu nave");
            return;
        }

        setLoading(true);

        try {
            let imageUrl = null;

            if (imageFile) {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) throw new Error("¡Uy! Parece que no estás logueado, bacan");

                const fileExt = imageFile.name.split(".").pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from("assets")
                    .upload(fileName, imageFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from("assets")
                    .getPublicUrl(fileName);

                imageUrl = publicUrl;
            }
            // Build custom attributes object
            const customAttributes: Record<string, string> = {};
            if (marca) customAttributes.marca = marca;
            if (color) customAttributes.color = color;
            if (modelo) customAttributes.modelo = modelo;
            if (año) customAttributes.año = año;
            if (placa) customAttributes.placa = placa;
            if (kilometraje) customAttributes.kilometraje = kilometraje;
            if (conductor) customAttributes.conductor = conductor;

            const response = await fetch("/api/assets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    type,
                    imageUrl,
                    customAttributes: Object.keys(customAttributes).length > 0 ? customAttributes : null,
                    ownershipPercentage,
                    value: assetValue ? parseFloat(assetValue.replace(/\./g, "")) : null,
                    driverPercentage: parseFloat(driverPercentage),
                    driverPaymentMode: conductor ? driverPaymentMode : null,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "¡Uy! Algo salió mal al crear tu nave");
            }

            // Success - redirect to list
            router.refresh();
            router.push("/app/activos");
        } catch (err) {
            setError(err instanceof Error ? err.message : "¡Uy! Algo salió mal al crear tu nave");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>¡Registra tu Nave!</CardTitle>
                <CardDescription>
                    Dale, agrega tu carro al parqueadero. Los campos con * son los que sí o sí necesitamos, ¿vale?
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="grid gap-6">
                    <div className="grid gap-4">
                        {/* Required Fields */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                ¿Cómo le dices a tu nave? <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="Ej: La Poderosa, El Rayo, Mi Camionetita"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="image">Foto de tu Nave</Label>
                            <Input
                                id="image"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setImageFile(file);
                                }}
                            />
                            <p className="text-xs text-muted-foreground">
                                Sube una foto de tu nave para identificarla mejor.
                            </p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type">
                                ¿Qué tipo de carro es? <span className="text-red-500">*</span>
                            </Label>
                            <Select value={type} onValueChange={setType} required>
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Elegí el tipo de nave" />
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
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="ownershipPercentage">
                            ¿Qué porcentaje te pertenece? (%) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="ownershipPercentage"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="100"
                            value={ownershipPercentage}
                            onChange={(e) => setOwnershipPercentage(e.target.value)}
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Si es compartido, pon el porcentaje que es tuyo.
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="assetValue">
                            ¿Cuánto vale la nave? (Opcional)
                        </Label>
                        <Input
                            id="assetValue"
                            type="text"
                            inputMode="numeric"
                            placeholder="Ej: 50.000.000"
                            value={assetValue}
                            onChange={(e) => {
                                const value = e.target.value;
                                const number = value.replace(/\D/g, "");
                                const formatted = number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                setAssetValue(formatted);
                            }}
                        />
                        {assetValue && ownershipPercentage && (
                            <div className="p-3 bg-muted rounded-md text-sm">
                                <span className="text-muted-foreground">Tu participación vale: </span>
                                <span className="font-semibold text-green-600">
                                    {new Intl.NumberFormat("es-CO", {
                                        style: "currency",
                                        currency: "COP",
                                        maximumFractionDigits: 0
                                    }).format((parseFloat(assetValue.replace(/\./g, "")) * parseFloat(ownershipPercentage)) / 100)}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Custom Attributes */}
                    <div className="border-t pt-4">
                        <h4 className="text-sm font-medium mb-3">Más Detalles de tu Carro (Si querés)</h4>

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

                            <div className="grid gap-2">
                                <Label htmlFor="conductor">Conductor</Label>
                                <Input
                                    id="conductor"
                                    placeholder="Ej: Juan Pérez"
                                    value={conductor}
                                    onChange={(e) => setConductor(e.target.value)}
                                />
                            </div>

                            {conductor && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="driverPaymentMode">
                                            Modo de Pago del Conductor
                                        </Label>
                                        <Select
                                            value={driverPaymentMode}
                                            onValueChange={(value) => setDriverPaymentMode(value as "PERCENTAGE" | "FIXED_SALARY")}
                                        >
                                            <SelectTrigger id="driverPaymentMode">
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
                                            <Label htmlFor="driverPercentage">
                                                % de Ganancia del Conductor
                                            </Label>
                                            <Input
                                                id="driverPercentage"
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
                                                💡 Podrás configurar el salario mensual del conductor después de crear el activo.
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
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
                        Mejor no
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Guardando tu nave..." : "¡Listo, guardar!"}
                    </Button>
                </CardFooter>
            </form>
        </Card >
    );
}
