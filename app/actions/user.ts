"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getOnboardingStatus() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { hasCompletedOnboarding: false };
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { hasCompletedOnboarding: true, hasCompletedAssetOnboarding: true },
    });

    return {
        hasCompletedOnboarding: dbUser?.hasCompletedOnboarding ?? false,
        hasCompletedAssetOnboarding: dbUser?.hasCompletedAssetOnboarding ?? false
    };
}

export async function completeOnboardingAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    await prisma.user.update({
        where: { id: user.id },
        data: { hasCompletedOnboarding: true },
    });

    revalidatePath("/app");
}

export async function completeAssetOnboardingAction() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return;

    await prisma.user.update({
        where: { id: user.id },
        data: { hasCompletedAssetOnboarding: true },
    });

    revalidatePath("/app");
}
