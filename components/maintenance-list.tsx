"use client";

import { MaintenanceRecord, MaintenanceType } from "@prisma/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Wrench, AlertCircle, CheckCircle, Clock, Droplet, Disc, Filter, CircleDot, AlignVerticalJustifyCenter, Battery, Package, FileText, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MaintenanceForm } from "@/components/maintenance-form";
import { ParticleCard } from "@/components/MagicBento";

interface MaintenanceWithFinancials extends MaintenanceRecord {
    financialRecords?: { id: string; amount: number }[];
}

interface MaintenanceListProps {
    assetId: string;
    maintenanceRecords: MaintenanceWithFinancials[];
}

const MAINTENANCE_TYPE_LABELS: Record<MaintenanceType, string> = {
    CAMBIO_ACEITE_MOTOR: "Cambio de Aceite de Motor",
    CAMBIO_ACEITE_TRANSMISION: "Cambio de Aceite de Transmisión",
    CAMBIO_LLANTAS: "Cambio de Llantas",
    CAMBIO_FILTROS: "Cambio de Filtros",
    REVISION_FRENOS: "Revisión de Frenos",
    ALINEACION_BALANCEO: "Alineación y Balanceo",
    BATERIA: "Batería",
    REPUESTOS: "Repuestos",
    OTRO: "Otro",
};

type MaintenanceIconConfig = {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
};

function getMaintenanceIcon(type: MaintenanceType): MaintenanceIconConfig {
    const iconMap: Record<MaintenanceType, MaintenanceIconConfig> = {
        CAMBIO_ACEITE_MOTOR: { icon: Droplet, color: "text-amber-600", bgColor: "bg-amber-100 dark:bg-amber-950" },
        CAMBIO_ACEITE_TRANSMISION: { icon: Droplet, color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-950" },
        CAMBIO_LLANTAS: { icon: Disc, color: "text-slate-600", bgColor: "bg-slate-100 dark:bg-slate-950" },
        CAMBIO_FILTROS: { icon: Filter, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-950" },
        REVISION_FRENOS: { icon: CircleDot, color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-950" },
        ALINEACION_BALANCEO: { icon: AlignVerticalJustifyCenter, color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-950" },
        BATERIA: { icon: Battery, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-950" },
        REPUESTOS: { icon: Package, color: "text-indigo-600", bgColor: "bg-indigo-100 dark:bg-indigo-950" },
        OTRO: { icon: Wrench, color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-950" },
    };
    return iconMap[type];
}

function getNextServiceStatus(nextServiceDate: Date | null, nextServiceMileage: number | null) {
    if (!nextServiceDate && !nextServiceMileage) {
        return { status: "none", label: "Sin próximo servicio", color: "text-muted-foreground", icon: null };
    }

    if (nextServiceDate) {
        const now = new Date();
        const serviceDate = new Date(nextServiceDate);
        const daysUntilService = Math.ceil((serviceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilService < 0) {
            return { status: "overdue", label: "Servicio vencido", color: "text-red-500", icon: AlertCircle };
        } else if (daysUntilService <= 30) {
            return { status: "upcoming", label: `Próximo en ${daysUntilService} días`, color: "text-yellow-500", icon: Clock };
        } else {
            return { status: "scheduled", label: "Programado", color: "text-green-500", icon: CheckCircle };
        }
    }

    return { status: "scheduled", label: "Programado", color: "text-green-500", icon: CheckCircle };
}

export function MaintenanceList({ assetId, maintenanceRecords }: MaintenanceListProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceRecord | null>(null);

    const handleEdit = (maintenance: MaintenanceRecord) => {
        setEditingMaintenance(maintenance);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingMaintenance(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold">Mantenimientos</h2>
                <Button onClick={() => setIsFormOpen(true)} size="sm" className="gap-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Agregar Mantenimiento
                </Button>
            </div>

            {maintenanceRecords.length === 0 ? (
                <ParticleCard
                    className="border rounded-lg p-8 text-center text-muted-foreground"
                    particleCount={0}
                    clickEffect={false}
                >
                    <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No hay mantenimientos registrados</p>
                    <p className="text-sm mt-2">Agrega mantenimientos para llevar control de tu vehículo</p>
                </ParticleCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {maintenanceRecords.map((maintenance) => {
                        const status = getNextServiceStatus(maintenance.nextServiceDate, maintenance.nextServiceMileage);
                        const StatusIcon = status.icon;
                        const maintenanceIcon = getMaintenanceIcon(maintenance.type);
                        const MaintenanceIcon = maintenanceIcon.icon;

                        return (
                            <ParticleCard
                                key={maintenance.id}
                                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                particleCount={0}
                                clickEffect={true}
                                enableMagnetism={true}
                            >
                                {/* Header with Icon */}
                                <div className={`${maintenanceIcon.bgColor} p-4 flex items-center justify-between`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`${maintenanceIcon.color} p-2 bg-white dark:bg-gray-800 rounded-lg`}>
                                            <MaintenanceIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{MAINTENANCE_TYPE_LABELS[maintenance.type]}</h3>
                                            {maintenance.description && (
                                                <p className="text-xs text-muted-foreground">{maintenance.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    {StatusIcon && (
                                        <div className={`flex items-center gap-1 ${status.color}`}>
                                            <StatusIcon className="h-4 w-4" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Costo:</span>
                                            <span className="font-medium">
                                                ${parseFloat(maintenance.cost.toString()).toLocaleString("es-CO", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Fecha:</span>
                                            <span className="font-medium">
                                                {new Date(maintenance.date).toLocaleDateString("es-CO", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        {maintenance.mileage && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Kilometraje:</span>
                                                <span className="font-medium">{maintenance.mileage.toLocaleString("es-CO")} km</span>
                                            </div>
                                        )}

                                        {(maintenance.nextServiceDate || maintenance.nextServiceMileage) && (
                                            <div className="border-t pt-2 mt-2">
                                                <p className="text-xs font-medium text-muted-foreground mb-1">Próximo Servicio:</p>
                                                {maintenance.nextServiceDate && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Fecha:</span>
                                                        <span className={`font-medium ${status.color}`}>
                                                            {new Date(maintenance.nextServiceDate).toLocaleDateString("es-CO", {
                                                                year: "numeric",
                                                                month: "short",
                                                                day: "numeric",
                                                            })}
                                                        </span>
                                                    </div>
                                                )}
                                                {maintenance.nextServiceMileage && (
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Kilometraje:</span>
                                                        <span className="font-medium">{maintenance.nextServiceMileage.toLocaleString("es-CO")} km</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {maintenance.notes && (
                                            <div className="border-t pt-2 mt-2">
                                                <p className="text-xs text-muted-foreground">Notas:</p>
                                                <p className="text-xs mt-1">{maintenance.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Expense Link Badge */}
                                    {maintenance.financialRecords && maintenance.financialRecords.length > 0 && (
                                        <div className="border-t pt-2 mt-2">
                                            <Badge variant="outline" className="gap-1 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-700 dark:text-green-400">
                                                <DollarSign className="h-3 w-3" />
                                                Gasto registrado
                                            </Badge>
                                        </div>
                                    )}

                                    <div className="mt-4 pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(maintenance)}
                                            className="w-full"
                                        >
                                            Editar
                                        </Button>
                                    </div>
                                </div>
                            </ParticleCard>
                        );
                    })}
                </div>
            )}

            <MaintenanceForm
                assetId={assetId}
                maintenance={editingMaintenance}
                open={isFormOpen}
                onOpenChange={handleCloseForm}
            />
        </div>
    );
}
