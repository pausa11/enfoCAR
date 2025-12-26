import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/push/unsubscribe
 * Unsubscribe a user from push notifications
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { endpoint } = body;

        if (!endpoint) {
            return NextResponse.json(
                { error: 'Endpoint is required' },
                { status: 400 }
            );
        }

        // Delete the subscription
        await prisma.pushSubscription.deleteMany({
            where: {
                endpoint,
                user: {
                    email: user.email!,
                },
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error unsubscribing from push notifications:', error);
        return NextResponse.json(
            { error: 'Failed to unsubscribe from push notifications' },
            { status: 500 }
        );
    }
}
