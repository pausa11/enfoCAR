import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FinancialRecord } from "@prisma/client";
import { DashboardSwitcher } from "@/components/dashboard/dashboard-switcher";
import { BusinessDashboard } from "@/components/dashboard/business-dashboard";
import { PersonalDashboard } from "@/components/dashboard/personal-dashboard";
export const dynamic = "force-dynamic";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/login");
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  if (!existingUser) {
    try {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email || "",
        },
      });
    } catch (error) {
      console.log("User creation skipped - email may already exist with different auth method");
    }
  }

  const businessAssetCount = await prisma.asset.count({
    where: {
      userId: user.id,
      isBusinessAsset: true,
    },
  });

  const financialRecords = await prisma.financialRecord.findMany({
    where: {
      asset: {
        userId: user.id,
        isBusinessAsset: true,
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

  const getUserAmount = (record: FinancialRecord & { asset: { ownershipPercentage: number } }) => {
    return Number(record.amount) * (record.asset.ownershipPercentage / 100);
  };

  const totalIncome = financialRecords
    .filter((r) => r.type === "INCOME")
    .reduce((acc, curr) => acc + getUserAmount(curr), 0);

  const totalExpenses = financialRecords
    .filter((r) => r.type === "EXPENSE")
    .reduce((acc, curr) => acc + getUserAmount(curr), 0);

  const monthlyStats = financialRecords.reduce((acc: Record<string, { income: number; expense: number }>, record) => {
    const month = record.date.toISOString().slice(0, 7);
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

  const sortedMonths = Object.keys(monthlyStats).sort();
  const netIncome = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;

  const monthlyStatsArray = sortedMonths.map((month) => ({
    month,
    income: monthlyStats[month].income,
    expense: monthlyStats[month].expense,
  }));

  const incomeByType = financialRecords.filter((r) => r.type === "INCOME").reduce((acc: Record<string, number>, curr) => {
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

  const assetCount = await prisma.asset.count({
    where: {
      userId: user.id,
    },
  });

  const personalVehicles = await prisma.asset.findMany({
    where: {
      userId: user.id,
      isBusinessAsset: false,
    },
    include: {
      financialRecords: {
        orderBy: {
          date: "desc",
        },
      },
    },
  });

  /* Existing code for vehiclesWithNumbers map... */
  const vehiclesWithNumbers = personalVehicles.map(vehicle => ({
    ...vehicle,
    value: vehicle.value ? vehicle.value.toNumber() : null,
    financialRecords: vehicle.financialRecords.map(record => ({
      ...record,
      amount: Number(record.amount),
    })),
  }));

  // Fetch recent maintenance records for business assets
  const recentMaintenances = await prisma.maintenanceRecord.findMany({
    where: {
      asset: {
        userId: user.id,
        isBusinessAsset: true,
      },
    },
    include: {
      asset: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
    take: 5,
  });

  const formattedMaintenances = recentMaintenances.map(m => ({
    ...m,
    cost: Number(m.cost),
  }));

  // Fetch active documents for business assets
  const activeDocuments = await prisma.assetDocument.findMany({
    where: {
      asset: {
        userId: user.id,
        isBusinessAsset: true,
      },
      isActive: true,
    },
    include: {
      asset: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      expirationDate: 'asc',
    },
  });

  // Fetch recent maintenance records for personal assets
  const recentPersonalMaintenances = await prisma.maintenanceRecord.findMany({
    where: {
      asset: {
        userId: user.id,
        isBusinessAsset: false,
      },
    },
    include: {
      asset: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
    take: 5,
  });

  const formattedPersonalMaintenances = recentPersonalMaintenances.map(m => ({
    ...m,
    cost: Number(m.cost),
  }));

  // Fetch active documents for personal assets
  const activePersonalDocuments = await prisma.assetDocument.findMany({
    where: {
      asset: {
        userId: user.id,
        isBusinessAsset: false,
      },
      isActive: true,
    },
    include: {
      asset: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      expirationDate: 'asc',
    },
  });

  const personalTotalExpenses = vehiclesWithNumbers.reduce((acc, vehicle) => {
    const vehicleExpenses = vehicle.financialRecords
      .filter(r => r.type === "EXPENSE")
      .reduce((sum, r) => sum + r.amount, 0);
    return acc + vehicleExpenses;
  }, 0);

  const personalMonthlyExpenses = vehiclesWithNumbers.reduce((acc: Record<string, number>, vehicle) => {
    vehicle.financialRecords
      .filter(r => r.type === "EXPENSE")
      .forEach(record => {
        const month = record.date.toISOString().slice(0, 7);
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += record.amount;
      });
    return acc;
  }, {});

  const personalSortedMonths = Object.keys(personalMonthlyExpenses).sort();
  const personalAvgMonthlyExpense = personalSortedMonths.length > 0
    ? personalTotalExpenses / personalSortedMonths.length
    : 0;

  return (
    <div className="flex-1 w-full flex flex-col gap-6 sm:gap-8 p-8 sm:p-12 md:p-16">

      <DashboardSwitcher
        hasBusinessVehicles={businessAssetCount > 0}
        hasPersonalVehicles={vehiclesWithNumbers.length > 0}
        businessDashboard={
          <BusinessDashboard
            userEmail={user.email || ""}
            assetCount={assetCount}
            businessAssetCount={businessAssetCount}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            netIncome={netIncome}
            profitMargin={profitMargin}
            monthlyStats={monthlyStats}
            monthlyStatsArray={monthlyStatsArray}
            incomeByAssetTypeData={incomeByAssetTypeData}
            maintenances={formattedMaintenances}
            documents={activeDocuments}
          />
        }
        personalDashboard={
          <PersonalDashboard
            userEmail={user.email || ""}
            vehicles={vehiclesWithNumbers}
            totalExpenses={personalTotalExpenses}
            avgMonthlyExpense={personalAvgMonthlyExpense}
            monthlyExpenses={personalMonthlyExpenses}
            maintenances={formattedPersonalMaintenances}
            documents={activePersonalDocuments}
          />
        }
      />
    </div>
  );
}
