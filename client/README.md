# ClassTrack Client

Modern, responsive web application for ClassTrack - a comprehensive attendance and productivity management system. Built with React 19, TanStack Router, and Tailwind CSS for a seamless user experience across student, teacher, and admin roles.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Routing](#routing)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Components](#components)
- [Pages](#pages)
- [Development](#development)
- [Build & Deployment](#build--deployment)

## Overview

ClassTrack Client is a type-safe, performance-optimized React application that provides different interfaces for students, teachers, and administrators. The application emphasizes user experience with smooth animations, real-time feedback, and intelligent data caching through React Query.

## Tech Stack

### Core Framework
- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety across the application
- **Vite 7** - Lightning-fast build tool and dev server

### Routing & Data Fetching
- **TanStack Router** - Type-safe routing with preloading
- **TanStack Query (React Query)** - Server state management with caching
- **TanStack Router Devtools** - Route debugging
- **TanStack Query Devtools** - Query inspection

### Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **tailwind-animate** - Animation utilities
- **Custom CSS** - Additional styles in `styles.css`

### State Management
- **Zustand** - Lightweight state management for auth
- **Persist Middleware** - Automatic localStorage persistence

### UI/UX
- **react-hot-toast** - Beautiful toast notifications
- **Custom Components** - Reusable UI components

### Testing
- **Vitest** - Unit and integration testing
- **Testing Library** - React component testing
- **jsdom** - DOM environment for tests

### Developer Tools
- **web-vitals** - Performance monitoring
- **ESLint** (implicit) - Code quality
- **TypeScript** - Static type checking

## Features

### Universal Features

- **Role-Based Authentication** - Separate interfaces for Student, Teacher, Admin
- **Protected Routes** - Automatic redirect for unauthenticated users
- **Persistent Sessions** - Auto-login with saved credentials
- **Responsive Design** - Mobile-first, works on all screen sizes
- **Real-time Notifications** - Toast messages for all user actions
- **Smart Caching** - Reduced API calls with React Query
- **Optimistic Updates** - Instant UI feedback before server confirmation

### Student Features

- **Dashboard** - Personal overview with attendance statistics
- **Attendance Tracking** - Mark attendance with QR codes and geolocation
- **Schedule View** - Weekly class timetable
- **Productivity Hub** - Task management with AI-powered suggestions
- **Profile Management** - Set interests and goals for personalized recommendations

### Teacher Features

- **Teacher Dashboard** - Class overview and student statistics
- **Class Management** - Create and manage classes
- **Attendance Reports** - View and export attendance data
- **Student Directory** - Access student information
- **Schedule Management** - Organize class timings

### Admin Features

- **Admin Dashboard** - System-wide analytics and monitoring
- **User Management** - CRUD operations for all users
- **Class Administration** - Full control over classes
- **Attendance Reports** - Comprehensive attendance analytics
- **System Configuration** - Platform-wide settings

## Project Structure

```
client/
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── robots.txt              # Search engine directives
│   └── favicon.ico             # Application icon
├── src/
│   ├── main.tsx                # Application entry point
│   ├── App.tsx                 # Landing page component
│   ├── router.tsx              # Route definitions
│   ├── styles.css              # Global styles & Tailwind
│   ├── reportWebVitals.ts      # Performance monitoring
│   ├── components/             # Reusable UI components
│   │   ├── Layout.tsx          # Root layout with navbar
│   │   ├── Navbar.tsx          # Navigation bar with role-based menus
│   │   ├── ProtectedRoute.tsx  # Authentication guard
│   │   └── UIComponents.tsx    # Shared UI elements
│   ├── pages/                  # Route pages
│   │   ├── Login.tsx           # Role-based login page
│   │   ├── Register.tsx        # User registration
│   │   ├── Dashboard.tsx       # Student dashboard
│   │   ├── TeacherDashboard.tsx # Teacher dashboard
│   │   ├── AdminDashboard.tsx  # Admin dashboard
│   │   ├── Attendance.tsx      # Attendance management
│   │   ├── Schedule.tsx        # Class schedule
│   │   ├── Productivity.tsx    # Task & productivity tracking
│   │   ├── Profile.tsx         # User profile editor
│   │   ├── Classes.tsx         # Class management
│   │   └── Users.tsx           # User management (admin)
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Authentication operations
│   │   ├── useAttendance.ts    # Attendance CRUD
│   │   ├── useClasses.ts       # Class operations
│   │   ├── useSchedule.ts      # Schedule management
│   │   ├── useTasks.ts         # Task operations
│   │   └── useUsers.ts         # User management
│   ├── services/               # API layer
│   │   ├── client.ts           # Base fetch wrapper
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── auth.ts             # Auth API
│   │   ├── attendance.ts       # Attendance API
│   │   ├── classes.ts          # Classes API
│   │   ├── schedule.ts         # Schedule API
│   │   ├── productivity.ts     # Productivity API
│   │   ├── users.ts            # Users API
│   │   ├── device.ts           # Device binding API
│   │   ├── audit.ts            # Audit logs API
│   │   └── index.ts            # Service exports
│   └── store/                  # Global state
│       └── authStore.ts        # Zustand auth store
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Running ClassTrack server (see `../server/README.md`)

### Installation

1. **Navigate to client directory**
   ```bash
   cd classTrack/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (optional)
   
   Create `.env` file if you need custom API URL:
   ```bash
   VITE_API_URL=http://localhost:4000/api
   ```
   
   Default is `http://localhost:4000/api` if not specified.

4. **Start development server**
   ```bash
   npm run dev
   ```

The application will start at `http://localhost:3000`

### Quick Test

1. Ensure the server is running at `http://localhost:4000`
2. Navigate to `http://localhost:3000`
3. Click "Register" to create an account
4. Login with your credentials
5. Access role-specific dashboard

## Architecture

### Component Architecture

The application follows a feature-based architecture:

- **Pages** - Top-level route components, handle layout and data orchestration
- **Components** - Reusable UI elements with specific responsibilities
- **Hooks** - Custom hooks for data fetching and mutations
- **Services** - API communication layer, decoupled from UI
- **Store** - Global state for authentication persistence

### Data Flow

```
User Action → Component → Custom Hook → Service → API
                ↓            ↓
            Optimistic    React Query Cache
             Update           ↓
                ↓         Automatic
            UI Update     Invalidation
```

### Type Safety

Every API call is fully typed:

```typescript
// Service defines return type
export const getClasses = (): Promise<{ classes: Class[] }> => 
  get("/classes");

// Hook inherits type
export function useClasses() {
  return useQuery<{ classes: Class[] }>({
    queryKey: ["classes"],
    queryFn: classesAPI.getAll,
  });
}

// Component receives typed data
const { data } = useClasses();
// data is { classes: Class[] } | undefined
```

## Routing

### Route Structure

TanStack Router provides type-safe routing with automatic code splitting:

```typescript
/ (public)                    → App.tsx (Landing page)
/login                        → Login.tsx
/register                     → Register.tsx

/protected (auth required)    → ProtectedRoute.tsx
  /dashboard                  → Dashboard.tsx (Student)
  /teacher                    → TeacherDashboard.tsx (Teacher)
  /admin                      → AdminDashboard.tsx (Admin)
  /attendance                 → Attendance.tsx
  /schedule                   → Schedule.tsx
  /productivity               → Productivity.tsx
  /profile                    → Profile.tsx
  /classes                    → Classes.tsx
  /users                      → Users.tsx (Admin only)
```

### Protected Routes

Routes under `/protected` require authentication:

```typescript
// Automatic redirect to /login if not authenticated
const ProtectedRoute = () => {
  const user = useAuthStore((s) => s.user);
  
  if (!user) {
    navigate({ to: "/login" });
    return null;
  }
  
  return <Outlet />;
};
```

### Navigation Features

- **Preloading** - Routes preload on hover (`defaultPreload: "intent"`)
- **Scroll Restoration** - Automatic scroll position memory
- **Type-Safe Links** - TypeScript validates route paths

```tsx
// Type-safe navigation
<Link to="/dashboard">Dashboard</Link>
// Compile error: Type '"invalid"' is not assignable to type '"/dashboard" | ...'
```

## State Management

### Authentication Store (Zustand)

Persistent authentication state across page refreshes:

```typescript
interface AuthState {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
}

// Usage
const user = useAuthStore((s) => s.user);
const setUser = useAuthStore((s) => s.setUser);
```

Stored in `localStorage` as `auth-storage`.

### Server State (React Query)

Automatic caching, refetching, and invalidation:

```typescript
// Configuration in main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,  // Don't refetch on tab switch
      retry: 1,                      // Retry failed requests once
      staleTime: 5 * 60 * 1000,     // Cache valid for 5 minutes
    },
  },
});
```

**Key Features:**
- Automatic background refetching
- Query invalidation on mutations
- Optimistic updates
- Built-in loading and error states

## API Integration

### Base Client

All API calls use the centralized `fetchAPI` function:

```typescript
// Located in src/services/client.ts
export async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T>

// Features:
// - Automatic credentials (cookies)
// - 30-second timeout
// - JSON parsing
// - Error handling
// - TypeScript generics
```

### Helper Functions

```typescript
// GET request
const data = await get<{ users: User[] }>("/users");

// POST request
const result = await post("/auth/login", { email, password });

// PATCH request
await patch(`/users/${id}`, { name: "New Name" });

// DELETE request
await del(`/classes/${classId}`);
```

### Service Layer

Each domain has a dedicated service file:

```typescript
// src/services/attendance.ts
export const attendanceAPI = {
  today: () => get<{ attendances: Attendance[] }>("/attendance/today"),
  mark: (data: MarkAttendanceRequest) => post("/attendance/mark", data),
  history: (userId?: string) => get(`/attendance/user/${userId}`),
  getByClass: (classId: string) => get(`/attendance/class/${classId}`),
};
```

### Error Handling

Errors are automatically caught and displayed:

```typescript
// In hooks/useAttendance.ts
export function useMarkAttendance() {
  return useMutation({
    mutationFn: attendanceAPI.mark,
    onSuccess: () => {
      toast.success("Attendance marked successfully! ✅");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to mark attendance");
    },
  });
}
```

## Components

### Layout Components

**Layout.tsx**
- Root layout wrapper
- Includes Navbar
- Renders child routes via `<Outlet />`

**Navbar.tsx**
- Role-based navigation menus
- User information display
- Logout functionality
- Responsive mobile menu

**ProtectedRoute.tsx**
- Authentication guard
- Redirects to login if not authenticated
- Renders child routes for authenticated users

### Shared Components

**UIComponents.tsx**
- Button variants
- Input fields
- Cards
- Modals
- Loading spinners
- Other reusable UI elements

## Pages

### Public Pages

**App.tsx** - Landing Page
- Hero section with gradient branding
- Feature cards (Attendance, Schedule, Productivity, Profile)
- Call-to-action buttons
- Statistics display
- Responsive design

**Login.tsx** - Authentication
- Role selection (Student, Teacher, Admin)
- Email/password form
- Role-based navigation after login
- Visual feedback for invalid credentials
- Link to registration

**Register.tsx** - User Registration
- Multi-step or single-form registration
- Role selection
- Email validation
- Password requirements
- Redirect to login on success

### Student Pages

**Dashboard.tsx**
- Today's attendance summary
- Upcoming classes from schedule
- Recent tasks
- Quick action buttons
- Statistics cards

**Attendance.tsx**
- Mark attendance with QR code/manual entry
- View attendance history
- Attendance percentage calculation
- Filter by date/class

**Schedule.tsx**
- Weekly timetable view
- Today's schedule highlighted
- Class details on click
- Add/remove from personal schedule

**Productivity.tsx**
- Task list with categories (academic, career, skill)
- Create/edit/delete tasks
- Mark tasks complete
- AI-powered suggestions based on interests/goals
- Priority sorting

**Profile.tsx**
- Edit personal information
- Set interests and goals
- View account statistics
- Change password
- Device binding status

### Teacher Pages

**TeacherDashboard.tsx**
- Classes overview
- Student count
- Attendance statistics
- Quick access to class management

**Classes.tsx**
- Create new classes
- Edit existing classes
- View enrolled students
- Generate QR codes for attendance
- Delete classes

**Users.tsx** (Teachers see students)
- Student directory
- Filter/search students
- View student details
- Attendance records per student

### Admin Pages

**AdminDashboard.tsx**
- System-wide statistics
- Total users by role
- Total classes
- Attendance overview
- Recent activity

**Users.tsx** (Full Access)
- CRUD operations for all users
- Filter by role
- Search functionality
- Activate/deactivate accounts
- View audit logs

## Development

### Available Scripts

```bash
# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run serve

# Run tests
npm run test
```

### Development Workflow

1. **Start the server** - Ensure backend is running at `localhost:4000`
2. **Run dev server** - `npm run dev`
3. **Make changes** - Hot module replacement (HMR) for instant updates
4. **Test features** - Use React Query Devtools and Router Devtools
5. **Check types** - TypeScript will show errors in editor

### File Naming Conventions

- **Components** - PascalCase (e.g., `UserCard.tsx`)
- **Hooks** - camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Services** - camelCase (e.g., `attendance.ts`)
- **Types** - PascalCase interfaces (e.g., `User`, `Attendance`)
- **Pages** - PascalCase (e.g., `Dashboard.tsx`)

### Code Organization Best Practices

**Separation of Concerns**
- Components: UI rendering only
- Hooks: Data fetching and state logic
- Services: API communication
- Store: Global state management

**Type Safety**
- Define interfaces in `services/types.ts`
- Export from service files
- Import in hooks and components

**Custom Hooks Pattern**

```typescript
// ✅ Good - Encapsulates logic
export function useAttendance() {
  return useQuery({
    queryKey: ["attendance"],
    queryFn: attendanceAPI.today,
  });
}

// ❌ Bad - API call in component
const Component = () => {
  const [data, setData] = useState();
  useEffect(() => {
    fetch("/api/attendance").then(setData);
  }, []);
};
```

### Adding New Features

1. **Define Types** - Add interfaces to `services/types.ts`
2. **Create Service** - Add API functions to `services/[feature].ts`
3. **Create Hook** - Add custom hook in `hooks/use[Feature].ts`
4. **Create Component** - Build UI in `components/` or `pages/`
5. **Add Route** (if needed) - Update `router.tsx`

### Styling Guidelines

**Tailwind Classes**
- Use utility classes for most styling
- Keep consistent spacing scale (4, 8, 12, 16, 24, 32, 48, 64)
- Use Tailwind colors (blue, gray, red, green, etc.)

**Responsive Design**
- Mobile-first approach
- Use breakpoints: `md:`, `lg:`, `xl:`
- Test on multiple screen sizes

**Animations**
- Use `tailwind-animate` for common animations
- Keep animations subtle and purposeful
- Transition duration: 200-300ms for most interactions

### Performance Optimization

**Code Splitting**
- TanStack Router automatically splits routes
- Use dynamic imports for heavy components

**React Query Caching**
- Data cached for 5 minutes by default
- Invalidate on mutations
- Share queries with same queryKey

**Optimistic Updates**
```typescript
useMutation({
  onMutate: async (newData) => {
    // Cancel ongoing queries
    await queryClient.cancelQueries({ queryKey: ["tasks"] });
    
    // Snapshot current value
    const previous = queryClient.getQueryData(["tasks"]);
    
    // Optimistically update
    queryClient.setQueryData(["tasks"], (old) => [...old, newData]);
    
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(["tasks"], context.previous);
  },
});
```

## Build & Deployment

### Production Build

```bash
# Build optimized bundle
npm run build

# Output directory: dist/
# - Minified JavaScript
# - Optimized CSS
# - Asset hashing for cache busting
```

### Build Output

```
dist/
├── index.html              # Entry HTML
├── assets/
│   ├── index-[hash].js     # Main bundle
│   ├── index-[hash].css    # Styles
│   └── [routes]-[hash].js  # Route chunks
└── public files            # Copied from public/
```

### Environment Variables

Create `.env.production` for production settings:

```bash
VITE_API_URL=https://api.yourserver.com/api
```

Variables must start with `VITE_` to be exposed to the client.

### Deployment Options

**Static Hosting (Recommended)**

Works with Vercel, Netlify, GitHub Pages, etc.

**Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Netlify**
```bash
# Build command
npm run build

# Publish directory
dist
```

**Custom Server (Nginx)**

```nginx
server {
  listen 80;
  server_name your-domain.com;
  root /path/to/classtrack/client/dist;
  index index.html;

  # SPA fallback - all routes go to index.html
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache static assets
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### Pre-Deployment Checklist

- [ ] Update API URL in environment variables
- [ ] Test all user flows (Student, Teacher, Admin)
- [ ] Check responsive design on mobile devices
- [ ] Verify all API endpoints are accessible
- [ ] Test authentication and session persistence
- [ ] Run production build locally (`npm run build && npm run serve`)
- [ ] Check browser console for errors
- [ ] Test with real data (not just seed data)
- [ ] Verify all protected routes require authentication
- [ ] Check CORS configuration on server

### Performance Monitoring

The app includes web-vitals monitoring:

```typescript
// src/reportWebVitals.ts
reportWebVitals(console.log);

// Metrics tracked:
// - CLS (Cumulative Layout Shift)
// - FID (First Input Delay)
// - FCP (First Contentful Paint)
// - LCP (Largest Contentful Paint)
// - TTFB (Time to First Byte)
```

## Troubleshooting

### Common Issues

**API Connection Failed**
- Verify server is running at `http://localhost:4000`
- Check CORS configuration on server
- Ensure `VITE_API_URL` is correct

**Authentication Issues**
- Clear browser cookies
- Clear localStorage (`auth-storage`)
- Verify JWT token is being sent in requests
- Check token expiration (7 days default)

**Route Not Found**
- Check route definition in `router.tsx`
- Verify route is properly nested
- Ensure component is exported correctly

**Build Errors**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check TypeScript errors with `npx tsc --noEmit`

**State Not Persisting**
- Check browser localStorage is enabled
- Verify Zustand persist middleware is configured
- Check for conflicting storage keys

### Browser Compatibility

Supports all modern browsers:
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

### DevTools

**React Query Devtools**
- Bottom-right corner in development
- View all queries and their states
- Inspect cached data
- Manually trigger refetches

**TanStack Router Devtools**
- Bottom-left corner in development
- View route tree
- Inspect current route
- Debug navigation

---

**Built for modern web standards with performance, accessibility, and user experience as top priorities.**
