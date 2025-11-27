# Friends Map

## Overview

Friends Map is a social networking application that enables users to discover and connect with friends through trusted introductions. The app visualizes social connections in an interactive map interface, showing direct friends and friends-of-friends in concentric circles. Users can request introductions through mutual connections, manage their network, and invite new users to join the platform.

The application follows a modern full-stack architecture with React on the frontend and Express on the backend, using PostgreSQL (via Neon) for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server, configured to serve from the `client` directory
- React Router (via Wouter) for client-side routing with paths for map, requests, connections, profile, settings, and authentication

**UI Component System**
- Shadcn UI components (New York style) with Radix UI primitives for accessible, composable components
- Tailwind CSS with custom theming using CSS variables for consistent pastel color palette
- Framer Motion for animations and interactive transitions
- Custom design system with soft gradients (blue-50 to purple-50), rounded corners (1rem default radius), and friendly typography (Nunito font family)

**State Management**
- TanStack Query (React Query) for server state management, data fetching, and caching
- Auth context provider for global authentication state
- Custom hooks pattern for API interactions (`useCurrentUser`, `useFriends`, `useIntroRequests`, etc.)

**Key Pages & Features**
- Interactive friends map with draggable bubbles showing 1st and 2nd degree connections
- Introduction request system with pending/approved/declined states
- Friend discovery and search functionality
- User profile management with social links (Instagram, WhatsApp, Facebook)
- Invitation system for onboarding new users via link or SMS

### Backend Architecture

**Server Framework**
- Express.js REST API with session-based authentication
- TypeScript throughout for type safety across the stack
- Custom logging middleware for request tracking

**Authentication & Sessions**
- Passport.js with Local Strategy for username/password authentication
- Express-session for session management with configurable storage
- Scrypt-based password hashing with salts for security
- Session-based auth state exposed via `/api/auth/me` endpoint

**API Design**
- RESTful endpoints organized by domain (auth, users, friends, intro-requests, settings)
- Consistent error handling and JSON response format
- Request validation using Zod schemas derived from Drizzle models

**Core API Routes**
- Auth: `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- Users: `/api/users` (search), `/api/users/:id` (get/update)
- Friends: `/api/friends` (list), `/api/friends/fof` (friends-of-friends), `/api/friends/:id` (add/remove)
- Intro Requests: `/api/intro-requests/received`, `/api/intro-requests/sent`, `/api/intro-requests` (create), `/api/intro-requests/:id/approve|decline`
- Settings: `/api/settings` (get/update)

### Data Storage & Schema

**Database System**
- PostgreSQL via Neon serverless driver with WebSocket connections
- Drizzle ORM for type-safe database queries and schema management
- Schema-first approach with TypeScript types generated from Drizzle schemas

**Core Data Models**
- **Users**: id, username, password, fullName, photoURL, location, about, social handles, friends array, timestamps
- **IntroRequests**: id, fromUserId, toUserId, viaUserId (mutual friend), message, status (pending/approved/declined), timestamps
- **UserSettings**: id, userId, notification preferences (notifications, email updates, intro requests toggles)

**Data Relationships**
- Users have many friends (stored as text array in users.friends)
- IntroRequests link three users: requester (from), target (to), and mutual connection (via)
- One-to-one relationship between Users and UserSettings

**Storage Layer Abstraction**
- IStorage interface defines all data operations
- DatabaseStorage class implements storage using Drizzle
- Separation allows for future storage backend swapping

### Build & Deployment

**Development Mode**
- Vite dev server on port 5000 with HMR
- Express server runs via tsx with NODE_ENV=development
- Replit-specific plugins for development banner and error overlay

**Production Build**
- Two-stage build: Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`
- Server dependencies are bundled (allowlist includes common deps) to reduce cold start times
- Static files served by Express from the built client directory

**Environment Configuration**
- DATABASE_URL required for Neon PostgreSQL connection
- SESSION_SECRET for session encryption (falls back to default in development)
- NODE_ENV for environment-specific behavior

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database accessed via `@neondatabase/serverless`
- Connection pooling with WebSocket support for serverless environments
- Managed via Drizzle migrations stored in `./migrations`

### UI & Styling
- **Radix UI**: Headless component primitives for accessible UI (dialogs, dropdowns, avatars, etc.)
- **Tailwind CSS**: Utility-first CSS framework with custom theme configuration
- **Lucide React**: Icon library for consistent iconography
- **Framer Motion**: Animation library for interactive map and transitions
- **Vaul**: Drawer component library for bottom sheets

### Form & Validation
- **React Hook Form**: Form state management with `@hookform/resolvers`
- **Zod**: Schema validation for forms and API requests
- **drizzle-zod**: Generate Zod schemas from Drizzle database schemas

### Authentication
- **Passport.js**: Authentication middleware with local strategy
- **express-session**: Session management middleware
- **connect-pg-simple**: PostgreSQL session store (configured but may use default)

### Development Tools
- **Replit Plugins**: Development banner, runtime error overlay, cartographer for Replit environment
- **tsx**: TypeScript execution for development server
- **esbuild**: Fast bundler for production server build