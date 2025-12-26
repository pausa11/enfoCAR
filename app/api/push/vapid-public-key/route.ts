import { NextRequest, NextResponse } from 'next/server';
import { vapidKeys } from '@/lib/push/vapid';

/**
 * GET /api/push/vapid-public-key
 * Returns the VAPID public key needed for client-side subscription
 */
export async function GET(request: NextRequest) {
    try {
        if (!vapidKeys.publicKey) {
            return NextResponse.json(
                { error: 'VAPID public key not configured' },
                { status: 500 }
            );
        }

        return NextResponse.json({ publicKey: vapidKeys.publicKey });
    } catch (error) {
        console.error('Error getting VAPID public key:', error);
        return NextResponse.json(
            { error: 'Failed to get VAPID public key' },
            { status: 500 }
        );
    }
}
