# PlaySync — Next.js API Integration Documentation

All HTTP calls go through a single Axios instance (`src/lib/api-client.ts`).
The base URL is read from `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000`).

---

## Table of Contents

1. [API Client & Auth Interceptor](#1-api-client--auth-interceptor)
2. [Auth API](#2-auth-api)
3. [Profile API](#3-profile-api)
4. [Games API](#4-games-api)
5. [Chat API](#5-chat-api)
6. [History API](#6-history-api)
7. [Scorecard API](#7-scorecard-api)
8. [Leaderboard API](#8-leaderboard-api)
9. [Notifications API](#9-notifications-api)
10. [Tournaments API](#10-tournaments-api)
11. [Payments API](#11-payments-api)
12. [Admin API](#12-admin-api)
13. [WebSocket (Socket.IO)](#13-websocket-socketio)

---

## 1. API Client & Auth Interceptor

**File:** `src/lib/api-client.ts`

### How it works

```
Every request → attach Bearer token (from auth store)
Every 401 response →
  ├── If already refreshing  → queue the request, retry when done
  └── If not refreshing      → call POST /api/v1/auth/refresh-token
        ├── Success → update store tokens, retry all queued requests
        └── Failure → call performLogout(), reject all queued requests
```

The client is configured with:
- `baseURL` = `NEXT_PUBLIC_API_URL`
- `withCredentials: true` (cookies sent cross-origin)
- `timeout: 15000 ms`

### `configureAuth(getToken, getRefToken, logout, setToken, setRefToken)`

Called once at app bootstrap (inside the Zustand auth store) to inject token accessors and logout into the client, avoiding circular imports.

---

## 2. Auth API

**Service:** `src/features/auth/api/auth-service.ts`

### Endpoints

| Method | Path | Service call | What it does |
|--------|------|-------------|--------------|
| `POST` | `/api/v1/auth/login` | `authService.login(data)` | Authenticate with email & password. Returns `{ accessToken, refreshToken, user }`. |
| `POST` | `/api/v1/auth/register/user` | `authService.register(data)` | Create a new user account. No return value. |
| `POST` | `/api/v1/auth/logout` | `authService.logout()` | Invalidate server-side session/refresh token. |
| `POST` | `/api/v1/auth/refresh-token` | *(auto — interceptor only)* | Exchange refresh token for new access token. Called automatically on 401. |
| `GET`  | `/api/v1/auth/me` | *(used inside store on init)* | Returns currently authenticated user object. |
| `GET`  | `/api/v1/auth/users` | `authService.getAllUsers()` | Returns list of all users (used for game invite / player search). |
| `POST` | `/api/v1/auth/forgot-password` | `authService.forgotPassword({ email })` | Triggers OTP email to the given address. |
| `POST` | `/api/v1/auth/verify-otp` | `authService.verifyOtp({ email, otp })` | Validates OTP. Returns `{ valid: boolean }`. |
| `POST` | `/api/v1/auth/reset-password` | `authService.resetPassword({ email, otp, newPassword, confirmPassword })` | Sets a new password after OTP verification. |

### Call scenarios

| Scenario | Calls made |
|----------|-----------|
| User opens login page and submits form | `authService.login(credentials)` → store saves tokens → `configureAuth` injects them into client |
| User clicks "Forgot Password" | `authService.forgotPassword({ email })` → OTP sent by email |
| User enters OTP | `authService.verifyOtp({ email, otp })` → if `valid`, move to reset form |
| User submits new password | `authService.resetPassword({ email, otp, newPassword, confirmPassword })` |
| User registers | `authService.register({ fullName, email, password, ... })` |
| App boots (page refresh) | Access token checked in store; if missing, interceptor will auto-refresh on first protected call |
| User logs out | `authService.logout()` → store cleared → socket disconnected |

---

## 3. Profile API

**Service:** `src/features/auth/api/auth-service.ts` (same file)

### Endpoints

| Method | Path | Service call | What it does |
|--------|------|-------------|--------------|
| `GET`   | `/api/v1/profile` | `authService.getProfile()` | Fetch the current user's full profile. |
| `PATCH` | `/api/v1/profile` | `authService.updateProfile(data)` | Update profile fields or avatar (`FormData` or plain object). |
| `PATCH` | `/api/v1/profile/change-password` | `authService.changePassword({ currentPassword, newPassword, confirmNewPassword })` | Change password while logged in. |

### Call scenarios

| Scenario | Calls made |
|----------|-----------|
| User opens Profile page | `authService.getProfile()` |
| User edits bio / uploads avatar | `authService.updateProfile(formData)` |
| User changes their password from settings | `authService.changePassword({ currentPassword, newPassword, confirmNewPassword })` |

---

## 4. Games API

**Service:** `src/features/games/api/game-service.ts`

### Endpoints

| Method | Path | Service call | What it does |
|--------|------|-------------|--------------|
| `GET`    | `/api/v1/games` | `gameService.getAll(params)` | List all games with pagination & filters. |
| `GET`    | `/api/v1/games/my/created` | `gameService.getMyCreated(params)` | Games created by the logged-in user. |
| `GET`    | `/api/v1/games/my/joined` | `gameService.getMyJoined(params)` | Games the logged-in user joined. |
| `GET`    | `/api/v1/games/:id?details=true` | `gameService.getById(id)` | Full game detail including participants. |
| `POST`   | `/api/v1/games` | `gameService.create(formData)` | Create a new game (multipart/form-data for image). |
| `PATCH`  | `/api/v1/games/:id` | `gameService.update(id, formData)` | Update game fields or image. |
| `DELETE` | `/api/v1/games/:id` | `gameService.delete(id)` | Delete a game (creator only). |
| `POST`   | `/api/v1/games/:id/join` | `gameService.join(id)` | Join an open game. |
| `POST`   | `/api/v1/games/:id/leave` | `gameService.leave(id)` | Leave a game before it ends. |
| `GET`    | `/api/v1/games/:id/can-join` | `gameService.canJoin(id)` | Check eligibility before joining. Returns `{ canJoin, reason? }`. |
| `POST`   | `/api/v1/games/:id/cancel` | `gameService.cancel(id, reason)` | Cancel a game with a reason string. |
| `POST`   | `/api/v1/games/:id/complete` | `gameService.complete(id)` | Mark a game as completed. |
| `GET`    | `/api/v1/games/tags` | `gameService.getTags()` | Fetch all available game tags for filtering. |

### Query params (pagination & filtering)

`QueryParams` object accepted by `getAll`, `getMyCreated`, `getMyJoined`:
```ts
{
  page?: number;
  limit?: number;
  search?: string;
  status?: 'OPEN' | 'FULL' | 'ENDED' | 'CANCELLED';
  category?: 'ONLINE' | 'OFFLINE';
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

### Call scenarios

| Scenario | Calls made |
|----------|-----------|
| Browse games page loads | `gameService.getAll({ page: 1, limit: 20 })` + `gameService.getTags()` |
| User applies filter by status/category | `gameService.getAll({ status, category, ... })` |
| User clicks a game card | `gameService.getById(id)` |
| User clicks "Join" button | `gameService.canJoin(id)` → if `canJoin === true` → `gameService.join(id)` |
| User clicks "Leave" | `gameService.leave(id)` |
| Creator opens "My Games" dashboard | `gameService.getMyCreated()` + `gameService.getMyJoined()` |
| Creator creates a game (form submit) | `gameService.create(formData)` |
| Creator edits a game | `gameService.update(id, formData)` |
| Creator cancels a game | `gameService.cancel(id, reason)` |
| Creator marks game done | `gameService.complete(id)` |
| Creator deletes a game | `gameService.delete(id)` |

---

## 5. Chat API

**Service:** `src/features/chat/api/chat-service.ts`  
**Hook:** `src/features/chat/hooks/useGameChat.ts`

> Real-time messages go over **WebSocket** (see §13). The REST endpoint only fetches historical messages on load.

### Endpoints

| Method | Path | Service call | What it does |
|--------|------|-------------|--------------|
| `GET` | `/api/v1/games/:gameId/chat` | `chatService.getChatHistory(gameId, { page, limit })` | Paginated message history for a game. |

### Call scenarios

| Scenario | Calls made |
|----------|-----------|
| User opens game chat panel | `chatService.getChatHistory(gameId)` to hydrate initial messages |
| User scrolls up (load more) | `chatService.getChatHistory(gameId, { page: n, limit: 30 })` |
| User sends a message | Emitted over Socket.IO (`sendMessage` event), NOT via REST |
| New message arrives | Received via Socket.IO `newMessage` event, appended to local state |

---

## 6. History API

**Service:** `src/features/history/api/history-service.ts`

### Endpoints

| Method | Path | Service call | What it does |
|--------|------|-------------|--------------|
| `GET` | `/api/v1/history` | `historyService.getMyHistory(params)` | Paginated list of games the user participated in. |
| `GET` | `/api/v1/history/stats` | `historyService.getStats()` | Returns `{ totalGames, completedGames, activeGames, leftEarly, winRate? }`. |
| `GET` | `/api/v1/history/count` | `historyService.getCount()` | Returns total participation count as a number. |

### Call scenarios

| Scenario | Calls made |
|----------|-----------|
| User opens History page | `historyService.getMyHistory()` + `historyService.getStats()` |
| User paginates | `historyService.getMyHistory({ page: n })` |
| Dashboard summary widget | `historyService.getCount()` |

---

## 7. Scorecard API

**Service:** `src/features/scorecard/api/scorecard-service.ts`

### Endpoints

| Method | Path | Service call | What it does |
|--------|------|-------------|--------------|
| `GET` | `/api/v1/scorecard` | `scorecardService.getMyScorecard()` | Returns `{ totalPoints, xp, level, gamesPlayed, wins, losses, winRate, rank, breakdown }`. |
| `GET` | `/api/v1/scorecard/trend?days=N` | `scorecardService.getTrend(days)` | Returns `{ date, points }[]` for charting. Returns `[]` if endpoint doesn't exist (404 handled silently). |

### Notes
- `totalPoints` and `xp` are kept in sync (both normalised on the client).
- `getTrend` fails silently (returns `[]`) on 404/405 so the UI degrades gracefully.

### Call scenarios

| Scenario | Calls made |
|----------|-----------|
| User opens their Profile / Stats page | `scorecardService.getMyScorecard()` |
| Stats trend chart renders | `scorecardService.getTrend(7)` (last 7 days) |

---

## 8. Leaderboard API

**Service:** `src/features/leaderboard/api/leaderboard-service.ts`

### Endpoints

| Method | Path | Service call | What it does |
|--------|------|-------------|--------------|
| `GET` | `/api/v1/leaderboard` | `leaderboardService.getLeaderboard(params)` | Ranked list of players by XP. Supports `period` filter (`daily`, `weekly`, `monthly`, `all`). Returns up to 50 entries by default. |
| `GET` | `/api/v1/leaderboard/stats` | `leaderboardService.getStats()` | Returns `{ totalPlayers }`. |

### Call scenarios

| Scenario | Calls made |
|----------|-----------|
| User opens Leaderboard page | `leaderboardService.getLeaderboard({ period: 'all', limit: 50 })` + `leaderboardService.getStats()` |
| User switches period tab (e.g. "Weekly") | `leaderboardService.getLeaderboard({ period: 'weekly' })` |

---

## 9. Notifications API

**Service:** `src/features/notifications/api/notification-service.ts`  
**Hook:** `src/features/notifications/hooks/useNotifications.ts`

### Notification types

`game_join` | `game_leave` | `game_create` | `game_full` | `game_start` | `game_end` | `chat_message` | `leaderboard` | `game_cancel` | `game_cancelled` | `game_completed` | `completion_bonus` | `system`

### Endpoints

| Method | Path | Service call | What it does |
|--------|------|-------------|--------------|
| `GET`   | `/api/v1/notifications` | `notificationService.getNotifications(params)` | Paginated notification list + `unreadCount`. |
| `GET`   | `/api/v1/notifications/unread-count` | `notificationService.getUnreadCount()` | Returns unread count number only. |
| `PATCH` | `/api/v1/notifications/read-all` | `notificationService.markAllAsRead()` | Mark every notification as read. |
| `PATCH` | `/api/v1/notifications/:id/read` | `notificationService.markAsRead(id)` | Mark a single notification as read. |

### Call scenarios

| Scenario | Calls made |
|----------|-----------|
| Navbar bell icon renders | `notificationService.getUnreadCount()` (polled or on socket event) |
| User opens notification panel | `notificationService.getNotifications({ page: 1, limit: 20 })` |
| User clicks a notification | `notificationService.markAsRead(id)` → navigate to `notification.link` |
| User clicks "Mark all read" | `notificationService.markAllAsRead()` |
| Real-time push arrives | Socket.IO `notification` event → unread count incremented locally |

---

## 10. Tournaments API

**Services:** `src/features/tournaments/api/tournament-service.ts` and `tournament.api.ts`

### Endpoints

| Method | Path | Service call | What it does |
|--------|------|-------------|--------------|
| `GET`    | `/api/v1/tournaments` | `tournamentApi.list(params)` / `tournamentService.getAll()` | All tournaments. Supports `status`, `type`, `page`, `limit`. |
| `GET`    | `/api/v1/tournaments/:id` | `tournamentApi.getById(id)` / `tournamentService.getById(id)` | Single tournament detail. |
| `POST`   | `/api/v1/tournaments` | `tournamentApi.create(data)` / `tournamentService.create(data)` | Create a new tournament. |
| `GET`    | `/api/v1/tournaments/my/created` | `tournamentApi.myTournaments()` | Tournaments created by the current user. |
| `PATCH`  | `/api/v1/tournaments/:id` | `tournamentApi.update(id, data)` | Update tournament details. |
| `DELETE` | `/api/v1/tournaments/:id` | `tournamentApi.delete(id)` | Delete a tournament. |
| `GET`    | `/api/v1/tournaments/:id/payment/status` | `tournamentApi.getPaymentStatus(id)` | Check if current user has paid for this tournament. Returns `{ status: 'pending' \| 'success' \| 'failed' \| null }`. |
| `GET`    | `/api/v1/tournaments/:id/chat/access` | `tournamentApi.checkChatAccess(id)` | Whether current user can access tournament chat. Returns `{ allowed: boolean }`. |
| `GET`    | `/api/v1/tournaments/:id/payments` | `tournamentApi.getTournamentPayments(id)` | All payments for a specific tournament (creator only). |

### Call scenarios

| Scenario | Calls made |
|----------|-----------|
| User browses tournaments list | `tournamentApi.list({ page: 1 })` |
| User opens a tournament detail | `tournamentApi.getById(id)` + `tournamentApi.getPaymentStatus(id)` |
| User wants to join (paid tournament) | `tournamentApi.initiatePayment(id)` → redirect to eSewa → on return `tournamentApi.verifyPayment(transactionUuid)` |
| User opens tournament chat | `tournamentApi.checkChatAccess(id)` → if `allowed` render chat |
| Creator opens My Tournaments | `tournamentApi.myTournaments()` |
| Creator views earnings dashboard | `tournamentApi.getDashboardTransactions()` |
| Creator views who paid for their tournament | `tournamentApi.getTournamentPayments(tournamentId)` |
| Admin creates tournament | `tournamentApi.create(data)` |
| Admin edits tournament | `tournamentApi.update(id, data)` |
| Admin deletes tournament | `tournamentApi.delete(id)` |

---

## 11. Payments API

**Service:** `src/features/tournaments/api/tournament-service.ts` (`paymentService`) and `tournament.api.ts` (`tournamentApi`)

Payments use **eSewa** as the gateway (Nepal).

### Endpoints

| Method | Path | Service call | What it does |
|--------|------|-------------|--------------|
| `POST` | `/api/v1/payments/initiate` | `paymentService.initiatePayment(tournamentId)` / `tournamentApi.initiatePayment(id)` | Creates a payment order. Returns `{ paymentUrl, params, paymentId }`. Frontend redirects user to `paymentUrl` with `params`. |
| `GET`  | `/api/v1/payments/verify?data=<base64>` | `paymentService.verifyPayment(dataBase64)` / `tournamentApi.verifyPayment(uuid)` | eSewa redirects back to the app with a `data` query param; frontend forwards it to backend to verify. |
| `GET`  | `/api/v1/payments/admin/transactions` | `paymentService.getAdminTransactions()` / `tournamentApi.getDashboardTransactions()` | All transactions with total collected (admin/creator view). |

### Payment flow

```
1. User clicks "Pay & Join"
2. POST /api/v1/payments/initiate  { tournamentId }
   ← { paymentUrl, params, paymentId }
3. Frontend submits form to eSewa (paymentUrl + params)
4. eSewa redirects user back to /payment/verify?data=<base64>
5. GET /api/v1/payments/verify?data=<base64>
   ← payment confirmed, user added to tournament
```

---

## 12. Admin API

**Service:** `src/features/admin/api/admin-service.ts`

> All admin endpoints require admin role. Access is enforced server-side.

### Endpoints

| Method | Path | Service call | What it does |
|--------|------|-------------|--------------|
| `GET` | `/api/v1/admin/stats` | `adminService.getStats()` | Returns platform-wide stats: `{ totalUsers, totalGames, totalOnlineGames, totalOfflineGames, activeGames, totalParticipantsAcrossAllGames }`. |
| `GET` | `/api/v1/admin/users` | `adminService.getUsers(params)` | Paginated user list. Filterable by `search`, sortable by `createdAt`, `lastLogin`, `fullName`. |
| `GET` | `/api/v1/admin/users/:userId` | `adminService.getUserById(userId)` | Single user detail with game stats. |
| `GET` | `/api/v1/admin/games` | `adminService.getGames(params)` | All games (online + offline). Filterable by `status`. |
| `GET` | `/api/v1/admin/games/online` | `adminService.getOnlineGames(params)` | Online games only. |
| `GET` | `/api/v1/admin/games/offline` | `adminService.getOfflineGames(params)` | Offline games only. |
| `GET` | `/api/v1/admin/games/:gameId` | `adminService.getGameById(gameId)` | Full game detail + participant list. |

### Call scenarios

| Scenario | Calls made |
|----------|-----------|
| Admin opens dashboard | `adminService.getStats()` |
| Admin opens Users tab | `adminService.getUsers({ page: 1, limit: 20 })` |
| Admin searches for a user | `adminService.getUsers({ search: 'name', page: 1 })` |
| Admin clicks a user row | `adminService.getUserById(userId)` |
| Admin opens Games tab | `adminService.getGames({ page: 1 })` |
| Admin filters by Online | `adminService.getOnlineGames({ page: 1, status: 'OPEN' })` |
| Admin clicks a game row | `adminService.getGameById(gameId)` |

---

## 13. WebSocket (Socket.IO)

**File:** `src/lib/socket.ts`

### Connection

```ts
import { getSocket } from '@/lib/socket';
const socket = getSocket(accessToken); // singleton per tab
```

- Connects to `NEXT_PUBLIC_API_URL` with `auth: { token }`.
- Transports: WebSocket first, polling fallback.
- Auto-reconnects up to 5 times.
- If token changes (re-login), socket reconnects with the new token automatically.
- On logout: `disconnectSocket()` cleans up all listeners and nulls the instance.

### Socket events used throughout the app

| Direction | Event | Used for |
|-----------|-------|----------|
| emit | `joinGame` | Subscribe to a game room on open |
| emit | `leaveGame` | Unsubscribe from game room |
| emit | `sendMessage` | Send a chat message |
| on | `newMessage` | Receive a new chat message |
| on | `gameUpdated` | Game state changed (player joined/left, status change) |
| on | `notification` | Real-time notification pushed from server |
| on | `playerJoined` | Another player joined the current game |
| on | `playerLeft` | Another player left the current game |
| on | `gameCancelled` | Game was cancelled by creator |
| on | `gameCompleted` | Game was marked complete |

### Call scenarios

| Scenario | Socket activity |
|----------|----------------|
| User opens a game detail page | `emit joinGame { gameId }` |
| User leaves game detail page | `emit leaveGame { gameId }` |
| User sends chat message | `emit sendMessage { gameId, content }` |
| Another user joins | server pushes `playerJoined` event to room |
| Creator cancels | server pushes `gameCancelled` to all participants |
| User receives notification | server pushes `notification` event globally to user's room |

---

## Response shape (all REST endpoints)

```ts
{
  success: boolean;
  message: string;
  data: T;       // actual payload
}
```

Paginated responses include:
```ts
data: {
  // resource key (e.g. "games", "notifications", "history")
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  }
}
```

## Image URLs

```ts
import { getImageUrl } from '@/lib/constants';
getImageUrl(user.profilePicture); // prepends API_URL to /uploads/... paths
```

---

*Generated from source — `src/lib/constants.ts`, `src/lib/api-client.ts`, `src/features/*/api/*-service.ts`, `src/features/tournaments/api/tournament.api.ts`, `src/lib/socket.ts`*
