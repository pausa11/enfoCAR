import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        // Verify authentication
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const { id } = params;

        // Verify record exists and belongs to user
        const existingRecord = await prisma.financialRecord.findFirst({
            where: {
                id,
                asset: {
                    userId: user.id,
                },
            },
        });

        if (!existingRecord) {
            return NextResponse.json(
                { error: "Registro no encontrado o no autorizado" },
                { status: 404 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { amount, type, date, endDate, description } = body;

        // Validate type if provided
        if (type && !["INCOME", "EXPENSE"].includes(type)) {
            return NextResponse.json(
                { error: "Tipo inválido. Debe ser INCOME o EXPENSE" },
                { status: 400 }
            );
        }

        // Validate endDate is after date if both provided
        const finalDate = date ? new Date(date) : existingRecord.date;
        const finalEndDate = endDate !== undefined ? (endDate ? new Date(endDate) : null) : existingRecord.endDate;

        if (finalEndDate && finalEndDate < finalDate) {
            return NextResponse.json(
                { error: "La fecha final debe ser posterior a la fecha inicial" },
                { status: 400 }
            );
        }

        // Update record
        const updatedRecord = await prisma.financialRecord.update({
            where: { id },
            data: {
                ...(amount !== undefined && { amount }),
                ...(type && { type }),
                ...(date && { date: new Date(date) }),
                ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
                ...(description !== undefined && { description }),
            },
            include: {
                asset: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedRecord);
    } catch (error) {
        console.error("Error updating financial record:", error);
        return NextResponse.json(
            { error: "Error al actualizar el registro financiero" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        // Verify authentication
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const { id } = params;

        // Verify record exists and belongs to user
        const existingRecord = await prisma.financialRecord.findFirst({
            where: {
                id,
                asset: {
                    userId: user.id,
                },
            },
        });

        if (!existingRecord) {
            return NextResponse.json(
                { error: "Registro no encontrado o no autorizado" },
                { status: 404 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { maintenanceRecordId } = body;

        // Update only the maintenanceRecordId
        const updatedRecord = await prisma.financialRecord.update({
            where: { id },
            data: {
                maintenanceRecordId: maintenanceRecordId || null,
            },
        });

        return NextResponse.json(updatedRecord);
    } catch (error) {
        console.error("Error updating financial record:", error);
        return NextResponse.json(
            { error: "Error al actualizar el registro financiero" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        // Verify authentication
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const { id } = params;

        // Verify record exists and belongs to user
        const existingRecord = await prisma.financialRecord.findFirst({
            where: {
                id,
                asset: {
                    userId: user.id,
                },
            },
        });

        if (!existingRecord) {
            return NextResponse.json(
                { error: "Registro no encontrado o no autorizado" },
                { status: 404 }
            );
        }

        // Delete record
        await prisma.financialRecord.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting financial record:", error);
        return NextResponse.json(
            { error: "Error al eliminar el registro financiero" },
            { status: 500 }
        );
    }
}
