import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/cron/test-master?hour=9
 * Test endpoint to manually trigger the master cron with a specific hour
 * This is useful for testing without waiting for the actual cron schedule
 * 
 * Query params:
 * - hour: The hour to simulate (9, 18, or 21)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const hourParam = searchParams.get('hour');

        if (!hourParam) {
            return NextResponse.json({
                error: 'Missing hour parameter',
                usage: 'GET /api/cron/test-master?hour=9 (or 18, or 21)',
            }, { status: 400 });
        }

        const hour = parseInt(hourParam);

        if (![9, 18, 21].includes(hour)) {
            return NextResponse.json({
                error: 'Invalid hour',
                message: 'Hour must be 9, 18, or 21',
            }, { status: 400 });
        }

        console.log(`[TEST-MASTER-CRON] Simulating hour ${hour}:00`);

        const results: any[] = [];
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        // 9 AM: Check expiring documents
        if (hour === 9) {
            console.log('[TEST-MASTER-CRON] Triggering check-expiring-documents...');
            try {
                const response = await fetch(`${baseUrl}/api/cron/check-expiring-documents`, {
                    method: 'GET',
                    headers: {
                        'authorization': `Bearer ${process.env.CRON_SECRET || ''}`,
                    },
                });
                const data = await response.json();
                results.push({
                    job: 'check-expiring-documents',
                    status: response.ok ? 'success' : 'failed',
                    data,
                });
            } catch (error) {
                results.push({
                    job: 'check-expiring-documents',
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        // 6 PM and 9 PM: Send daily reminders
        if (hour === 18 || hour === 21) {
            console.log(`[TEST-MASTER-CRON] Triggering daily-reminder at ${hour}:00...`);
            try {
                const response = await fetch(`${baseUrl}/api/cron/daily-reminder`, {
                    method: 'GET',
                    headers: {
                        'authorization': `Bearer ${process.env.CRON_SECRET || ''}`,
                    },
                });
                const data = await response.json();
                results.push({
                    job: 'daily-reminder',
                    time: `${hour}:00`,
                    status: response.ok ? 'success' : 'failed',
                    data,
                });
            } catch (error) {
                results.push({
                    job: 'daily-reminder',
                    time: `${hour}:00`,
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        const allSucceeded = results.every(r => r.status === 'success');

        return NextResponse.json({
            success: allSucceeded,
            simulatedHour: hour,
            jobsExecuted: results.length,
            results,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('[TEST-MASTER-CRON] Fatal error:', error);
        return NextResponse.json(
            {
                error: 'Test master cron failed',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
