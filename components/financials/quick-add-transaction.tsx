"use client";

import { Asset } from "@prisma/client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { FinancialRecordForm } from "@/components/financials/financial-record-form";

// Type for serialized asset
type SerializedAsset = Omit<Asset, 'value'> & {
    value: number | null;
};

interface QuickAddTransactionProps {
    assets: SerializedAsset[];
}

export function QuickAddTransaction({ assets }: QuickAddTransactionProps) {
    const [open, setOpen] = useState(false);

    const handleSuccess = () => {
        setOpen(false);
        // Refresh the page to show new data
        window.location.reload();
    };

    if (assets.length === 0) {
        return null; // Don't show button if no assets
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Agregar Movimiento
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Agregar Movimiento Financiero</DialogTitle>
                    <DialogDescription>
                        Registra un nuevo ingreso o gasto para uno de tus vehículos
                    </DialogDescription>
                </DialogHeader>
                <FinancialRecordForm
                    assets={assets}
                    onSuccess={handleSuccess}
                />
            </DialogContent>
        </Dialog>
    );
}
