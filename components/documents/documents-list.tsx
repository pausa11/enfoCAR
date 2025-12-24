"use client";

import { AssetDocument, DocumentType } from "@prisma/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, FileText, AlertCircle, CheckCircle, Clock, Shield, Wrench, Building2, CreditCard, FileCheck } from "lucide-react";
import { DocumentForm } from "@/components/documents/document-form"
import { ParticleCard } from "@/components/reactBits/MagicBento";


interface DocumentsListProps {
    assetId: string;
    documents: AssetDocument[];
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


function getExpirationStatus(expirationDate: Date | null) {
    if (!expirationDate) return { status: "none", label: "Sin vencimiento", color: "text-muted-foreground" };

    const now = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiration = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration < 0) {
        return { status: "expired", label: "Vencido", color: "text-red-500", icon: AlertCircle };
    } else if (daysUntilExpiration <= 30) {
        return { status: "expiring", label: `Vence en ${daysUntilExpiration} días`, color: "text-yellow-500", icon: Clock };
    } else {
        return { status: "valid", label: "Vigente", color: "text-green-500", icon: CheckCircle };
    }
}

export function DocumentsList({ assetId, documents }: DocumentsListProps) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState<AssetDocument | null>(null);

    const handleEdit = (doc: AssetDocument) => {
        setEditingDocument(doc);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingDocument(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Documentos</h2>
                <Button onClick={() => setIsFormOpen(true)} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Agregar Documento
                </Button>
            </div>

            {documents.length === 0 ? (
                <ParticleCard
                    className="border rounded-lg p-8 text-center text-muted-foreground"
                    particleCount={0}
                    clickEffect={false}
                >
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No hay documentos registrados</p>
                    <p className="text-sm mt-2">Agrega documentos para llevar control de sus vencimientos</p>
                </ParticleCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc) => {
                        const status = getExpirationStatus(doc.expirationDate);
                        const StatusIcon = status.icon;
                        const docIcon = getDocumentIcon(doc.type);

                        return (
                            <ParticleCard
                                key={doc.id}
                                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                particleCount={0}
                                clickEffect={true}
                                enableMagnetism={true}
                            >
                                {/* Header with Icon */}
                                <div className={`${docIcon.bgColor} p-4 flex items-center justify-between`}>
                                    <div className="flex items-center gap-3">
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
                                            <span className="text-xs font-medium">{status.label}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <div className="space-y-2 text-sm">
                                        {doc.identifier && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Identificador:</span>
                                                <span className="font-medium">{doc.identifier}</span>
                                            </div>
                                        )}
                                        {doc.expirationDate && (
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Vencimiento:</span>
                                                <span className="font-medium">
                                                    {new Date(doc.expirationDate).toLocaleDateString("es-CO", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Estado:</span>
                                            <span className={`font-medium ${doc.isActive ? "text-green-500" : "text-gray-500"}`}>
                                                {doc.isActive ? "Activo" : "Inactivo"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(doc)}
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

            <DocumentForm
                assetId={assetId}
                document={editingDocument}
                open={isFormOpen}
                onOpenChange={handleCloseForm}
            />
        </div>
    );
}
