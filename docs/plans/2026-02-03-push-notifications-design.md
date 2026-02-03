# Push Notification System Design

**Date**: 2026-02-03
**Feature**: Browser Push Notifications for Due Date Reminders
**Status**: Approved

## Overview

Add browser push notification support to remind users 1 hour before their todos are due. The system uses Web Push API with service workers for native browser notifications, and Bull queue for reliable background job scheduling.

## Architecture

### Three Main Components

1. **Push Subscription Management**
   - API endpoints for subscribe/unsubscribe operations
   - Database storage for push subscriptions linked to users
   - VAPID key generation for secure push authentication
   - Frontend service worker to receive and display notifications

2. **Notification Scheduling Engine**
   - Bull/BullMQ queue for background job processing
   - Schedule notification jobs when todos are created/updated with due dates
   - Jobs execute 1 hour before due date (configurable constant)
   - Automatic retry on delivery failures

3. **Push Delivery Service**
   - `web-push` library for Web Push protocol
   - Notification payload includes todo title, description, due time
   - Cleanup expired/invalid subscriptions
   - Delivery status logging

### Notification Flow

```
User creates todo with due date
  ↓
System schedules Bull job (execute at: dueDate - 1 hour)
  ↓
Job executes at scheduled time
  ↓
Push notification sent to user's browser(s)
  ↓
Service worker displays notification
  ↓
User clicks → App opens to todo detail
```

## Database Schema

### New Entity: PushSubscription

```typescript
@Entity()
export class PushSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({ unique: true, length: 500 })
  endpoint: string;

  @Column('json')
  keys: {
    p256dh: string;
    auth: string;
  };

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Modified Todo Entity

```typescript
// Add these fields to existing Todo entity
@Column({ nullable: true })
notificationJobId?: string;

@Column({ nullable: true })
notificationSentAt?: Date;
```

### Optional: NotificationLog Entity

```typescript
@Entity()
export class NotificationLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  todoId: number;

  @Column()
  status: 'sent' | 'failed' | 'clicked';

  @Column({ nullable: true })
  error?: string;

  @CreateDateColumn()
  sentAt: Date;
}
```

## API Endpoints

### Notification Management (all require JWT auth)

**Subscribe to Push Notifications**
```
POST /api/notifications/subscribe
Authorization: Bearer <token>
Body: {
  endpoint: string,
  keys: {
    p256dh: string,
    auth: string
  },
  userAgent?: string
}
Response: {
  success: true,
  subscriptionId: number
}
```

**Unsubscribe from Push Notifications**
```
DELETE /api/notifications/unsubscribe
Authorization: Bearer <token>
Body: {
  endpoint: string
}
Response: {
  success: true
}
```

**List User Subscriptions**
```
GET /api/notifications/subscriptions
Authorization: Bearer <token>
Response: {
  subscriptions: PushSubscription[]
}
```

**Send Test Notification**
```
POST /api/notifications/test
Authorization: Bearer <token>
Response: {
  success: true,
  message: string
}
```

### Modified Todo Endpoints

Existing endpoints automatically handle notification scheduling:
- `POST /api/todos` - Schedule notification when todo created with dueDate
- `PATCH /api/todos/:id` - Reschedule/cancel notification when dueDate changes
- `DELETE /api/todos/:id` - Cancel scheduled notification

No API contract changes required.

## Backend Implementation

### Technology Stack

- **Bull**: Job queue for scheduling (already compatible with NestJS)
- **web-push**: Web Push protocol implementation
- **Redis**: Bull queue backend (new dependency)

### Module Structure

```
src/
├── notification/
│   ├── notification.module.ts
│   ├── notification.controller.ts
│   ├── notification.service.ts
│   ├── push-subscription.entity.ts
│   ├── notification-log.entity.ts (optional)
│   ├── notification.queue.ts
│   ├── notification.processor.ts
│   └── dto/
│       ├── subscribe.dto.ts
│       └── unsubscribe.dto.ts
```

### Key Services

**NotificationService**
- `subscribe(userId, subscription)` - Store push subscription
- `unsubscribe(userId, endpoint)` - Remove subscription
- `getUserSubscriptions(userId)` - Get all user subscriptions
- `sendNotification(userId, payload)` - Send to all user devices
- `sendTestNotification(userId)` - Test notification delivery

**NotificationQueue**
- `scheduleNotification(todo)` - Create Bull job for reminder
- `cancelNotification(jobId)` - Remove scheduled job
- `rescheduleNotification(todo)` - Update job timing

**NotificationProcessor** (Bull worker)
- Process notification jobs at scheduled time
- Load todo and user subscriptions
- Send push notifications
- Handle errors and cleanup invalid subscriptions
- Log delivery status

### Todo Service Integration

Modify existing TodoService methods:
- `create()` - Call `scheduleNotification()` if dueDate set
- `update()` - Reschedule if dueDate changed, cancel if removed
- `remove()` - Cancel scheduled notification

### Configuration

Environment variables (`.env`):
```
VAPID_PUBLIC_KEY=<generated>
VAPID_PRIVATE_KEY=<generated>
VAPID_SUBJECT=mailto:your-email@example.com
REDIS_HOST=localhost
REDIS_PORT=6379
NOTIFICATION_MINUTES_BEFORE=60
```

Generate VAPID keys using:
```bash
npx web-push generate-vapid-keys
```

## Frontend Implementation

### Service Worker

**File**: `public/service-worker.js`

```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json();

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
    data: {
      todoId: data.todoId,
      url: data.url
    },
    requireInteraction: false,
    tag: `todo-${data.todoId}`
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

