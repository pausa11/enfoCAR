import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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

        // Parse request body
        const body = await request.json();
        const { assetId, month, year, amount } = body;

        // Validate required fields
        if (!assetId || !month || !year || amount === undefined) {
            return NextResponse.json(
                { error: "Todos los campos son obligatorios" },
                { status: 400 }
            );
        }

        // Verify asset belongs to user
        const asset = await prisma.asset.findFirst({
            where: {
                id: assetId,
                userId: user.id,
            },
        });

        if (!asset) {
            return NextResponse.json(
                { error: "Activo no encontrado" },
                { status: 404 }
            );
        }

        // Upsert driver salary (create or update)
        const salary = await prisma.driverSalary.upsert({
            where: {
                assetId_year_month: {
                    assetId,
                    year: parseInt(year),
                    month: parseInt(month),
                },
            },
            update: {
                amount: parseFloat(amount),
            },
            create: {
                assetId,
                year: parseInt(year),
                month: parseInt(month),
                amount: parseFloat(amount),
            },
        });

        return NextResponse.json(salary, { status: 201 });
    } catch (error) {
        console.error("Error creating/updating driver salary:", error);
        return NextResponse.json(
            { error: "Error al guardar el salario" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
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

        // Get query params
        const { searchParams } = new URL(request.url);
        const assetId = searchParams.get("assetId");
        const month = searchParams.get("month");
        const year = searchParams.get("year");

        if (!assetId) {
            return NextResponse.json(
                { error: "assetId es requerido" },
                { status: 400 }
            );
        }

        // Verify asset belongs to user
        const asset = await prisma.asset.findFirst({
            where: {
                id: assetId,
                userId: user.id,
            },
        });

        if (!asset) {
            return NextResponse.json(
                { error: "Activo no encontrado" },
                { status: 404 }
            );
        }

        // Build where clause
        const where: any = { assetId };
        if (month) where.month = parseInt(month);
        if (year) where.year = parseInt(year);

        // Fetch salaries
        const salaries = await prisma.driverSalary.findMany({
            where,
            orderBy: [
                { year: "desc" },
                { month: "desc" },
            ],
        });

        return NextResponse.json(salaries);
    } catch (error) {
        console.error("Error fetching driver salaries:", error);
        return NextResponse.json(
            { error: "Error al obtener los salarios" },
            { status: 500 }
        );
    }
}
