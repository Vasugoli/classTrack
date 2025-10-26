# ClassTrack Server

Backend API service for ClassTrack - an intelligent attendance and productivity management system designed for educational institutions. This server handles authentication, attendance tracking with geo-location verification, device binding, audit logging, and schedule management.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Security Features](#security-features)
- [Middleware](#middleware)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Deployment](#deployment)

## Overview

ClassTrack Server is built with security and reliability as core principles. The system ensures attendance integrity through multi-layered verification including device binding, geo-location validation, and comprehensive audit logging. Every critical action is tracked, making it suitable for institutions requiring strict attendance monitoring.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **Security**: bcrypt for password hashing, device fingerprinting
- **Validation**: Zod schemas
- **Development**: tsx for TypeScript execution, nodemon for hot reload

## Features

### Core Functionality

- **Role-Based Authentication**: Separate login flows for Students, Teachers, and Admins
- **Attendance Management**: Mark, view, and manage attendance records with status tracking
- **Schedule Management**: Create and manage class schedules with day/time configurations
- **Productivity Tracking**: Task management with categories, priorities, and due dates
- **User Management**: CRUD operations for user accounts across all roles

### Security Features

- **Device Binding**: Restricts attendance marking to registered devices only
- **Geo-Location Verification**: Ensures attendance is marked only from campus premises
- **Audit Logging**: Comprehensive activity logs with IP tracking and device information
- **JWT Authentication**: Secure token-based auth with cookie storage
- **Password Encryption**: bcrypt hashing with salt rounds

### Advanced Features

- **Session Tokens**: One-time use QR code tokens with expiration
- **Activity Auditing**: Tracks login attempts, attendance operations, and security violations
- **Geo-Fencing**: Haversine formula-based distance calculation for campus boundary validation
- **Device Fingerprinting**: SHA-256 hashing of device characteristics

## Project Structure

```
server/
├── src/
│   ├── server.ts                    # Application entry point
│   ├── controllers/                 # Business logic handlers
│   │   ├── auth_controller.ts       # Registration, login, logout
│   │   ├── attendance_controller.ts # Attendance CRUD operations
│   │   ├── classes_controller.ts    # Class management
│   │   ├── schedule_controller.ts   # Schedule operations
│   │   ├── productivity_controller.ts # Task management
│   │   ├── users_controller.ts      # User CRUD operations
│   │   ├── deviceController.ts      # Device binding operations
│   │   └── auditController.ts       # Audit log retrieval
│   ├── routes/                      # API route definitions
│   │   ├── auth.ts                  # /api/auth routes
│   │   ├── attendance.ts            # /api/attendance routes
│   │   ├── classes.ts               # /api/classes routes
│   │   ├── schedule.ts              # /api/schedule routes
│   │   ├── productivity.ts          # /api/productivity routes
│   │   ├── users.ts                 # /api/users routes
│   │   ├── device.ts                # /api/device routes
│   │   └── audit.ts                 # /api/audit routes
│   ├── middleware/
│   │   ├── auth.ts                  # JWT verification & role-based access
│   │   ├── auditLogger.ts           # Activity logging middleware
│   │   ├── checkDeviceBinding.ts    # Device verification middleware
│   │   └── checkGeoLock.ts          # Location verification middleware
│   ├── utils/
│   │   ├── deviceUtils.ts           # Device fingerprinting utilities
│   │   └── geoUtils.ts              # Geolocation calculation utilities
│   ├── lib/
│   │   └── prisma.ts                # Prisma client instance
│   └── types/
│       └── express.d.ts             # Extended Express type definitions
├── prisma/
│   ├── schema.prisma                # Database schema definition
│   ├── seed.ts                      # Database seeding script
│   └── migrations/                  # Database migration files
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
└── .env.example                     # Environment variables template
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository and navigate to server directory**
   ```bash
   cd classTrack/server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Strong secret key for token signing
   - `CAMPUS_LAT`, `CAMPUS_LON`, `CAMPUS_RADIUS`: Your campus location and perimeter

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed initial data (optional)
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The server will start at `http://localhost:4000`

## Database Schema

### User Model
Stores user accounts with role-based access control. Students have additional fields for academic information.

- **Roles**: STUDENT, TEACHER, ADMIN
- **Student Fields**: enrollmentNo, year, branch, interests, goals
- **Relations**: attendances, schedules, tasks, deviceBinding, auditLogs

### Attendance Model
Records attendance with status tracking and geo-location data.

- **Status**: PRESENT, ABSENT, LATE
- **Unique Constraint**: One record per user, class, and date
- **Relations**: Linked to User and Class

### Class Model
Represents academic classes with unique codes and teacher assignments.

- **Fields**: name, code, teacherId, room, qrCode
- **Relations**: attendances, schedules

### Schedule Model
Manages class timetables with weekly recurring patterns.

- **Fields**: dayOfWeek (0-6), startTime, endTime
- **Unique Constraint**: Per user, class, day, and time slot

### Task Model
Productivity tracking with categorization and priority management.

- **Categories**: academic, career, skill
- **Fields**: title, description, priority (1-5), dueDate, completed

### DeviceBinding Model
One device per user restriction for attendance operations.

- **Fields**: deviceHash (bcrypt hashed fingerprint)
- **Constraint**: One binding per user

### AuditLog Model
Comprehensive activity logging for security monitoring.

- **Tracked Data**: action, ipAddress, deviceId, location, timestamp, details (JSON)

### SessionToken Model
Time-limited QR code tokens for attendance marking.

- **Fields**: token, expiresAt, used
- **Usage**: One-time use tokens

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Create new user account | No |
| POST | `/login` | Authenticate user and receive JWT | No |
| POST | `/logout` | Clear authentication cookie | No |

### Classes (`/api/classes`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List all classes | Yes |
| POST | `/` | Create new class | Yes (Teacher/Admin) |
| GET | `/:id` | Get class details | Yes |
| PUT | `/:id` | Update class information | Yes (Teacher/Admin) |
| DELETE | `/:id` | Delete class | Yes (Admin) |

### Attendance (`/api/attendance`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get attendance records | Yes |
| POST | `/mark` | Mark attendance (device + geo verified) | Yes |
| GET | `/user/:userId` | Get user's attendance history | Yes |
| GET | `/class/:classId` | Get class attendance report | Yes (Teacher/Admin) |

### Schedule (`/api/schedule`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get schedule records | Yes |
| POST | `/` | Create schedule entry | Yes (Teacher/Admin) |
| GET | `/user/:userId` | Get user's weekly schedule | Yes |
| DELETE | `/:id` | Remove schedule entry | Yes (Teacher/Admin) |

### Productivity (`/api/productivity`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tasks` | List user's tasks | Yes |
| POST | `/tasks` | Create new task | Yes |
| PUT | `/tasks/:id` | Update task | Yes |
| DELETE | `/tasks/:id` | Delete task | Yes |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List all users | Yes (Admin) |
| GET | `/:id` | Get user details | Yes |
| PUT | `/:id` | Update user information | Yes |
| DELETE | `/:id` | Delete user | Yes (Admin) |

### Device (`/api/device`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/bind` | Bind device to user account | Yes |
| GET | `/status` | Check device binding status | Yes |
| DELETE | `/unbind` | Remove device binding | Yes (Admin) |

### Audit (`/api/audit`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/logs` | Retrieve audit logs | Yes (Admin) |
| GET | `/logs/user/:userId` | Get user-specific audit trail | Yes (Admin) |

## Security Features

### Device Binding

The system restricts attendance marking to one registered device per user:

1. User binds their device during first-time setup
2. Device fingerprint is generated from User-Agent and platform
3. Fingerprint is hashed using bcrypt and stored
4. Every attendance attempt verifies against the stored hash
5. Mismatches are logged and rejected

**Implementation**: `checkDeviceBinding` middleware in `middleware/checkDeviceBinding.ts`

### Geo-Location Verification

Ensures students are physically present on campus:

1. Client sends latitude/longitude with attendance request
2. Server calculates distance using Haversine formula
3. Distance is compared against `CAMPUS_RADIUS` environment variable
4. Attendance is rejected if outside campus boundaries
5. All attempts (valid and invalid) are audit logged

**Implementation**: `checkGeoLock` middleware in `middleware/checkGeoLock.ts`

### Audit Logging

Every security-relevant action is logged:

- Login/logout events
- Attendance attempts (successful and failed)
- Device binding operations
- Geo-location violations
- Token validation failures
- Unauthorized access attempts

Logs include: timestamp, user ID, IP address, device info, location coordinates, and action-specific details.

**Implementation**: `auditLogger` middleware in `middleware/auditLogger.ts`

### JWT Authentication

- Tokens signed with `JWT_SECRET`
- 7-day expiration
- Stored in HTTP-only cookies (XSS protection)
- SameSite=lax (CSRF protection)
- Secure flag in production

**Implementation**: `requireAuth` and `requireRole` in `middleware/auth.ts`

## Middleware

### Authentication Middleware (`requireAuth`)

Validates JWT from Authorization header or cookie. Extracts user information and attaches to `req.user`.

```typescript
// Usage
router.get('/protected', requireAuth, handler);
```

### Role-Based Access (`requireRole`)

Restricts endpoints to specific user roles.

```typescript
// Usage
router.post('/admin-only', requireAuth, requireRole('ADMIN'), handler);
router.post('/teachers', requireAuth, requireRole('TEACHER', 'ADMIN'), handler);
```

### Audit Logger (`auditLogger`)

Logs actions with full context.

```typescript
// Usage
router.post('/mark', requireAuth, auditLogger('ATTENDANCE_ATTEMPT'), handler);
```

### Device Verification (`checkDeviceBinding`)

Validates request is from registered device.

```typescript
// Usage
router.post('/mark', requireAuth, checkDeviceBinding(), handler);
```

### Geo-Lock Verification (`checkGeoLock`)

Validates user is within campus boundaries.

```typescript
// Usage
router.post('/mark', requireAuth, checkGeoLock(), handler);
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/classtrack_db"

# Security
JWT_SECRET="your-256-bit-secret-key"

# Server
PORT=4000
NODE_ENV=development

# Geo-Location (adjust for your campus)
CAMPUS_LAT=28.6139          # Latitude of campus center
CAMPUS_LON=77.2090          # Longitude of campus center
CAMPUS_RADIUS=500           # Allowed radius in meters

# CORS
CORS_ORIGIN=http://localhost:3000

# Optional
DISABLE_GEO_LOCK=false      # Set true to bypass geo-lock in development
```

## Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Start production server
npm start

# Database operations
npm run db:migrate          # Run Prisma migrations
npm run db:seed             # Seed database with test data
npm run db:push             # Push schema changes (dev only)
npm run db:studio           # Open Prisma Studio GUI
npm run db:generate         # Generate Prisma Client
```

### Database Workflow

1. **Modify schema**: Edit `prisma/schema.prisma`
2. **Create migration**: `npm run db:migrate`
3. **Generate client**: `npm run db:generate` (usually automatic)
4. **Apply to database**: Migration runs automatically

### Adding New Endpoints

1. Create controller in `src/controllers/`
2. Define routes in `src/routes/`
3. Apply middleware (auth, audit, device, geo)
4. Register router in `src/server.ts`
5. Add type definitions if needed

### Code Organization

- **Controllers**: Pure business logic, no request/response handling
- **Routes**: Endpoint definitions with middleware chains
- **Middleware**: Cross-cutting concerns (auth, logging, validation)
- **Utils**: Reusable helper functions
- **Types**: TypeScript type definitions and interfaces

## Deployment

### Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Use production PostgreSQL database
- [ ] Set `NODE_ENV=production`
- [ ] Configure correct `CAMPUS_LAT`, `CAMPUS_LON`, `CAMPUS_RADIUS`
- [ ] Enable HTTPS (Secure cookie flag)
- [ ] Set proper `CORS_ORIGIN`
- [ ] Run migrations: `npm run db:migrate`
- [ ] Build application: `npm run build`
- [ ] Use process manager (PM2, systemd)
- [ ] Set up database backups
- [ ] Configure log rotation for audit logs
- [ ] Monitor disk usage (audit logs can grow)

### Deployment Example (PM2)

```bash
# Install PM2 globally
npm install -g pm2

# Build the application
npm run build

# Start with PM2
pm2 start dist/server.js --name classtrack-api

# Enable startup script
pm2 startup
pm2 save
```

### Environment Setup

Ensure all required environment variables are set in production:

```bash
# Production .env
DATABASE_URL="postgresql://prod_user:prod_pass@db_host:5432/classtrack_prod"
JWT_SECRET="use-a-strong-random-256-bit-key-here"
NODE_ENV=production
PORT=4000
CAMPUS_LAT=your_campus_latitude
CAMPUS_LON=your_campus_longitude
CAMPUS_RADIUS=500
CORS_ORIGIN=https://yourdomain.com
```

### Database Backup Strategy

Regular backups are crucial for audit log retention:

```bash
# Daily backup example
pg_dump -U username -d classtrack_prod > backup_$(date +%Y%m%d).sql

# Restore from backup
psql -U username -d classtrack_prod < backup_20250101.sql
```

## Monitoring & Maintenance

### Audit Log Cleanup

Audit logs should be periodically archived or cleaned based on `AUDIT_LOG_RETENTION_DAYS`:

```sql
-- Clean logs older than 90 days
DELETE FROM "AuditLog" 
WHERE timestamp < NOW() - INTERVAL '90 days';
```

### Health Check

The API provides a health endpoint:

```bash
GET /api/health
Response: { "ok": true, "env": "production" }
```

Use this for uptime monitoring and load balancer health checks.

### Performance Optimization

- Database indexing on frequently queried fields (userId, classId, date)
- Connection pooling configured in Prisma
- Consider Redis caching for frequently accessed data
- Implement rate limiting for security

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running
- Ensure database exists: `createdb classtrack_db`

**JWT Verification Failed**
- Check `JWT_SECRET` matches between server instances
- Verify token hasn't expired (7 day default)
- Clear cookies and re-login

**Geo-Lock Rejecting Valid Locations**
- Verify `CAMPUS_LAT`, `CAMPUS_LON` are correct
- Adjust `CAMPUS_RADIUS` as needed
- Set `DISABLE_GEO_LOCK=true` for testing

**Device Binding Issues**
- User-Agent must be consistent
- Clear device binding from admin panel
- Check device fingerprint generation logic

### Logging

Enable verbose logging by checking console output:
- `[Auth]` - Authentication events
- `[DEVICE]` - Device binding operations
- `[GEO]` - Geo-location verification
- `[AUDIT]` - Audit logging events

---

**Built with precision for educational institutions requiring strict attendance monitoring and comprehensive audit trails.**
