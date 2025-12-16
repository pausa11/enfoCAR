import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FinancialRecordForm } from "@/components/financial-record-form";
import { FinancialRecordsList } from "@/components/financial-records-list";
import { FinancialSummary } from "@/components/financial-summary";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AssetFinancesPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    // Await params in Next.js 15
    const { id } = await params;

    // Fetch the asset
    const asset = await prisma.asset.findFirst({
        where: {
            id: id,
            userId: user.id,
        },
    });

    if (!asset) {
        return redirect("/app/activos");
    }

    // Fetch all financial records for this asset
    const records = await prisma.financialRecord.findMany({
        where: {
            assetId: id,
        },
        orderBy: {
            date: "desc",
        },
    });

    // Convert Decimal to number for client components
    const recordsWithNumbers = records.map(record => ({
        ...record,
        amount: Number(record.amount),
    }));

    return (
        <div className="flex-1 w-full flex flex-col gap-6 sm:gap-8 p-8 sm:p-12 md:p-16">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link href="/app/activos">
                    <Button variant="ghost" className="gap-2 -ml-2">
                        <ArrowLeft className="h-4 w-4" />
                        Volver a Mis Naves
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">{asset.name}</h1>
                    <p className="text-muted-foreground mt-1">
                        Gestiona la plata que genera y gasta esta nave
                    </p>
                </div>
            </div>

            {/* Financial Summary */}
            <FinancialSummary
                records={recordsWithNumbers}
                ownershipPercentage={asset.ownershipPercentage}
            />

            {/* Form and List Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Form */}
                <div className="lg:sticky lg:top-8">
                    <FinancialRecordForm
                        assets={[asset]}
                        preselectedAssetId={asset.id}
                    />
                </div>

                {/* Records List */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Historial de Movimientos</h2>
                    <FinancialRecordsList records={recordsWithNumbers} />
                </div>
            </div>
        </div>
    );
}
