import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/push/subscribe
 * Subscribe a user to push notifications
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
        const { endpoint, keys } = body;

        console.log('[SUBSCRIBE] Request body:', { endpoint: endpoint?.substring(0, 50), hasKeys: !!keys });

        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            console.error('[SUBSCRIBE] Invalid subscription data');
            return NextResponse.json(
                { error: 'Invalid subscription data' },
                { status: 400 }
            );
        }

        console.log('[SUBSCRIBE] User:', user.id, user.email);

        // Check if user exists in our database
        let dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
        });

        console.log('[SUBSCRIBE] DB User found:', !!dbUser);

        if (!dbUser) {
            console.log('[SUBSCRIBE] Creating new user...');
            // Create user if doesn't exist
            dbUser = await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email!,
                },
            });
            console.log('[SUBSCRIBE] User created:', dbUser.id);
        }

        // Check if subscription already exists
        const existingSubscription = await prisma.pushSubscription.findUnique({
            where: { endpoint },
        });

        console.log('[SUBSCRIBE] Existing subscription:', !!existingSubscription);

        if (existingSubscription) {
            // Update existing subscription
            const subscription = await prisma.pushSubscription.update({
                where: { endpoint },
                data: {
                    userId: dbUser.id,
                    p256dhKey: keys.p256dh,
                    authKey: keys.auth,
                },
            });

            console.log('[SUBSCRIBE] Subscription updated:', subscription.id);

            return NextResponse.json({
                success: true,
                subscription: {
                    id: subscription.id,
                    endpoint: subscription.endpoint,
                }
            });
        }

        // Create new subscription
        const subscription = await prisma.pushSubscription.create({
            data: {
                userId: dbUser.id,
                endpoint,
                p256dhKey: keys.p256dh,
                authKey: keys.auth,
            },
        });

        console.log('[SUBSCRIBE] New subscription created:', subscription.id);

        return NextResponse.json({
            success: true,
            subscription: {
                id: subscription.id,
                endpoint: subscription.endpoint,
            }
        });
    } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        return NextResponse.json(
            { error: 'Failed to subscribe to push notifications' },
            { status: 500 }
        );
    }
}
