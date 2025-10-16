# Pharmacy Platform - Admin Dashboard

Super Admin Dashboard for managing the multi-tenant pharmacy platform.

## Features

- 🔐 **Authentication**: Secure JWT-based authentication for super admins
- 🏢 **Tenant Management**: Create, view, and manage pharmacy tenants
- 👥 **User Management**: Cross-tenant user administration
- 📊 **System Monitoring**: Real-time health checks and performance metrics
- 🎨 **Modern UI**: Built with Shadcn/ui and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **State Management**: TanStack Query (React Query)
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on http://localhost:3000

### Installation

\`\`\`bash
# Install dependencies
npm install

# Create environment variables
NEXT_PUBLIC_API_URL=http://localhost:3000

# Start development server
npm run dev
\`\`\`

## Available Pages

- **Dashboard** (/): Overview and statistics
- **Tenants** (/tenants): Manage pharmacy tenants
- **Users** (/users): Cross-tenant user management
- **Monitoring** (/monitoring): System health and metrics

## Author

Ahmed Mersall <mersall@hamad.center>
