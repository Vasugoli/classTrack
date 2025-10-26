# ClassTrack

A comprehensive attendance and productivity management system for educational institutions with secure geo-verified attendance tracking.

## What is ClassTrack?

ClassTrack prevents attendance fraud through device binding and geo-location verification while providing role-specific dashboards for students, teachers, and administrators. The platform combines attendance management, schedule organization, and productivity tracking in one secure system.

## Key Features

-  **Secure Attendance** - Device binding + geo-fencing ensures on-campus attendance only
-  **Role-Based Access** - Tailored interfaces for Students, Teachers, and Admins
-  **Schedule Management** - Automated timetable creation and tracking
-  **Productivity Tools** - AI-powered task suggestions based on user goals
-  **Audit Logging** - Complete activity trail for security compliance

## Technology

**Frontend:** React 19, TypeScript, TanStack Router, TanStack Query, Tailwind CSS  
**Backend:** Node.js, Express, Prisma, PostgreSQL  
**Security:** JWT Auth, Device Fingerprinting, Geo-Fencing

## Quick Start

### Prerequisites

- Node.js v18+
- PostgreSQL v14+
- npm or yarn

### Setup in 5 Minutes

**1. Clone and Install**
```bash
git clone https://github.com/Vasugoli/classTrack.git
cd classTrack

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

**2. Configure Server**

Create `server/.env`:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/classtrack_db"
JWT_SECRET="your-secret-key-here"
PORT=4000
CAMPUS_LAT=28.6139
CAMPUS_LON=77.2090
CAMPUS_RADIUS=500
CORS_ORIGIN=http://localhost:3000
```

**3. Setup Database**
```bash
cd server
npm run db:migrate
npm run db:seed
```

**4. Start Both Servers**
```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client  
cd client && npm run dev
```

**5. Open Application**
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

### Default Test Accounts

Update passwords in `server/prisma/seed.ts` before seeding:
- Teacher: `drsmith@example.com`
- Student: `alice@example.com`

Or register new account at `/register`

## Development Commands

### Server
```bash
npm run dev          # Start with hot reload
npm run db:migrate   # Run migrations
npm run db:seed      # Seed test data
npm run db:studio    # Open database GUI
npm run build        # Build for production
```

### Client
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests
```

## Project Documentation

Each component has detailed documentation:

- **[Server Documentation](./server/README.md)** - API endpoints, middleware, security architecture, deployment
- **[Client Documentation](./client/README.md)** - Component architecture, routing, state management, styling

## Common Issues

| Issue | Solution |
|-------|----------|
| Database connection failed | Check PostgreSQL is running and `DATABASE_URL` is correct |
| CORS error | Verify `CORS_ORIGIN` matches client URL |
| Geo-lock blocking attendance | Set `DISABLE_GEO_LOCK=true` in server `.env` for testing |
| Device binding failed | Clear browser cache and device bindings from database |

See detailed troubleshooting in [Server README](./server/README.md#troubleshooting) and [Client README](./client/README.md#troubleshooting)

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request

---

**Built with ❤️ for educational institutions**
