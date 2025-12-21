import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FinancialRecordForm } from "@/components/financial-record-form";
import { FinancialRecordsList } from "@/components/financial-records-list";
import { FinancialSummary } from "@/components/financial-summary";
import { DriverSalaryManager } from "@/components/driver-salary-manager";
import { ArrowLeft, FileText, Wrench } from "lucide-react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import SplitText from "@/components/SplitText";



export const dynamic = "force-dynamic";

export default async function AssetFinancesPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    const { id } = await params;

    const assetRaw = await prisma.asset.findFirst({
        where: {
            id: id,
            userId: user.id,
        },
    });

    if (!assetRaw) {
        return redirect("/app/activos");
    }

    const asset = {
        ...assetRaw,
        value: assetRaw.value ? assetRaw.value.toNumber() : null,
    };

    const records = await prisma.financialRecord.findMany({
        where: {
            assetId: id,
        },
        orderBy: {
            date: "desc",
        },
    });

    const recordsWithNumbers = records.map(record => ({
        ...record,
        amount: Number(record.amount),
    }));

    let currentMonthlySalary: number | null = null;
    if (asset.driverPaymentMode === 'FIXED_SALARY') {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        const salary = await prisma.driverSalary.findUnique({
            where: {
                assetId_year_month: {
                    assetId: id,
                    year: currentYear,
                    month: currentMonth,
                },
            },
        });

        if (salary) {
            currentMonthlySalary = salary.amount.toNumber();
        }
    }

    const driverName = asset.customAttributes &&
        typeof asset.customAttributes === 'object' &&
        'conductor' in asset.customAttributes
        ? (asset.customAttributes as { conductor?: string }).conductor || null
        : null;

    return (
        <div className="flex-1 w-full flex flex-col gap-6 sm:gap-8 p-8 sm:p-12 md:p-16">

            <div id="header" className="flex flex-col gap-4">
                <Link href={asset.isBusinessAsset ? "/app/activos" : "/app/finanzas"}>
                    <Button variant="ghost" className="gap-2 -ml-2 hover:bg-muted/50 hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" />
                        {asset.isBusinessAsset ? "Volver a Mis Naves" : "Volver a Mis Finanzas"}
                    </Button>
                </Link>
                <div>
                    <SplitText
                        text={asset.name}
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
                        {asset.isBusinessAsset
                            ? "Gestiona la plata que genera y gasta esta nave"
                            : "Gestiona los gastos de tu vehículo personal"}
                    </p>
                </div>
            </div>

            <FinancialSummary
                records={recordsWithNumbers}
                ownershipPercentage={asset.ownershipPercentage}
                driverPercentage={asset.driverPercentage}
                driverPaymentMode={asset.driverPaymentMode}
                driverMonthlySalary={currentMonthlySalary}
                driverName={driverName}
                isBusinessAsset={asset.isBusinessAsset}
            />

            {asset.driverPaymentMode === 'FIXED_SALARY' && driverName && (
                <DriverSalaryManager
                    assetId={asset.id}
                    driverName={driverName}
                />
            )}

            <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/app/activos/${asset.id}/documentos`}>
                    <Button variant="outline" className="w-full sm:w-auto gap-2">
                        <FileText className="h-4 w-4" />
                        Ver Documentos del Vehículo
                    </Button>
                </Link>

                <Link href={`/app/activos/${asset.id}/mantenimientos`}>
                    <Button variant="outline" className="w-full sm:w-auto gap-2">
                        <Wrench className="h-4 w-4" />
                        Ver Mantenimientos
                    </Button>
                </Link>
            </div>

            <div id="form-list" className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">


                <div id="form" className="lg:sticky lg:top-8">
                    <FinancialRecordForm
                        assets={[asset]}
                        preselectedAssetId={asset.id}
                    />
                </div>

                <div id="list" className="space-y-4">
                    <SplitText
                        text="Historial de Movimientos"
                        tag="h2"
                        className="text-2xl font-bold"
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
                    <FinancialRecordsList records={recordsWithNumbers} />
                </div>
            </div>
        </div>
    );
}
