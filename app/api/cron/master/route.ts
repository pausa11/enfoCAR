import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/cron/master
 * Master cron job that triggers other cron jobs based on the current time
 * This consolidates multiple Vercel crons into a single scheduled job
 * 
 * Schedule: Runs 3 times daily at 9 AM, 6 PM, and 9 PM
 * - 9 AM: Check expiring documents
 * - 6 PM: Send daily reminder (evening)
 * - 9 PM: Send daily reminder (night)
 */
export async function GET(request: NextRequest) {
    try {
        // Verify cron secret for security
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const hour = now.getHours();

        console.log(`[MASTER-CRON] Starting at ${hour}:00`);

        const results: any[] = [];

        // Determine the base URL for internal API calls
        // In production, use the public URL; in development, use localhost
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const host = request.headers.get('host') || 'localhost:3000';
        const baseUrl = `${protocol}://${host}`;

        console.log(`[MASTER-CRON] Using base URL: ${baseUrl}`);

        // 9 AM: Check expiring documents
        if (hour === 9) {
            console.log('[MASTER-CRON] Triggering check-expiring-documents...');
            try {
                const response = await fetch(`${baseUrl}/api/cron/check-expiring-documents`, {
                    method: 'GET',
                    headers: {
                        'authorization': `Bearer ${process.env.CRON_SECRET || ''}`,
                        'content-type': 'application/json',
                    },
                });
                const data = await response.json();
                results.push({
                    job: 'check-expiring-documents',
                    status: response.ok ? 'success' : 'failed',
                    statusCode: response.status,
                    data,
                });
                console.log('[MASTER-CRON] check-expiring-documents completed:', data);
            } catch (error) {
                console.error('[MASTER-CRON] check-expiring-documents failed:', error);
                results.push({
                    job: 'check-expiring-documents',
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        // 6 PM and 9 PM: Send daily reminders
        if (hour === 18 || hour === 21) {
            console.log(`[MASTER-CRON] Triggering daily-reminder at ${hour}:00...`);
            try {
                const response = await fetch(`${baseUrl}/api/cron/daily-reminder`, {
                    method: 'GET',
                    headers: {
                        'authorization': `Bearer ${process.env.CRON_SECRET || ''}`,
                        'content-type': 'application/json',
                    },
                });
                const data = await response.json();
                results.push({
                    job: 'daily-reminder',
                    time: `${hour}:00`,
                    status: response.ok ? 'success' : 'failed',
                    statusCode: response.status,
                    data,
                });
                console.log(`[MASTER-CRON] daily-reminder at ${hour}:00 completed:`, data);
            } catch (error) {
                console.error(`[MASTER-CRON] daily-reminder at ${hour}:00 failed:`, error);
                results.push({
                    job: 'daily-reminder',
                    time: `${hour}:00`,
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        // If no jobs were triggered (wrong hour), return info
        if (results.length === 0) {
            return NextResponse.json({
                success: true,
                message: `No jobs scheduled for ${hour}:00. Jobs run at 9:00, 18:00, and 21:00.`,
                timestamp: now.toISOString(),
            });
        }

        // Check if all jobs succeeded
        const allSucceeded = results.every(r => r.status === 'success');

        return NextResponse.json({
            success: allSucceeded,
            hour,
            jobsExecuted: results.length,
            results,
            timestamp: now.toISOString(),
        });
    } catch (error) {
        console.error('[MASTER-CRON] Fatal error:', error);
        return NextResponse.json(
            {
                error: 'Master cron job failed',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
