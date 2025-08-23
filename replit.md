# Overview

This is a collaborative checklist web application built for managing tasks across multiple users in real-time. The application features a grilling/BBQ-themed checklist with items organized by categories (grilling, food preparation, etc.). Users can claim tasks, mark them as complete, and see who completed what items. The app includes real-time updates through polling and provides a responsive interface for both desktop and mobile devices.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **UI Components**: Shadcn/ui component library with Radix UI primitives and Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management with real-time polling every 2 seconds
- **Form Handling**: React Hook Form with Zod for validation

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **API Structure**: RESTful endpoints for CRUD operations on checklist items
- **Storage Layer**: Abstracted storage interface with in-memory implementation (designed to be easily swapped for database)
- **Validation**: Zod schemas shared between client and server for type safety

## Data Storage Solutions
- **Current**: In-memory storage with seeded BBQ checklist data
- **Database Ready**: Drizzle ORM configuration for PostgreSQL with migration support
- **Schema**: Structured checklist items with fields for completion status, user tracking, timestamps, and categorization

## Authentication and Authorization
- **User Management**: Simple localStorage-based user identification (no formal auth system)
- **Session Handling**: Client-side user name storage for task claiming and completion tracking

## External Dependencies
- **Database**: Neon Database serverless PostgreSQL (configured but not actively used)
- **UI Framework**: Radix UI components for accessibility and behavior
- **Styling**: Tailwind CSS with custom design system variables
- **Development**: Replit-specific tooling for development environment integration
- **Build Tools**: Vite for frontend bundling, esbuild for server bundling
- **Type Safety**: TypeScript across the entire stack with shared type definitions

## Key Design Decisions

### Real-time Updates
The application uses polling instead of WebSockets for simplicity, refetching data every 2 seconds to keep all users synchronized. This approach was chosen for its simplicity and reliability in the Replit environment.

### Storage Abstraction
The storage layer uses an interface pattern that allows switching from in-memory storage to a database without changing the API layer. The Drizzle configuration is ready for PostgreSQL integration when persistence is needed.

### Shared Type Safety
Types and validation schemas are defined in a shared directory, ensuring consistency between client and server and reducing the chance of runtime errors.

### Component Architecture
The UI follows a modular component structure with reusable components for checklist items and sections, making it easy to extend or modify the interface.