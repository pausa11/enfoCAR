"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Calendar } from "lucide-react";

interface DriverSalaryManagerProps {
    assetId: string;
    driverName: string;
}

const MONTHS = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export function DriverSalaryManager({ assetId, driverName }: DriverSalaryManagerProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [salaryAmount, setSalaryAmount] = useState("");
    const [currentSalary, setCurrentSalary] = useState<number | null>(null);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    // Fetch current month's salary
    useEffect(() => {
        fetchCurrentSalary();
    }, [assetId]);

    const fetchCurrentSalary = async () => {
        try {
            const response = await fetch(
                `/api/driver-salaries?assetId=${assetId}&month=${currentMonth}&year=${currentYear}`
            );
            if (response.ok) {
                const salaries = await response.json();
                if (salaries.length > 0) {
                    setCurrentSalary(Number(salaries[0].amount));
                }
            }
        } catch (err) {
            console.error("Error fetching salary:", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        const cleanAmount = parseFloat(salaryAmount.replace(/\./g, ""));

        if (!cleanAmount || cleanAmount <= 0) {
            setError("El salario debe ser mayor a cero");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/driver-salaries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    assetId,
                    month: currentMonth,
                    year: currentYear,
                    amount: cleanAmount,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Error al guardar el salario");
            }

            // Success
            setCurrentSalary(cleanAmount);
            setOpen(false);
            setSalaryAmount("");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al guardar el salario");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Salario del Conductor
                    </CardTitle>
                    <CardDescription>
                        Gestiona el salario mensual de {driverName}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {MONTHS[currentMonth - 1]} {currentYear}
                            </p>
                            <p className="text-2xl font-bold mt-1">
                                {currentSalary ? formatCurrency(currentSalary) : "No configurado"}
                            </p>
                        </div>
                        <Button onClick={() => setOpen(true)}>
                            {currentSalary ? "Actualizar" : "Configurar"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>
                                {currentSalary ? "Actualizar" : "Configurar"} Salario
                            </DialogTitle>
                            <DialogDescription>
                                Salario de {driverName} para {MONTHS[currentMonth - 1]} {currentYear}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="salary">Salario Mensual</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                        $
                                    </span>
                                    <Input
                                        id="salary"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="1.500.000"
                                        value={salaryAmount}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const number = value.replace(/\D/g, "");
                                            const formatted = number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                            setSalaryAmount(formatted);
                                        }}
                                        className="pl-7"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="text-sm text-red-500">
                                    {error}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Guardando..." : "Guardar"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
