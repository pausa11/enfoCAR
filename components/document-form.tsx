"use client";

import { AssetDocument, DocumentType } from "@prisma/client";
import { useState, useEffect } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createMyAssetDocument, updateMyAssetDocument, deleteMyAssetDocument } from "@/app/actions/documents";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

interface DocumentFormProps {
    assetId: string;
    document?: AssetDocument | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DOCUMENT_TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
    { value: "SOAT", label: "SOAT" },
    { value: "TECNOMECANICA", label: "Tecnomecánica" },
    { value: "POLIZA_TODO_RIESGO", label: "Póliza Todo Riesgo" },
    { value: "IMPUESTO_VEHICULAR", label: "Impuesto Vehicular" },
    { value: "TARJETA_PROPIEDAD", label: "Tarjeta de Propiedad" },
    { value: "OTRO", label: "Otro" },
];

export function DocumentForm({ assetId, document, open, onOpenChange }: DocumentFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [formData, setFormData] = useState({
        type: "SOAT" as DocumentType,
        identifier: "",
        expirationDate: "",
        isActive: true,
    });

    useEffect(() => {
        if (document) {
            setFormData({
                type: document.type,
                identifier: document.identifier || "",
                expirationDate: document.expirationDate
                    ? new Date(document.expirationDate).toISOString().split("T")[0]
                    : "",
                isActive: document.isActive,
            });
        } else {
            setFormData({
                type: "SOAT",
                identifier: "",
                expirationDate: "",
                isActive: true,
            });
        }
    }, [document]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (document) {
                await updateMyAssetDocument({
                    id: document.id,
                    identifier: formData.identifier || undefined,
                    expirationDate: formData.expirationDate ? new Date(formData.expirationDate) : undefined,
                    isActive: formData.isActive,
                });
            } else {
                await createMyAssetDocument({
                    assetId,
                    type: formData.type,
                    identifier: formData.identifier || undefined,
                    expirationDate: formData.expirationDate ? new Date(formData.expirationDate) : undefined,
                    isActive: formData.isActive,
                });
            }

            router.refresh();
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving document:", error);
            alert("Error al guardar el documento. Por favor intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!document) return;

        if (!confirm("¿Estás seguro de que deseas eliminar este documento?")) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteMyAssetDocument(document.id);
            router.refresh();
            onOpenChange(false);
        } catch (error) {
            console.error("Error deleting document:", error);
            alert("Error al eliminar el documento. Por favor intenta de nuevo.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]" data-lenis-prevent>
                <DialogHeader>
                    <DialogTitle>{document ? "Editar Documento" : "Agregar Documento"}</DialogTitle>
                    <DialogDescription>
                        {document
                            ? "Actualiza la información del documento"
                            : "Agrega un nuevo documento para este vehículo"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo de Documento</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value as DocumentType })}
                                disabled={!!document}
                            >
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Selecciona un tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOCUMENT_TYPE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="identifier">Identificador (Opcional)</Label>
                            <Input
                                id="identifier"
                                placeholder="Ej: Número de póliza"
                                value={formData.identifier}
                                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="expirationDate">Fecha de Vencimiento (Opcional)</Label>
                            <Input
                                id="expirationDate"
                                type="date"
                                value={formData.expirationDate}
                                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="isActive">Documento Activo</Label>
                            <Switch
                                id="isActive"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        {document && (
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
