# Push Notifications - Production Deployment Checklist

## ✅ Pre-Deployment

- [x] VAPID keys generated
- [x] Service worker configured
- [x] Database schema migrated
- [x] API routes created
- [x] Frontend components integrated
- [x] Document expiry notifications implemented
- [x] Tested in development

## 🚀 Deployment Steps

### 1. Environment Variables

Add these to your production environment (Vercel, Railway, etc.):

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BGzsQh_kjLaCdEvJ_ytojbRokJgVcbKzCEE8x47XWthBz4NxyOcRu-R5y_5gPPfnvNM-8mGDuuHCAcs5vgexK2Y
VAPID_PRIVATE_KEY=CjeYdwoNo7puWUe0McamX2anUuseGI8fRFSdh9xr1vc
VAPID_SUBJECT=mailto:admin@enfocar.app
```

> ⚠️ **IMPORTANT**: Change `VAPID_SUBJECT` to your real email address

### 2. Verify Cron Configuration

The `vercel.json` file is already configured for daily checks at 9 AM:

```json
{
  "crons": [{
    "path": "/api/cron/check-expiring-documents",
    "schedule": "0 9 * * *"
  }]
}
```

### 3. Build and Deploy

```bash
npm run build
```

Verify no errors in the build process.

### 4. Post-Deployment Testing

1. **Activate notifications** on production site
2. **Test manual check** via documents page button
3. **Verify cron job** runs (check Vercel logs next day at 9 AM)

## 📊 Monitoring

### Vercel Dashboard

- Check cron job execution logs
- Monitor API route performance
- Track error rates

### Database

Monitor `PushSubscription` table:
- Number of active subscriptions
- Expired subscriptions cleanup

## 🔧 Troubleshooting Production Issues

### Service Worker Not Registering

**Check**:
- HTTPS is enabled (required for service workers)
- `/sw-custom.js` is accessible
- No console errors

### Notifications Not Sending

**Check**:
- VAPID keys are correctly set
- Cron job is executing (Vercel logs)
- Users have active subscriptions in database

### High Failure Rate

**Possible causes**:
- Expired subscriptions (automatic cleanup should handle this)
- Invalid VAPID configuration
- Network issues

## 📈 Success Metrics

Track these to measure success:

- **Subscription rate**: % of users who enable notifications
- **Delivery rate**: % of notifications successfully delivered
- **Engagement rate**: % of notifications clicked
- **Unsubscribe rate**: % of users who disable notifications

## 🎯 Next Features

Consider adding:

1. **Notification preferences** - Let users choose notification types
2. **Quiet hours** - Don't send notifications at night
3. **Notification history** - Show past notifications in app
4. **Rich notifications** - Add images and action buttons
5. **Multi-language** - Support for different languages
