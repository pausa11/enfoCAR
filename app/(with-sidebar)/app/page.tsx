import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialRecord } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Car } from "lucide-react";
import { DashboardAnalysis } from "@/components/dashboard-analysis";

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
  });

  // Aggregate data
  const totalIncome = financialRecords
    .filter((r: FinancialRecord) => r.type === "INCOME")
    .reduce((acc: number, curr: FinancialRecord) => acc + Number(curr.amount), 0);

  const totalExpenses = financialRecords
    .filter((r: FinancialRecord) => r.type === "EXPENSE")
    .reduce((acc: number, curr: FinancialRecord) => acc + Number(curr.amount), 0);

  // Group by month
  const monthlyStats = financialRecords.reduce((acc: Record<string, { income: number; expense: number }>, record: FinancialRecord) => {
    const month = record.date.toISOString().slice(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = { income: 0, expense: 0 };
    }
    if (record.type === "INCOME") {
      acc[month].income += Number(record.amount);
    } else {
      acc[month].expense += Number(record.amount);
    }
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  // Sort months
  const sortedMonths = Object.keys(monthlyStats).sort();

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

      {/* AI Analysis */}
      <DashboardAnalysis
        stats={{
          totalIncome,
          totalExpenses,
          assetCount,
          monthlyStats
        }}
      />

      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Naves</CardTitle>
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
              <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0" />
              <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0-4 0" />
              <path d="M5 17h-2v-6l2-5h9l2 5v6h-2" />
              <path d="M9 17v-5h6v5" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assetCount}</div>
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
              ${totalIncome.toFixed(2)}
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
              ${totalExpenses.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <h2 className="text-lg sm:text-xl font-semibold mt-2 sm:mt-4">La movida del mes</h2>
      <div className="border rounded-md overflow-x-auto">
        <div className="grid grid-cols-3 p-3 sm:p-4 font-medium border-b bg-muted/50 text-sm sm:text-base min-w-[300px]">
          <div>Mes</div>
          <div>Ingresos</div>
          <div>Gastos</div>
        </div>
        {sortedMonths.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm sm:text-base">
            Todavía no hay movimiento, ¡a camellar!
          </div>
        ) : (
          sortedMonths.map((month) => (
            <div key={month} className="grid grid-cols-3 p-3 sm:p-4 border-b last:border-0 hover:bg-muted/10 transition-colors text-sm sm:text-base min-w-[300px]">
              <div>{month}</div>
              <div className="text-green-600">
                ${monthlyStats[month].income.toFixed(2)}
              </div>
              <div className="text-red-600">
                ${monthlyStats[month].expense.toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
