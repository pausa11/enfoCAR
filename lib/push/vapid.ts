/**
 * VAPID (Voluntary Application Server Identification) key management
 * These keys are used to authenticate push notifications
 */

export const vapidKeys = {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || '',
    subject: process.env.VAPID_SUBJECT || 'mailto:admin@enfocar.app',
};

/**
 * Validates that VAPID keys are configured
 */
export function validateVapidKeys(): boolean {
    if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
        console.error('VAPID keys are not configured. Please set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.');
        return false;
    }
    return true;
}

/**
 * Script to generate new VAPID keys
 * Run with: node -e "require('./lib/push/vapid').generateVapidKeys()"
 */
export async function generateVapidKeys() {
    const webPush = await import('web-push');
    const keys = webPush.generateVAPIDKeys();

    console.log('\n=== VAPID Keys Generated ===\n');
    console.log('Add these to your .env file:\n');
    console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
    console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
    console.log(`VAPID_SUBJECT=mailto:your-email@example.com`);
    console.log('\n============================\n');

    return keys;
}
