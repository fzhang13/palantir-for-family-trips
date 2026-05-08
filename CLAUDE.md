# Palantir-style Situation Dashboard

## Project Overview
This project is a high-fidelity React implementation of a situation dashboard, inspired by Palantir's design language.

## Design System
Always read `DESIGN.md` before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.

## Tech Stack
- React (Vite)
- Tailwind CSS
- Lucide React (Icons)
- Framer Motion (Subtle animations)
- Shadcn UI (Base components)

## Development Rules
- Maintain high information density.
- Use semantic colors strictly for status.
- Ensure all numerical data uses monospace fonts for alignment.
- Keep the UI responsive but optimized for large dashboard displays.
- Do not git add or git commit on my behalf, i will to them

## Database
- For all database migration, should use the following script to generate migration
```bash
npm run generate:migration <name_of_migration>
```
- uses supabase cloud or online version, does not use local supabase