"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Asset } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

// Type for asset with Decimal converted to number for client components
type SerializedAsset = Omit<Asset, 'value'> & {
    value: number | null;
};

interface DeleteAssetDialogProps {
    asset: SerializedAsset;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteAssetDialog({ asset, open, onOpenChange }: DeleteAssetDialogProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleDelete = async () => {
        setError("");
        setLoading(true);

        try {
            const response = await fetch(`/api/assets/${asset.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Error al eliminar el activo");
            }

            // Success - close dialog and refresh
            onOpenChange(false);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al eliminar el activo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        <DialogTitle>Eliminar Activo</DialogTitle>
                    </div>
                    <DialogDescription className="pt-2">
                        ¿Estás seguro de que deseas eliminar <strong>{asset.name}</strong>?
                        <br />
                        <br />
                        Esta acción no se puede deshacer y también eliminará todos los registros financieros asociados a este activo.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="text-sm text-red-500">
                        {error}
                    </div>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? "Eliminando..." : "Eliminar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
