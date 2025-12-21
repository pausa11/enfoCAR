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
import { ProgressSteps } from "@/components/ui/progress-steps";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle, Upload, CheckCircle2, Briefcase, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Switch } from "@/components/ui/switch";
import { useSearchParams } from "next/navigation";

const VEHICLE_TYPES = [
    { value: "CARRO", label: "Carro" },
    { value: "JEEP", label: "Jeep" },
    { value: "BUSETA", label: "Buseta" },
    { value: "TURBO", label: "Turbo" },
];

const WIZARD_STEPS = [
    { number: 1, title: "Información Básica", description: "Lo esencial" },
    { number: 2, title: "Detalles del Vehículo", description: "Opcional" },
    { number: 3, title: "Conductor", description: "Opcional" },
];

export function CreateAssetWizard() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const vehicleType = searchParams.get('type'); // 'personal' or null

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Business/Personal toggle
    const [isBusinessAsset, setIsBusinessAsset] = useState(vehicleType !== 'personal');

    // Step 1: Required fields
    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [ownershipPercentage, setOwnershipPercentage] = useState("100");

    // Step 2: Vehicle details (optional)
    const [marca, setMarca] = useState("");
    const [color, setColor] = useState("");
    const [modelo, setModelo] = useState("");
    const [año, setAño] = useState("");
    const [placa, setPlaca] = useState("");
    const [kilometraje, setKilometraje] = useState("");
    const [assetValue, setAssetValue] = useState("");

    // Step 3: Driver (optional)
    const [conductor, setConductor] = useState("");
    const [driverPercentage, setDriverPercentage] = useState("0");
    const [driverPaymentMode, setDriverPaymentMode] = useState<"PERCENTAGE" | "FIXED_SALARY">("PERCENTAGE");

    // Validation for Step 1
    const isStep1Valid = () => {
        if (isBusinessAsset) {
            return name.trim() !== "" && type !== "" && ownershipPercentage !== "";
        }
        return name.trim() !== "" && type !== "";
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNext = () => {
        setError("");

        if (currentStep === 1 && !isStep1Valid()) {
            setError("Por favor completa todos los campos obligatorios (marcados con *)");
            return;
        }

        if (currentStep < (isBusinessAsset ? 3 : 2)) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        setError("");
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setError("");

        if (!isStep1Valid()) {
            setError("¡Ey! Necesitamos que nos digas el nombre y tipo de tu nave");
            setCurrentStep(1);
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
                    isBusinessAsset,
                    ownershipPercentage: isBusinessAsset ? ownershipPercentage : 100,
                    value: assetValue ? parseFloat(assetValue.replace(/\./g, "")) : null,
                    driverPercentage: isBusinessAsset ? parseFloat(driverPercentage) : 0,
                    driverPaymentMode: isBusinessAsset && conductor ? driverPaymentMode : null,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "¡Uy! Algo salió mal al crear tu nave");
            }

            // Success - redirect to appropriate list
            router.refresh();
            router.push(isBusinessAsset ? "/app/activos" : "/app/vehiculos-personales");
        } catch (err) {
            setError(err instanceof Error ? err.message : "¡Uy! Algo salió mal al crear tu nave");
        } finally {
            setLoading(false);
        }
    };

    return (
        <TooltipProvider>
            <Card className="w-full max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>¡Registra tu Nave!</CardTitle>
                    <CardDescription>
                        Te vamos a guiar paso a paso para que agregues tu carro al parqueadero
                    </CardDescription>
                    <ProgressSteps steps={WIZARD_STEPS} currentStep={currentStep} />
                </CardHeader>

                <CardContent className="min-h-[400px]">
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <div className="grid gap-6 animate-in fade-in-50 duration-300">
                            {/* Business/Personal Toggle */}
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                                <div className="flex items-center gap-3">
                                    {isBusinessAsset ? (
                                        <Briefcase className="h-5 w-5 text-primary" />
                                    ) : (
                                        <Home className="h-5 w-5 text-primary" />
                                    )}
                                    <div>
                                        <Label className="text-base font-semibold">
                                            {isBusinessAsset ? "Vehículo de Negocio" : "Vehículo Personal"}
                                        </Label>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {isBusinessAsset
                                                ? "Genera ingresos y tiene gastos asociados"
                                                : "Para uso personal, sin seguimiento financiero"}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    id="asset-type-switch"
                                    checked={isBusinessAsset}
                                    onCheckedChange={setIsBusinessAsset}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name" className="flex items-center gap-2">
                                    ¿Cómo le dices a tu nave? <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="asset-name-input"
                                    placeholder="Ej: La Poderosa, El Rayo, Mi Camionetita"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={name ? "border-green-500" : ""}
                                />
                                {name && (
                                    <div className="flex items-center gap-1 text-sm text-green-600">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>¡Buen nombre!</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="image">Foto de tu Nave</Label>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => document.getElementById("image")?.click()}
                                            className="w-full"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            {imageFile ? "Cambiar foto" : "Subir foto"}
                                        </Button>
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </div>
                                    {imagePreview && (
                                        <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-green-500">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Sube una foto de tu nave para identificarla mejor
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="type">
                                    ¿Qué tipo de carro es? <span className="text-red-500">*</span>
                                </Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger id="asset-type-select" className={type ? "border-green-500" : ""}>
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

                            {isBusinessAsset && (
                                <div className="grid gap-2">
                                    <Label htmlFor="ownershipPercentage" className="flex items-center gap-2">
                                        ¿Qué porcentaje te pertenece? (%) <span className="text-red-500">*</span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                                <p>Si eres el único dueño, deja 100%. Si compartes la nave con alguien más, pon solo el porcentaje que es tuyo. Por ejemplo, si la nave es 50/50 con otra persona, pon 50.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </Label>
                                    <Input
                                        id="asset-ownership-input"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        placeholder="100"
                                        value={ownershipPercentage}
                                        onChange={(e) => setOwnershipPercentage(e.target.value)}
                                        className={ownershipPercentage ? "border-green-500" : ""}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Si es compartido, pon el porcentaje que es tuyo
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Vehicle Details */}
                    {currentStep === 2 && (
                        <div className="grid gap-6 animate-in fade-in-50 duration-300">
                            <div className="text-center mb-4">
                                <p className="text-sm text-muted-foreground">
                                    Estos campos son opcionales, pero nos ayudan a tener más info de tu nave
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="assetValue" className="flex items-center gap-2">
                                    ¿Cuánto vale la nave?
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                            <p>El valor total de la nave. Esto nos ayuda a calcular cuánto vale tu participación.</p>
                                        </TooltipContent>
                                    </Tooltip>
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
                                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-md text-sm border border-green-200 dark:border-green-800">
                                        <span className="text-muted-foreground">Tu participación vale: </span>
                                        <span className="font-semibold text-green-700 dark:text-green-400">
                                            {new Intl.NumberFormat("es-CO", {
                                                style: "currency",
                                                currency: "COP",
                                                maximumFractionDigits: 0
                                            }).format((parseFloat(assetValue.replace(/\./g, "")) * parseFloat(ownershipPercentage)) / 100)}
                                        </span>
                                    </div>
                                )}
                            </div>

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
                                        onChange={(e) => setPlaca(e.target.value.toUpperCase())}
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
                    )}

                    {/* Step 3: Driver */}
                    {currentStep === 3 && (
                        <div className="grid gap-6 animate-in fade-in-50 duration-300">
                            <div className="text-center mb-4">
                                <p className="text-sm text-muted-foreground">
                                    Si tu nave tiene un conductor asignado, podés agregarlo acá
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="conductor">Nombre del Conductor</Label>
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
                                        <Label htmlFor="driverPaymentMode" className="flex items-center gap-2">
                                            Modo de Pago del Conductor
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent className="max-w-xs">
                                                    <p><strong>Porcentaje:</strong> El conductor gana un % de las ganancias del vehículo.</p>
                                                    <p className="mt-2"><strong>Salario Fijo:</strong> El conductor recibe un monto fijo cada mes.</p>
                                                </TooltipContent>
                                            </Tooltip>
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
                                        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md border border-blue-200 dark:border-blue-800">
                                            <p className="text-sm text-blue-800 dark:text-blue-200">
                                                💡 Podrás configurar el salario mensual del conductor después de crear el activo.
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}

                            {!conductor && (
                                <div className="p-6 bg-muted rounded-lg text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Si no tenés conductor asignado, podés dejar esto vacío y agregarlo después
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                        {currentStep > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                disabled={loading}
                            >
                                ← Atrás
                            </Button>
                        )}
                        {currentStep === 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.back()}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {currentStep < (isBusinessAsset ? 3 : 2) && (
                            <Button
                                type="button"
                                onClick={handleNext}
                                disabled={loading}
                            >
                                Siguiente →
                            </Button>
                        )}
                        {(currentStep === 3 || (currentStep === 2 && !isBusinessAsset)) && (
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? "Guardando tu nave..." : "¡Listo, guardar!"}
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </TooltipProvider>
    );
}
