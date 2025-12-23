import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SplitText from "@/components/SplitText";
import { GlobalFinancialKPIs } from "@/components/global-financial-kpis";
import { FinancialChartsOverview } from "@/components/financial-charts-overview";
import { RecentTransactionsTable } from "@/components/recent-transactions-table";
import { QuickAddTransaction } from "@/components/quick-add-transaction";

export const dynamic = "force-dynamic";

export default async function FinancesPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/auth/login");
    }

    // Fetch all assets for the user
    const assetsRaw = await prisma.asset.findMany({
        where: {
            userId: user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // Convert Decimal fields to plain numbers for Client Component serialization
    const assets = assetsRaw.map(asset => ({
        ...asset,
        value: asset.value ? asset.value.toNumber() : null,
    }));

    return (
        <div className="flex-1 w-full flex flex-col gap-6 sm:gap-8 p-8 sm:p-12 md:p-16">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <SplitText
                        text="Dashboard Financiero"
                        tag="h1"
                        className="text-2xl sm:text-3xl font-bold"
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
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Análisis completo de tus movimientos financieros
                    </p>
                </div>

                {/* Quick Add Transaction Button */}
                <QuickAddTransaction assets={assets} />
            </div>

            {/* Global KPIs */}
            <GlobalFinancialKPIs assets={assets} />

            {/* Charts */}
            <FinancialChartsOverview assets={assets} />

            {/* Recent Transactions Table */}
            <RecentTransactionsTable assets={assets} />
        </div>
    );
}
