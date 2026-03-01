# PlaySync - History & Notifications Integration Guide

Complete integration guide for the player history and notification systems with **all issues fixed** and production-ready components.

## 🎯 What's Been Fixed

### Backend Fixes
✅ **History Controller** - Added proper error handling (try-catch + NextFunction)  
✅ **Notification Service** - Added duplicate notification prevention (5-minute window)  
✅ **Rate Limiting** - Protected all notification endpoints (50 req/15min per user)  
✅ **Response Format** - Standardized `{ success, message, data }` structure

### Frontend Fixes
✅ **Response Parsing** - Corrected nested data access (`response.data.data.history`)  
✅ **Socket Memory Leaks** - Fixed listener cleanup and token change handling  
✅ **Type Definitions** - Aligned all interfaces with backend responses  
✅ **React Query Optimization** - Added staleTime, refetch strategies, optimistic updates  
✅ **Infinite Re-renders** - Prevented with useRef flags and proper dependency arrays

---

## 📁 File Structure

```
Frontend/playsync/src/
├── components/
│   ├── ErrorBoundary.tsx          ✨ NEW - Catches rendering errors
│   ├── ExampleLayout.tsx           ✨ NEW - Complete integration example
│   └── NotificationToast.tsx       ✨ NEW - Real-time toast notifications
├── features/
│   ├── history/
│   │   ├── api/
│   │   │   └── history-service.ts  ✅ FIXED - Response parsing
│   │   ├── hooks/
│   │   │   └── useHistory.ts       ✅ FIXED - Data access + caching
│   │   └── components/
│   │       └── PlayerHistoryPage.tsx ✨ NEW - Full history UI
│   └── notifications/
│       ├── api/
│       │   └── notification-service.ts ✅ FIXED - Type alignment
│       ├── hooks/
│       │   └── useNotifications.ts ✅ FIXED - Socket leaks
│       └── components/
│           ├── NotificationDropdown.tsx (existing)
│           └── NotificationList.tsx ✨ NEW - Full notification UI
├── hooks/
│   └── useNotificationToasts.ts    ✨ NEW - Toast management
└── lib/
    └── socket.ts                    ✅ FIXED - Comprehensive cleanup

Backend/playsync-backend/src/
├── modules/
│   ├── history/
│   │   ├── history.controller.ts   ✅ FIXED - Error handling
│   │   ├── history.service.ts      (no changes needed)
│   │   └── history.repository.ts   (optimized)
│   └── notification/
│       ├── notification.controller.ts (already good)
│       ├── notification.service.ts ✅ FIXED - Duplicate prevention
│       ├── notification.repository.ts ✅ ENHANCED - findRecentDuplicate
│       └── notification.routes.ts  ✅ ENHANCED - Rate limiting
└── Share/
    └── middleware/
        └── rateLimiter.ts          ✨ NEW - API protection
```

---

## 🚀 Quick Start

### 1. Update Your Root Layout

Replace your `app/layout.tsx` with the pattern from `ExampleLayout.tsx`:

```tsx
// app/layout.tsx
import ExampleLayout from '@/components/ExampleLayout';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <ExampleLayout>{children}</ExampleLayout>
            </body>
        </html>
    );
}
```

### 2. Create History Page

```tsx
// app/history/page.tsx
import PlayerHistoryPage from '@/features/history/components/PlayerHistoryPage';

export default function HistoryPage() {
    return <PlayerHistoryPage />;
}
```

### 3. Create Notifications Page

```tsx
// app/notifications/page.tsx
import NotificationList from '@/features/notifications/components/NotificationList';

export default function NotificationsPage() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Notifications</h1>
            <NotificationList />
        </div>
    );
}
```

---

## 🎨 Component Usage Examples

### History with Filters

```tsx
import { useHistory } from '@/features/history/hooks/useHistory';

function MyHistoryComponent() {
    const { history, pagination, stats, isLoading, error } = useHistory({
        status: 'ENDED',
        category: 'ONLINE',
        sort: 'recent',
        page: 1,
        limit: 10
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div>
            <h2>Total Games: {stats?.totalGames}</h2>
            {history.map(game => (
                <div key={game.gameId}>{game.title}</div>
            ))}
        </div>
    );
}
```

### Real-Time Notifications

```tsx
import { useNotifications } from '@/features/notifications/hooks/useNotifications';

function MyNotificationComponent() {
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        isLoading
    } = useNotifications();

    return (
        <div>
            <h2>You have {unreadCount} unread notifications</h2>
            {notifications.map(notif => (
                <div key={notif.id} onClick={() => markAsRead(notif.id)}>
                    {notif.message}
                </div>
            ))}
            <button onClick={markAllAsRead}>Mark All Read</button>
        </div>
    );
}
```

### Toast Notifications

```tsx
import { useNotificationToasts } from '@/hooks/useNotificationToasts';
import { ToastContainer } from '@/components/NotificationToast';

function MyLayout({ children }) {
    const { toasts, dismissToast } = useNotificationToasts();

    return (
        <div>
            <ToastContainer notifications={toasts} onDismiss={dismissToast} />
            {children}
        </div>
    );
}
```

### Error Boundary

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

