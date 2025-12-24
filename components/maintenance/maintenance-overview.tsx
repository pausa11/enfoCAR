"use client";

import { MaintenanceRecord, MaintenanceType, AssetType } from "@prisma/client";
import { useState, useMemo } from "react";
import { Wrench, AlertCircle, CheckCircle, Clock, Droplet, Disc, Filter, CircleDot, AlignVerticalJustifyCenter, Battery, Package, Plus, X } from "lucide-react";
import { ParticleCard } from "@/components/reactBits/MagicBento";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface MaintenanceWithAsset extends Omit<MaintenanceRecord, 'cost'> {
    cost: number; // Converted from Decimal in the server component
    asset: {
        id: string;
        name: string;
        type: AssetType;
        customAttributes: any;
    };
}

interface MaintenanceOverviewProps {
    maintenanceRecords: MaintenanceWithAsset[];
    assets: {
        id: string;
        name: string;
        type: AssetType;
        customAttributes: any;
    }[];
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

type ServiceStatus = {
    status: "overdue" | "upcoming" | "scheduled" | "none";
    label: string;
    color: string;
    icon?: React.ComponentType<{ className?: string }>;
    daysUntilService?: number;
};

function getServiceStatus(nextServiceDate: Date | null, nextServiceMileage: number | null): ServiceStatus {
    if (!nextServiceDate && !nextServiceMileage) {
        return { status: "none", label: "Sin próximo servicio", color: "text-muted-foreground" };
    }

    if (nextServiceDate) {
        const now = new Date();
        const serviceDate = new Date(nextServiceDate);
        const daysUntilService = Math.ceil((serviceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilService < 0) {
            return {
                status: "overdue",
                label: "Vencido",
                color: "text-red-500",
                icon: AlertCircle,
                daysUntilService
            };
        } else if (daysUntilService <= 30) {
            return {
                status: "upcoming",
                label: `Próximo en ${daysUntilService} día${daysUntilService !== 1 ? 's' : ''}`,
                color: "text-yellow-500",
                icon: Clock,
                daysUntilService
            };
        } else {
            return {
                status: "scheduled",
                label: "Programado",
                color: "text-green-500",
                icon: CheckCircle,
                daysUntilService
            };
        }
    }

    return { status: "scheduled", label: "Programado", color: "text-green-500", icon: CheckCircle };
}

type FilterType = "all" | "overdue" | "upcoming" | "recent";

export function MaintenanceOverview({ maintenanceRecords, assets }: MaintenanceOverviewProps) {
    const [filter, setFilter] = useState<FilterType>("all");
    const [isAssetSelectionOpen, setIsAssetSelectionOpen] = useState(false);
    const [isMaintenanceFormOpen, setIsMaintenanceFormOpen] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState<string>("");
    const router = useRouter();

    const handleCreateMaintenance = () => {
        if (assets.length === 0) {
            alert("Necesitas tener al menos un vehículo para agregar mantenimientos.");
            return;
        }

        if (assets.length === 1) {
            setSelectedAssetId(assets[0].id);
            setIsMaintenanceFormOpen(true);
        } else {
            setIsAssetSelectionOpen(true);
        }
    };

    const handleAssetSelect = (assetId: string) => {
        setSelectedAssetId(assetId);
        setIsAssetSelectionOpen(false);
        setIsMaintenanceFormOpen(true);
    };

    const filteredRecords = useMemo(() => {
        if (filter === "all") return maintenanceRecords;

        return maintenanceRecords.filter(record => {
            const status = getServiceStatus(record.nextServiceDate, record.nextServiceMileage);

            if (filter === "overdue") return status.status === "overdue";
            if (filter === "upcoming") return status.status === "upcoming";
            if (filter === "recent") return status.status === "none"; // No next service scheduled

            return false;
        });
    }, [maintenanceRecords, filter]);

    const statusCounts = useMemo(() => {
        const counts = {
            all: maintenanceRecords.length,
            overdue: 0,
            upcoming: 0,
            recent: 0,
        };

        maintenanceRecords.forEach(record => {
            const status = getServiceStatus(record.nextServiceDate, record.nextServiceMileage);
            if (status.status === "overdue") counts.overdue++;
            else if (status.status === "upcoming") counts.upcoming++;
            else if (status.status === "none") counts.recent++;
        });

        return counts;
    }, [maintenanceRecords]);

    const handleMaintenanceClick = (assetId: string) => {
        router.push(`/app/activos/${assetId}/mantenimientos`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-2">Mantenimientos</h1>
                    <p className="text-lg text-muted-foreground">
                        Vista general de todos los mantenimientos de tus vehículos
                    </p>
                </div>
                <Button onClick={handleCreateMaintenance} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Agregar Mantenimiento
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                >
                    Todos ({statusCounts.all})
                </Button>
                <Button
                    variant={filter === "overdue" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("overdue")}
                    className={filter === "overdue" ? "" : "border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"}
                >
                    Vencidos ({statusCounts.overdue})
                </Button>
                <Button
                    variant={filter === "upcoming" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("upcoming")}
                    className={filter === "upcoming" ? "" : "border-yellow-500 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950"}
                >
                    Próximos ({statusCounts.upcoming})
                </Button>
                <Button
                    variant={filter === "recent" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("recent")}
                    className={filter === "recent" ? "" : "border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"}
                >
                    Recientes ({statusCounts.recent})
                </Button>
            </div>

            {/* Maintenance Grid */}
            {filteredRecords.length === 0 ? (
                <ParticleCard
                    className="border rounded-lg p-12 text-center text-muted-foreground"
                    particleCount={0}
                    clickEffect={false}
                >
                    <Wrench className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-semibold mb-2">
                        {filter === "all"
                            ? "No hay mantenimientos registrados"
                            : `No hay mantenimientos ${filter === "overdue" ? "vencidos" : filter === "upcoming" ? "próximos" : "recientes"}`
                        }
                    </p>
                    <p className="text-sm">
                        {filter === "all"
                            ? "Agrega mantenimientos a tus vehículos para llevar control"
                            : "Cambia el filtro para ver otros mantenimientos"
                        }
                    </p>
                </ParticleCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRecords.map((record) => {
                        const status = getServiceStatus(record.nextServiceDate, record.nextServiceMileage);
                        const StatusIcon = status.icon;
                        const maintenanceIcon = getMaintenanceIcon(record.type);
                        const MaintenanceIcon = maintenanceIcon.icon;
                        const plate = record.asset.customAttributes?.placa || "Sin placa";

                        return (
                            <ParticleCard
                                key={record.id}
                                className="border rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                                particleCount={0}
                                clickEffect={true}
                                enableMagnetism={true}
                                onClick={() => handleMaintenanceClick(record.asset.id)}
                            >
                                {/* Header with Icon */}
                                <div className={`${maintenanceIcon.bgColor} p-4`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`${maintenanceIcon.color} p-2 bg-white dark:bg-gray-800 rounded-lg`}>
                                            <MaintenanceIcon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">{MAINTENANCE_TYPE_LABELS[record.type]}</h3>
                                            {record.description && (
                                                <p className="text-xs text-muted-foreground">{record.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    {StatusIcon && (
                                        <div className={`flex items-center gap-1 ${status.color}`}>
                                            <StatusIcon className="h-4 w-4" />
                                            <span className="text-sm font-medium">{status.label}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-3">
                                    {/* Vehicle Info */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Vehículo:</span>
                                            <span className="font-medium">{record.asset.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Placa:</span>
                                            <span className="font-mono font-medium">{plate}</span>
                                        </div>
                                    </div>

                                    {/* Maintenance Details */}
                                    <div className="pt-3 border-t space-y-1">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Costo:</span>
                                            <span className="text-sm font-medium">
                                                ${parseFloat(record.cost.toString()).toLocaleString("es-CO", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Fecha:</span>
                                            <span className="text-sm font-medium">
                                                {new Date(record.date).toLocaleDateString("es-CO", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        {record.mileage && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Kilometraje:</span>
                                                <span className="text-sm font-medium">{record.mileage.toLocaleString("es-CO")} km</span>
                                            </div>
                                        )}
                                        {record.nextServiceDate && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Próximo servicio:</span>
                                                <span className={`text-sm font-medium ${status.color}`}>
                                                    {new Date(record.nextServiceDate).toLocaleDateString("es-CO", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Click hint */}
                                    <div className="pt-3 border-t">
                                        <p className="text-xs text-muted-foreground text-center">
                                            Click para ver detalles del vehículo
                                        </p>
                                    </div>
                                </div>
                            </ParticleCard>
                        );
                    })}
                </div>
            )}

            <Dialog open={isAssetSelectionOpen} onOpenChange={setIsAssetSelectionOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Seleccionar Vehículo</DialogTitle>
                        <DialogDescription>
                            Elige el vehículo al cual deseas agregar el registro de mantenimiento.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Vehículo</Label>
                            {assets.map((asset) => (
                                <Button
                                    key={asset.id}
                                    variant="outline"
                                    className="w-full justify-start h-auto py-3 px-4"
                                    onClick={() => handleAssetSelect(asset.id)}
                                >
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="font-medium">{asset.name}</span>
                                        {asset.customAttributes?.placa && (
                                            <span className="text-xs text-muted-foreground">
                                                Placa: {asset.customAttributes.placa}
                                            </span>
                                        )}
                                    </div>
                                </Button>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {
                selectedAssetId && (
                    <MaintenanceForm
                        assetId={selectedAssetId}
                        open={isMaintenanceFormOpen}
                        onOpenChange={(open) => {
                            setIsMaintenanceFormOpen(open);
                            if (!open) setSelectedAssetId("");
                        }}
                    />
                )
            }
        </div >
    );
}
