#!/usr/bin/env node

/**
 * Script to generate VAPID keys for push notifications
 * Run with: node scripts/generate-vapid-keys.js
 */

const webPush = require('web-push');

const keys = webPush.generateVAPIDKeys();

console.log('\n=== VAPID Keys Generated ===\n');
console.log('Add these to your .env file:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:your-email@example.com`);
console.log('\n============================\n');
console.log('⚠️  IMPORTANT: Keep the private key secret and never commit it to version control!');
console.log('\n');