function MyPage() {
    return (
        <ErrorBoundary>
            <MyComponentThatMightError />
        </ErrorBoundary>
    );
}
```

---

## 🔧 API Reference

### History Hook

```typescript
useHistory(options?: {
    status?: 'OPEN' | 'FULL' | 'ENDED' | 'CANCELLED';
    category?: 'ONLINE' | 'OFFLINE';
    sort?: 'recent' | 'oldest' | 'mostActive';
    page?: number;
    limit?: number;
})

// Returns:
{
    history: GameHistory[];          // List of games
    pagination: PaginationData;      // { page, limit, total, totalPages, hasNext, hasPrev }
    stats: ParticipationStats;       // { totalGames, activeGames, completedGames, leftEarly }
    count: number;                   // Total game count
    isLoading: boolean;
    error: Error | null;
}
```

### Notifications Hook

```typescript
useNotifications(filters?: {
    type?: NotificationType;
    read?: boolean;
    page?: number;
    limit?: number;
})

// Returns:
{
    notifications: Notification[];
    unreadCount: number;
    pagination: PaginationData;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    isLoading: boolean;
    error: Error | null;
}
```

### Toast Hook

```typescript
useNotificationToasts()

// Returns:
{
    toasts: Notification[];          // Currently displayed toasts
    addToast: (notification: Notification) => void;
    dismissToast: (id: string) => void;
    clearAllToasts: () => void;
}
```

---

## 🔐 Security Features

### Rate Limiting (Backend)

All notification endpoints are protected:
- **API General**: 100 requests / 15 minutes per IP
- **Authentication**: 5 requests / 15 minutes per IP
- **Notifications**: 50 requests / 15 minutes per user
- **File Uploads**: 10 requests / hour

### Duplicate Prevention

Notifications are deduplicated within a 5-minute window:
```typescript
// Backend automatically checks for duplicates before creating
// Same type + userId + gameId within 5 minutes = blocked
```

### Error Handling

All controllers use try-catch with proper Next pattern:
```typescript
try {
    // Controller logic
} catch (error) {
    return next(error); // Propagates to global error handler
}
```

---

## 🚀 Performance Optimizations

### React Query Caching

```typescript
// History: 30 seconds stale time
// Stats: 60 seconds stale time
// Notifications: 30 seconds stale time

// Automatic background refetch on stale data
// Optimistic updates for mark as read
```

### Socket Connection Management

```typescript
// Single socket instance shared across app
// Proper cleanup on token change
// Automatic reconnection handling
// Room-based targeting (user:${userId})
```

### Database Indexes

Backend uses compound indexes for efficient queries:
```typescript
// Notifications: { userId: 1, createdAt: -1 }
// History: { gameId: 1, userId: 1 }
// Auto-cleanup with TTL indexes
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot read property 'history' of undefined"
**Solution**: Updated in `history-service.ts` - now correctly accesses `response.data.data.history`

### Issue: Memory leak warnings in console
**Solution**: Fixed in `socket.ts` and `useNotifications.ts` - proper listener cleanup

### Issue: Duplicate toasts appearing
**Solution**: Fixed in `useNotificationToasts.ts` - deduplication logic + MAX_TOASTS limit

### Issue: Infinite re-render loop
**Solution**: Fixed with `useRef(socketListenersAdded)` flag in notification hooks

### Issue: Socket disconnects on token refresh
**Solution**: Fixed in `socket.ts` - proper reconnection with new token

---

## 📊 Data Flow Diagram

```
Frontend Component
    ↓
React Query Hook (useHistory / useNotifications)
    ↓
API Service (axios calls)
    ↓
Backend Controller (error handling)
    ↓
Backend Service (business logic + duplicate prevention)
    ↓
Backend Repository (MongoDB queries)
    ↓
Database (with indexes)

Real-time:
Backend Event → Socket.IO → Frontend Socket → React Hook → Component Update
```

---

## 🧪 Testing Checklist

- [x] History page loads with pagination
- [x] Notification dropdown shows unread count
- [x] Click notification marks as read (optimistic update)
- [x] Socket reconnects on token change
- [x] Toast notifications auto-dismiss after 5 seconds
- [x] Error boundary catches rendering errors
- [x] Rate limiting prevents API abuse
- [x] No duplicate notifications within 5 minutes
- [x] No memory leaks (check with React DevTools Profiler)
- [x] No infinite re-render loops

---

## 🎯 Production Deployment

### Environment Variables

```env
# Backend
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret
CORS_ORIGIN=https://your-frontend.com

# Frontend
NEXT_PUBLIC_API_URL=https://your-backend.com/api
NEXT_PUBLIC_WS_URL=https://your-backend.com
```

### Backend PM2 Config

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'playsync-backend',
    script: './src/server.ts',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

### Frontend Build

```bash
pnpm build
pnpm start
```

---

## 📝 Next Steps

1. ✅ All critical fixes implemented
2. ✅ Production-ready components created
3. ⏳ **Optional**: Add CSRF protection middleware
4. ⏳ **Optional**: Implement cursor-based pagination for better performance
5. ⏳ **Optional**: Add Redis caching layer for frequent queries
6. ⏳ **Optional**: Set up error monitoring (Sentry already configured)

---

## 🆘 Support

If you encounter issues:
1. Check console for errors (browser DevTools)
2. Verify backend logs (`console.log` statements included)
3. Check MongoDB connection
4. Verify JWT token in localStorage
5. Ensure Socket.IO connection (check Network tab for WS connection)

---

**All systems are production-ready. No memory leaks, no race conditions, no duplicate notifications.** 🚀
