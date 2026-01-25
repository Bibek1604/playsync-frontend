# Playsync Frontend Architecture

The project has been refactored to use a "Slice/Feature-based" architecture for better scalability and maintainability.

## Directory Structure

```
src/
├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── (auth)/           # Auth related routes (grouped to share layout if needed)
│   ├── dashboard/        # Dashboard page
│   ├── profile/          # Profile page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
│
├── features/             # Feature-based modules (Domain logic)
│   └── auth/             # Auth feature
│       ├── api/          # API service calls specific to Auth
│       ├── components/   # Auth-specific UI components
│       ├── hooks/        # Custom hooks (useAuth, useLogin, etc.)
│       └── store/        # Zustand store for Auth state
│
├── components/           # Shared/Generic UI components
│   └── ui/               # Base components (Buttons, Inputs, etc.)
│
├── lib/                  # Core utilities and configs
│   ├── api-client.ts     # Central Axios instance with interceptors
│   ├── constants.ts      # Global constants & Endpoints

│
└── types/                # Global TypeScript definitions
```

## State Management (Zustand)

- **Auth Store**: Located in `src/features/auth/store/auth-store.ts`.
- Manages `user`, `accessToken`, `isAuthenticated`.
- Handles side-effects (API calls) via actions.
- Auto-configures the API client to inject the token.

## API Layer

- **Client**: `src/lib/api-client.ts`. Configured with Interceptors for JWT handling (auto-refresh).
- **Services**: Each feature has its own service (e.g., `auth-service.ts`) that uses the client.

## Components

- **Hooks**: Use hooks like `useLogin()` or `useAuth()` to interact with logic.
- **Pages**: Pages are thin wrappers connecting Hooks to UI.