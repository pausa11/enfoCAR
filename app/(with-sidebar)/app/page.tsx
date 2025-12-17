import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialRecord } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Car } from "lucide-react";
import { DashboardAnalysis } from "@/components/dashboard-analysis";
import { FinancialCharts } from "@/components/financial-charts";

export const dynamic = "force-dynamic";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  // Ensure user exists in Prisma database (important for OAuth users)
  const existingUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  if (!existingUser) {
    // Only create if user doesn't exist by ID
    // If email already exists, it means user has multiple auth methods
    try {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || "",
        },
      });
    } catch (error) {
      // If email already exists, that's okay - user might have signed up
      // with email/password and is now using Google OAuth
      console.log("User creation skipped - email may already exist with different auth method");
    }
  }

  // Fetch data
  const assetCount = await prisma.asset.count({
    where: {
      userId: user.id,
    },
  });

  const financialRecords = await prisma.financialRecord.findMany({
    where: {
      asset: {
        userId: user.id,
      },
    },
    include: {
      asset: {
        select: {
          ownershipPercentage: true,
          type: true,
        },
      },
    },
  });

  // Helper to calculate user share
  const getUserAmount = (record: FinancialRecord & { asset: { ownershipPercentage: number } }) => {
    return Number(record.amount) * (record.asset.ownershipPercentage / 100);
  };

  // Aggregate data (User Share)
  const totalIncome = financialRecords
    .filter((r) => r.type === "INCOME")
    .reduce((acc, curr) => acc + getUserAmount(curr), 0);

  const totalExpenses = financialRecords
    .filter((r) => r.type === "EXPENSE")
    .reduce((acc, curr) => acc + getUserAmount(curr), 0);

  // Group by month
  const monthlyStats = financialRecords.reduce((acc: Record<string, { income: number; expense: number }>, record) => {
    const month = record.date.toISOString().slice(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = { income: 0, expense: 0 };
    }
    const amount = getUserAmount(record);
    if (record.type === "INCOME") {
      acc[month].income += amount;
    } else {
      acc[month].expense += amount;
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  // Sort months
  const sortedMonths = Object.keys(monthlyStats).sort();

  // Calculate Net Income and Margin
  const netIncome = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;

  // Aggregate data for Charts
  // 1. Monthly Stats Array for Bar Chart
  const monthlyStatsArray = sortedMonths.map((month) => ({
    month,
    income: monthlyStats[month].income,
    expense: monthlyStats[month].expense,
  }));

  // 2. Income by Asset Type for Pie Chart
  const incomeByType = financialRecords
    .filter((r) => r.type === "INCOME")
    .reduce((acc: Record<string, number>, curr) => {
      const type = curr.asset.type;
      const amount = getUserAmount(curr);
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += amount;
      return acc;
    }, {});

  const incomeByAssetTypeData = Object.entries(incomeByType).map(([name, value]) => ({
    name,
    value,
  }));

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (percent: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(percent / 100);
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-6 sm:gap-8 p-8 sm:p-12 md:p-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Mi Tablero</h1>
          <p className="text-sm sm:text-base text-muted-foreground">¡Todo bien, {user.email}! Aquí tienes el resumen de la jugada.</p>
        </div>
        <Link href="/app/activos">
          <Button className="gap-2">
            <Car className="h-4 w-4" />
            Ver mis Naves
          </Button>
        </Link>
      </div>

      <DashboardAnalysis
        stats={{
          totalIncome,
          totalExpenses,
          assetCount,
          monthlyStats
        }}
      />

      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Naves</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assetCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen de Ganancia</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(profitMargin)}
            </div>
            <p className="text-xs text-muted-foreground">
              Eficiencia de tu operación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lo que entra (Ingresos)</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lo que sale (Gastos)</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Net Income Highlight */}
      <div className="grid gap-4 grid-cols-1">
        <Card className={`${netIncome >= 0 ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Utilidad Neta (Lo que te queda libre)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-4xl font-bold ${netIncome >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
              {formatCurrency(netIncome)}
            </div>
            <p className="text-muted-foreground mt-1">
              Ingresos - Gastos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts */}
      <h2 className="text-lg sm:text-xl font-semibold mt-2">Echele pues el ojo</h2>
      <FinancialCharts
        monthlyStats={monthlyStatsArray}
        incomeByAssetType={incomeByAssetTypeData}
      />

      {/* Monthly Breakdown Table */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg sm:text-xl font-semibold mt-4">Detalle Mensual</h2>
        <div className="border rounded-md overflow-x-auto">
          <div className="grid grid-cols-4 p-3 sm:p-4 font-medium border-b bg-muted/50 text-sm sm:text-base min-w-[500px]">
            <div>Mes</div>
            <div>Ingresos</div>
            <div>Gastos</div>
            <div>Utilidad</div>
          </div>
          {sortedMonths.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm sm:text-base">
              Todavía no hay movimiento, ¡a camellar!
            </div>
          ) : (
            sortedMonths.map((month) => {
              const inc = monthlyStats[month].income;
              const exp = monthlyStats[month].expense;
              const util = inc - exp;

              return (
                <div key={month} className="grid grid-cols-4 p-3 sm:p-4 border-b last:border-0 hover:bg-muted/10 transition-colors text-sm sm:text-base min-w-[500px]">
                  <div>{month}</div>
                  <div className="text-green-600">
                    {formatCurrency(inc)}
                  </div>
                  <div className="text-red-600">
                    {formatCurrency(exp)}
                  </div>
                  <div className={`font-semibold ${util >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(util)}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  );
}
