# Family Trip Command Center

Instead of a normal trip planner, this repo treats a long weekend like an operation: convoy routes, arrival windows, mission launches, meal logistics, family checklists, and a giant map that makes everything feel more serious than it needs to be.

![Family Trip Command Center dashboard overview](docs/dashboard-overview.png)

## What It Does

- Tracks multiple families arriving from different cities.
- Simulates driving routes, convoy departures, and day-by-day timeline playback.
- Organizes the trip into itinerary, stay, meals, activities, expenses, and family views.
- Presents the whole thing as a dark, command-center-style dashboard because that is more fun than a spreadsheet.

## Screens

### Mission launch overlay

![Mission launch overlay](docs/mission-launch.png)

### Activity planning surface

![Activity planning screen](docs/activity-board.png)

### Meal logistics surface

![Meal planning screen](docs/meals-planner.png)

## Why This Exists

Because “three families are trying to get to the same cabin” is already a systems problem.

The repo is intentionally overbuilt for a small real-life use case. That is the point. It is a fun UI experiment, a trip-planning toy, and a mildly absurd attempt to make a family weekend feel like a live operations room.

## Tech Stack

- **Frontend**: React 19, TypeScript 6
- **Build Tool**: Vite 8
- **Database**: Supabase (PostgreSQL)
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS 4
- **Maps**: Google Maps JavaScript API
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest, Playwright

## Running It Locally

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your API keys to .env:
# - VITE_SUPABASE_URL (from Supabase dashboard)
# - VITE_SUPABASE_ANON_KEY (from Supabase dashboard)
# - VITE_GOOGLE_MAPS_API_KEY (from Google Cloud Console)

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

## Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production (with type checking + linting)
npm run preview      # Preview production build

# Code Quality
npm run lint         # Check code with ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check Prettier formatting
npm run type-check   # Run TypeScript type checking

# Testing
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run validate     # Run all checks (type + lint + test)

# Database
npm run generate:migration <name>  # Create new migration file

# Deployment
npm run deploy:preview  # Deploy preview to Vercel
npm run deploy:prod     # Deploy to production
```

## Data & Persistence

- **Database**: Supabase PostgreSQL cloud instance
- **Data Model**: Trips, families, stays, meals, activities, expenses
- **Real-time**: React Query for optimistic updates and cache management
- **Privacy**: Row Level Security (RLS) enabled on all tables

The trip data in this repo is intentionally sanitized for public sharing.

## Deployment

The app is deployed on Vercel with automatic deployments from the main branch.

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

**Live Demo**: [https://palantir-for-family-trips.vercel.app](https://palantir-for-family-trips.vercel.app)

## Design System

All design decisions (typography, colors, spacing, layout) are documented in [DESIGN.md](DESIGN.md).

The UI is optimized for:
- Large desktop displays (1920x1080+)
- High information density
- Dark mode operations-center aesthetic
- Tactical precision over consumer friendliness

## Code Quality

This project uses automated code quality tools:

- **ESLint** - Code linting for TypeScript/React
- **Prettier** - Automatic code formatting
- **Husky** - Pre-commit hooks
- **lint-staged** - Only check staged files

Pre-commit hooks automatically run on every commit to ensure code quality.

See [CODE_QUALITY.md](CODE_QUALITY.md) for detailed setup and troubleshooting.

## Database Migrations

This project uses Supabase for data persistence. Database schema changes are managed through SQL migration files.

### Creating a New Migration

Generate a new migration file with a timestamp and descriptive name:

```bash
npm run generate:migration <migration-name>
```

**Example:**

```bash
npm run generate:migration add_user_preferences
```

This creates a new file in `supabase/migrations/` with the format:

```
YYYYMMDDHHmmss_migration_name.sql
```

The generated file includes a template for your SQL. Edit it with your schema changes.

### Applying Migrations

**Local development:**

```bash
supabase db reset
```

**Push to remote:**

```bash
supabase db push
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Shadcn UI base components
│   ├── sections/       # Page section components
│   └── ...             # Feature-specific components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utilities (API clients, env, etc.)
├── repositories/       # Data layer (Supabase)
├── types/              # TypeScript type definitions
└── App.tsx             # Main application shell
```

## Key Files

- **[src/App.tsx](src/App.tsx)** - Main application, routing, and layout
- **[src/repositories/SupabaseTripRepository.ts](src/repositories/SupabaseTripRepository.ts)** - Database operations
- **[src/context/TripContext.tsx](src/context/TripContext.tsx)** - Trip state management
- **[DESIGN.md](DESIGN.md)** - Design system documentation
- **[CLAUDE.md](CLAUDE.md)** - Development guidelines

## Contributing

This is a personal project, but if you find it useful and want to improve it:

1. Fork the repository
2. Create a feature branch
3. Follow the design system in [DESIGN.md](DESIGN.md)
4. Ensure type safety (`npm run type-check`)
5. Add tests for new features
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Inspired by Palantir's operations-center aesthetic
- Built for real family trip coordination
- Intentionally overengineered for fun and learning

---

Built for fun. Surprisingly usable. Not pretending to be enterprise software.
