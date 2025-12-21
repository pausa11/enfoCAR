import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify maintenance record exists and user owns the asset
    const maintenanceRecord = await prisma.maintenanceRecord.findFirst({
        where: {
            id: id,
            asset: {
                userId: user.id,
            },
        },
    });

    if (!maintenanceRecord) {
        return NextResponse.json({ error: "Maintenance record not found" }, { status: 404 });
    }

    const body = await request.json();
    const { type, description, cost, date, mileage, nextServiceDate, nextServiceMileage, notes } = body;

    // Update maintenance record
    const updatedRecord = await prisma.maintenanceRecord.update({
        where: { id },
        data: {
            type,
            description,
            cost,
            date: date ? new Date(date) : undefined,
            mileage,
            nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null,
            nextServiceMileage,
            notes,
        },
    });

    return NextResponse.json(updatedRecord);
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify maintenance record exists and user owns the asset
    const maintenanceRecord = await prisma.maintenanceRecord.findFirst({
        where: {
            id: id,
            asset: {
                userId: user.id,
            },
        },
    });

    if (!maintenanceRecord) {
        return NextResponse.json({ error: "Maintenance record not found" }, { status: 404 });
    }

    // Delete maintenance record
    await prisma.maintenanceRecord.delete({
        where: { id },
    });

    return NextResponse.json({ success: true });
}
