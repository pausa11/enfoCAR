import { redirect } from "next/navigation";
import { BackButton } from "@/components/layout/back-button";
import SplitText from "@/components/reactBits/SplitText";
import { MaintenanceList } from "@/components/maintenance/maintenance-list";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export default async function AssetMaintenancePage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    const { id } = await params;

    // Fetch asset
    const asset = await prisma.asset.findFirst({
        where: {
            id: id,
            userId: user.id,
        },
    });

    if (!asset) {
        redirect("/app/activos");
    }

    // Fetch maintenance records
    const maintenanceRecords = await prisma.maintenanceRecord.findMany({
        where: {
            assetId: id,
        },
        include: {
            financialRecords: {
                select: {
                    id: true,
                    amount: true,
                },
            },
        },
        orderBy: {
            date: "desc",
        },
    });

    // Cast financialRecords amounts to number if they are Decimal (Prisma usually returns Decimal for Decimals)
    // However, MaintenanceList expects amounts as numbers (based on inferred types in previous context, but let's check).
    // In AssetFinancesPage we saw:
    // const recordsWithNumbers = records.map(record => ({ ...record, amount: Number(record.amount) }));
    // The MaintenanceList interface: `financialRecords?: { id: string; amount: number }[];`
    // Prisma `financialRecord.amount` is likely Decimal.
    // We should map it to be safe.

    const formattedMaintenanceRecords = maintenanceRecords.map(record => ({
        ...record,
        cost: Number(record.cost), // cost is likely Decimal too
        financialRecords: record.financialRecords.map(fr => ({
            ...fr,
            amount: Number(fr.amount)
        }))
    }));

    return (
        <div className="flex-1 w-full flex flex-col gap-6 sm:gap-8 p-8 sm:p-12 md:p-16">
            <div id="header" className="flex flex-col gap-4">
                <BackButton />
                <div>
                    <SplitText
                        text={`Mantenimientos de ${asset.name}`}
                        tag="h1"
                        className="text-3xl sm:text-4xl font-bold"
                        delay={100}
                        duration={0.6}
                        ease="power3.out"
                        splitType="chars"
                        from={{ opacity: 0, y: 40 }}
                        to={{ opacity: 1, y: 0 }}
                        threshold={0.1}
                        rootMargin="-100px"
                        textAlign="left"
                    />
                    <p className="text-muted-foreground mt-1">
                        Lleva un registro completo de los mantenimientos y recibe alertas oportunas
                    </p>
                </div>
            </div>

            <MaintenanceList assetId={asset.id} maintenanceRecords={formattedMaintenanceRecords} />
        </div>
    );
}
