"use client";

import { AssetDocument, DocumentType, AssetType } from "@prisma/client";
import { useState, useMemo } from "react";
import { FileText, AlertCircle, CheckCircle, Clock, Shield, Wrench, Building2, CreditCard, FileCheck, Plus, X } from "lucide-react";
import { ParticleCard } from "@/components/reactBits/MagicBento";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { DocumentForm } from "@/components/documents/document-form";
import { CheckExpiringDocumentsButton } from "@/components/documents/check-expiring-documents-button";
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

interface DocumentWithAsset extends AssetDocument {
    asset: {
        id: string;
        name: string;
        type: AssetType;
        customAttributes: any;
    };
}

interface DocumentsOverviewProps {
    documents: DocumentWithAsset[];
    assets: {
        id: string;
        name: string;
        type: AssetType;
        customAttributes: any;
    }[];
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
    SOAT: "SOAT",
    TECNOMECANICA: "Tecnomecánica",
    POLIZA_TODO_RIESGO: "Póliza Todo Riesgo",
    IMPUESTO_VEHICULAR: "Impuesto Vehicular",
    TARJETA_PROPIEDAD: "Tarjeta de Propiedad",
    OTRO: "Otro",
};

type DocumentIconConfig = {
    icon?: React.ComponentType<{ className?: string }>;
    image?: string;
    color: string;
    bgColor: string;
};

