import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify asset ownership
    const asset = await prisma.asset.findFirst({
        where: {
            id: id,
            userId: user.id,
        },
    });

    if (!asset) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // Get maintenance records
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

    return NextResponse.json(maintenanceRecords);
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify asset ownership
    const asset = await prisma.asset.findFirst({
        where: {
            id: id,
            userId: user.id,
        },
    });

    if (!asset) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const body = await request.json();
    const { type, description, cost, date, mileage, nextServiceDate, nextServiceMileage, notes, createExpense = true } = body;

    // Create maintenance record and optionally create linked expense
    const maintenanceRecord = await prisma.maintenanceRecord.create({
        data: {
            type,
            description,
            cost,
            date: new Date(date),
            mileage,
            nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null,
            nextServiceMileage,
            notes,
            assetId: id,
        },
    });

    // Automatically create a linked financial record (expense) if requested
    let financialRecord = null;
    if (createExpense) {
        financialRecord = await prisma.financialRecord.create({
            data: {
                amount: cost,
                type: "EXPENSE",
                date: new Date(date),
                description: description || `Mantenimiento: ${type}`,
                assetId: id,
                maintenanceRecordId: maintenanceRecord.id,
            },
        });
    }

    return NextResponse.json({
        maintenanceRecord,
        financialRecord,
        message: createExpense ? "Mantenimiento y gasto registrados exitosamente" : "Mantenimiento registrado exitosamente"
    });
}