### Notification Store

**File**: `frontend/src/stores/notification.ts`

```typescript
export const useNotificationStore = defineStore('notification', {
  state: () => ({
    isSupported: false,
    permission: 'default' as NotificationPermission,
    isSubscribed: false,
    subscription: null as PushSubscription | null
  }),

  actions: {
    async checkSupport(),
    async requestPermission(),
    async subscribe(),
    async unsubscribe(),
    async sendTestNotification()
  }
});
```

### UI Components

1. **Settings Page Toggle**
   - Enable/disable push notifications
   - Show subscription status
   - Test notification button

2. **Permission Banner** (shown on first visit)
   - Explain notification benefits
   - Request permission button
   - Dismissible

3. **Notification Icon** (header/nav)
   - Visual indicator of notification status
   - Quick access to settings

### User Flow

1. User visits app → Check if notifications supported
2. Show permission banner if not asked before
3. User clicks "Enable Notifications"
4. Browser shows permission prompt
5. If granted → Register service worker → Subscribe to push
6. Send subscription to backend API
7. Backend stores subscription in database
8. Done! User will receive notifications

## Notification Timing

**Fixed Schedule**: Remind 1 hour before due date
- Configurable via `NOTIFICATION_MINUTES_BEFORE` environment variable
- Future enhancement: Allow per-user preferences

**Edge Cases**:
- If todo due date is less than 1 hour away → Send immediately
- If todo completed → Cancel scheduled notification
- If todo deleted → Cancel scheduled notification
- If due date removed → Cancel scheduled notification

## Error Handling

### Backend
- Invalid subscription → Remove from database, log error
- Push service unavailable → Retry with exponential backoff (Bull)
- No active subscriptions for user → Skip, log info

### Frontend
- Permission denied → Show explanation, disable feature
- Service worker registration fails → Fallback to in-app reminders
- Network error on subscribe → Show retry button

## Testing Strategy

### Backend Tests
- Unit tests for notification service methods
- Integration tests for API endpoints
- Queue processor tests with mocked web-push
- Test notification delivery and error handling

### Frontend Tests
- Service worker push event handling
- Notification permission flow
- Subscribe/unsubscribe actions
- UI component interactions

### Manual Testing
1. Create todo with due date 1 hour from now
2. Verify Bull job scheduled
3. Wait for notification (or manually trigger job)
4. Verify browser notification appears
5. Click notification → App opens to todo
6. Test with multiple browser tabs/windows
7. Test unsubscribe flow

## Security Considerations

- VAPID keys stored securely (environment variables)
- Subscriptions tied to authenticated users only
- Validate push subscription payloads
- Rate limit notification endpoints
- Sanitize notification content to prevent XSS

## Future Enhancements

1. **User Preferences**
   - Customize reminder timing per user
   - Notification quiet hours
   - Notification sound preferences

2. **Additional Notification Events**
   - Overdue task reminders
   - Daily digest of upcoming tasks
   - Task completion celebrations

3. **Notification History**
   - View past notifications
   - Mark as read/unread
   - Notification analytics

4. **Mobile Push**
   - Native iOS/Android push via FCM/APNS
   - Unified notification system

## Implementation Phases

### Phase 1: Backend Foundation
- Set up Bull queue and Redis
- Create PushSubscription entity and migration
- Implement notification service and API endpoints
- Generate VAPID keys

### Phase 2: Notification Scheduling
- Integrate with TodoService
- Implement queue processor
- Add notification job scheduling logic
- Test job execution

### Phase 3: Frontend Integration
- Register service worker
- Create notification store
- Implement subscription flow
- Build UI components

### Phase 4: Testing & Polish
- Write unit and integration tests
- Manual testing across browsers
- Error handling improvements
- Documentation

## Success Criteria

- ✅ Users can subscribe to push notifications
- ✅ Browser displays notification 1 hour before todo due date
- ✅ Clicking notification opens app to relevant todo
- ✅ Notifications work across multiple devices/browsers
- ✅ Graceful handling of permission denied
- ✅ No notifications sent for completed/deleted todos
- ✅ System handles subscription cleanup automatically

## Dependencies

### New Backend Dependencies
```json
{
  "@nestjs/bull": "^10.0.0",
  "bull": "^4.11.0",
  "web-push": "^3.6.0",
  "ioredis": "^5.3.0"
}
```

### New Frontend Dependencies
None (uses native Web Push API)

### Infrastructure
- Redis server (local or cloud)

## Rollout Plan

1. Deploy backend with notification endpoints (no auto-scheduling yet)
2. Deploy frontend with opt-in notification UI
3. Monitor subscription success rate
4. Enable auto-scheduling for todos with due dates
5. Monitor notification delivery rates
6. Gather user feedback
7. Iterate on timing and content