function getDocumentIcon(type: DocumentType): DocumentIconConfig {
    const iconMap = {
        SOAT: { image: "/soat-logo.png", color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-950" },
        TECNOMECANICA: { icon: Wrench, color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-950" },
        POLIZA_TODO_RIESGO: { icon: Shield, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-950" },
        IMPUESTO_VEHICULAR: { icon: Building2, color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-950" },
        TARJETA_PROPIEDAD: { icon: CreditCard, color: "text-indigo-600", bgColor: "bg-indigo-100 dark:bg-indigo-950" },
        OTRO: { icon: FileCheck, color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-950" },
    };
    return iconMap[type];
}

type ExpirationStatus = {
    status: "expired" | "expiring" | "valid" | "none";
    label: string;
    color: string;
    icon?: React.ComponentType<{ className?: string }>;
    daysUntilExpiration?: number;
};

function getExpirationStatus(expirationDate: Date | null): ExpirationStatus {
    if (!expirationDate) return { status: "none", label: "Sin vencimiento", color: "text-muted-foreground" };

    const now = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiration = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration < 0) {
        return {
            status: "expired",
            label: "Vencido",
            color: "text-red-500",
            icon: AlertCircle,
            daysUntilExpiration
        };
    } else if (daysUntilExpiration <= 30) {
        return {
            status: "expiring",
            label: `Vence en ${daysUntilExpiration} día${daysUntilExpiration !== 1 ? 's' : ''}`,
            color: "text-yellow-500",
            icon: Clock,
            daysUntilExpiration
        };
    } else {
        return {
            status: "valid",
            label: "Vigente",
            color: "text-green-500",
            icon: CheckCircle,
            daysUntilExpiration
        };
    }
}

type FilterType = "all" | "expired" | "expiring" | "valid";

export function DocumentsOverview({ documents, assets }: DocumentsOverviewProps) {
    const [filter, setFilter] = useState<FilterType>("all");
    const [isAssetSelectionOpen, setIsAssetSelectionOpen] = useState(false);
    const [isDocumentFormOpen, setIsDocumentFormOpen] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState<string>("");
    const router = useRouter();

    const handleCreateDocument = () => {
        if (assets.length === 0) {
            alert("Necesitas tener al menos un vehículo para agregar documentos.");
            return;
        }

        if (assets.length === 1) {
            setSelectedAssetId(assets[0].id);
            setIsDocumentFormOpen(true);
        } else {
            setIsAssetSelectionOpen(true);
        }
    };

    const handleAssetSelect = (assetId: string) => {
        setSelectedAssetId(assetId);
        setIsAssetSelectionOpen(false);
        setIsDocumentFormOpen(true);
    };

    const filteredDocuments = useMemo(() => {
        if (filter === "all") return documents;

        return documents.filter(doc => {
            const status = getExpirationStatus(doc.expirationDate);
            return status.status === filter;
        });
    }, [documents, filter]);

    const statusCounts = useMemo(() => {
        const counts = {
            all: documents.length,
            expired: 0,
            expiring: 0,
            valid: 0,
        };

        documents.forEach(doc => {
            const status = getExpirationStatus(doc.expirationDate);
            if (status.status === "expired") counts.expired++;
            else if (status.status === "expiring") counts.expiring++;
            else if (status.status === "valid") counts.valid++;
        });

        return counts;
    }, [documents]);

    const handleDocumentClick = (assetId: string) => {
        router.push(`/app/activos/${assetId}/documentos`);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-bold mb-2">Mis Documentos</h1>
                    <p className="text-lg text-muted-foreground">
                        Vista general de todos los documentos de tus vehículos
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <CheckExpiringDocumentsButton />
                    <Button onClick={handleCreateDocument} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Agregar Documento
                    </Button>
                </div>
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
                    variant={filter === "expired" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("expired")}
                    className={filter === "expired" ? "" : "border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"}
                >
                    Vencidos ({statusCounts.expired})
                </Button>
                <Button
                    variant={filter === "expiring" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("expiring")}
                    className={filter === "expiring" ? "" : "border-yellow-500 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950"}
                >
                    Por Vencer ({statusCounts.expiring})
                </Button>
                <Button
                    variant={filter === "valid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("valid")}
                    className={filter === "valid" ? "" : "border-green-500 text-green-500 hover:bg-green-50 dark:hover:bg-green-950"}
                >
                    Vigentes ({statusCounts.valid})
                </Button>
            </div>

            {/* Documents Grid */}
            {filteredDocuments.length === 0 ? (
                <ParticleCard
                    className="border rounded-lg p-12 text-center text-muted-foreground"
                    particleCount={0}
                    clickEffect={false}
                >
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-semibold mb-2">
                        {filter === "all"
                            ? "No hay documentos registrados"
                            : `No hay documentos ${filter === "expired" ? "vencidos" : filter === "expiring" ? "por vencer" : "vigentes"}`
                        }
                    </p>
                    <p className="text-sm">
                        {filter === "all"
                            ? "Agrega documentos a tus vehículos para llevar control de sus vencimientos"
                            : "Cambia el filtro para ver otros documentos"
                        }
                    </p>
                </ParticleCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocuments.map((doc) => {
                        const status = getExpirationStatus(doc.expirationDate);
                        const StatusIcon = status.icon;
                        const docIcon = getDocumentIcon(doc.type);
                        const plate = doc.asset.customAttributes?.placa || "Sin placa";

                        return (
                            <ParticleCard
                                key={doc.id}
                                className="border rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                                particleCount={0}
                                clickEffect={true}
                                enableMagnetism={true}
                                onClick={() => handleDocumentClick(doc.asset.id)}
                            >
                                {/* Header with Icon */}
                                <div className={`${docIcon.bgColor} p-4`}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`${docIcon.color} p-2 bg-white dark:bg-gray-800 rounded-lg`}>
                                            {docIcon.image ? (
                                                <img
                                                    src={docIcon.image}
                                                    alt={DOCUMENT_TYPE_LABELS[doc.type]}
                                                    className="h-6 w-auto"
                                                />
                                            ) : docIcon.icon && (
                                                <docIcon.icon className="h-6 w-6" />
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-lg">{DOCUMENT_TYPE_LABELS[doc.type]}</h3>
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
                                            <span className="font-medium">{doc.asset.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Placa:</span>
                                            <span className="font-mono font-medium">{plate}</span>
                                        </div>
                                    </div>

                                    {/* Document Details */}
                                    <div className="pt-3 border-t space-y-1">
                                        {doc.identifier && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Identificador:</span>
                                                <span className="text-sm font-medium">{doc.identifier}</span>
                                            </div>
                                        )}
                                        {doc.expirationDate && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-muted-foreground">Vencimiento:</span>
                                                <span className="text-sm font-medium">
                                                    {new Date(doc.expirationDate).toLocaleDateString("es-CO", {
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
                            Elige el vehículo al cual deseas agregar el documento.
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
                    <DocumentForm
                        assetId={selectedAssetId}
                        open={isDocumentFormOpen}
                        onOpenChange={(open) => {
                            setIsDocumentFormOpen(open);
                            if (!open) setSelectedAssetId("");
                        }}
                    />
                )
            }
        </div >
    );
}
