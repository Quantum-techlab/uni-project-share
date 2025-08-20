# Academic Project Repository System

## Overview

This is an academic project repository application built for the Department of Computer Engineering at the University of Ilorin. The system enables students to upload, browse, and manage final year projects and academic documents. It features university-specific email authentication, project categorization, and a comprehensive search system tailored for academic use.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with a custom academic theme featuring professional blue color scheme
- **State Management**: TanStack React Query for server state management
- **Routing**: React Router for client-side navigation
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)
- **API Design**: RESTful API structure with centralized route handling
- **Authentication**: Custom OTP-based authentication system for university emails
- **Email Validation**: Strict validation for University of Ilorin email format (YY-52HL001@students.unilorin.edu.ng)

### Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM with schema-first approach
- **Schema Design**: 
  - `profiles` table for user authentication and profile data
  - `projects` table for academic project storage with metadata
  - `otp_codes` table for authentication verification
- **Relationships**: Foreign key relationships with cascade deletion
- **Data Types**: UUID primary keys, timestamp tracking, array fields for keywords

### Authentication System
- **Method**: OTP (One-Time Password) verification via university email
- **Email Validation**: Regex-based validation for specific university email format
- **Session Management**: Server-side sessions with secure cookie configuration
- **Security Features**: CSRF protection, secure HTTP-only cookies, environment-based security settings

### File Management
- **Storage Strategy**: Designed for external file storage integration
- **Metadata Tracking**: File name, size, and URL storage in database
- **Upload Handling**: Form-based upload with validation and progress tracking

### Search and Filtering
- **Search Capabilities**: Full-text search across project titles, descriptions, and metadata
- **Filter Options**: Year-based filtering, supervisor-based filtering, keyword matching
- **Sorting**: Chronological sorting with most recent projects first

### UI/UX Design Patterns
- **Design System**: Professional academic theme with University branding
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Component Architecture**: Reusable components with consistent styling
- **User Experience**: Multi-step authentication flow, intuitive project browsing interface

### Development Tools
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Code Quality**: ESLint and TypeScript compiler checks
- **Build Process**: Vite for frontend, esbuild for backend bundling
- **Development Server**: Hot reload with Vite dev server integration

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18+ with TypeScript, React Router, React Hook Form
- **UI Components**: Radix UI primitives, Lucide React icons, Class Variance Authority
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer

### Backend Dependencies
- **Server Framework**: Express.js with TypeScript support
- **Database**: Neon PostgreSQL, Drizzle ORM, node-postgres types
- **Authentication**: express-session, connect-pg-simple for session storage
- **Validation**: Zod for schema validation

### Development Dependencies
- **Build Tools**: Vite, esbuild, tsx for development
- **Replit Integration**: Replit-specific plugins for development environment
- **Type Definitions**: @types packages for Node.js and PostgreSQL

### Database Service
- **Provider**: Neon Database (serverless PostgreSQL)
- **Connection**: WebSocket-based connection with connection pooling
- **Configuration**: Environment-based database URL configuration

### Session Storage
- **Provider**: PostgreSQL-backed session storage
- **Configuration**: Secure session configuration with environment-based secrets
- **Features**: Automatic session cleanup, secure cookie settings

### Email Integration
- **Strategy**: University email system integration (passive)
- **Validation**: Client and server-side email format validation
- **Authentication Flow**: OTP delivery through existing university email infrastructure