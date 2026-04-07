# Taskflow Frontend

## Overview

Taskflow is a React + TypeScript frontend for a task management system. The app is styled with Tailwind CSS, uses React Context for state management, and integrates with the live backend API documented in Swagger.

Current frontend highlights:
- authentication with register, login, current-user lookup, and logout
- role-aware task management for `user` and `admin`
- separate `Dashboard` and `Task Management` workspaces
- task table with pagination and sortable columns
- filters for search, status, priority, and assignee
- create task modal with assignment support for admins
- blue-led visual theme with persistent dark mode toggle
- TypeScript-based form validation and shared UI components

Backend Swagger:
- `https://taskflow-backend-dycf.onrender.com/api/docs`

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React
- React Context API
- Vitest

## Getting Started

### Prerequisites

- Node.js `20.19+` or `22.12+`
- npm

### Install

```bash
npm install
```

### Environment

Create `.env.local`:

```env
VITE_API_BASE_URL=https://taskflow-backend-dycf.onrender.com
```

The app also accepts `VITE_API_URL` as a fallback.

### Run locally

```bash
npm run dev
```

### Type check

```bash
npx tsc -b
```

### Production build

```bash
npm run build
```

## Main App Flows

### Authentication

- register with `firstName`, `lastName`, `email`, and `password`
- redirect to sign-in after successful signup
- login with backend token handling
- fetch current user from `/user`
- logout through `/user/logout`

### Dashboard

- filtered task overview with summary cards
- searchable and filterable task table
- table header sorting
- assignee filter with checkbox dropdown

### Task Management

- create new tasks
- update task status
- reassign tasks when logged in as admin
- delete tasks when permitted
- paginated task table with 10 rows per page

## Project Structure

```text
src/
├── api/
├── components/
│   ├── Alert.tsx
│   ├── Button.tsx
│   ├── FilterBar.tsx
│   ├── Input.tsx
│   ├── LoadingSpinner.tsx
│   ├── TaskCard.tsx
│   ├── TaskModal.tsx
│   ├── ThemeToggle.tsx
│   └── index.ts
├── context/
│   ├── AuthContext.tsx
│   ├── TasksContext.tsx
│   └── ThemeContext.tsx
├── pages/
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   └── Register.tsx
├── types/
├── utils/
│   ├── apiClient.ts
│   ├── helpers.ts
│   └── validation.ts
├── App.tsx
├── index.css
└── main.tsx
```

## Important Notes

- The frontend is wired to the Render-hosted backend, not a local `/api/auth/*` style backend.
- Table sorting is handled in the UI layer.
- Top-bar filtering is handled through `TasksContext`.
- Dark mode is persisted in local storage.
- React Strict Mode was removed in development to avoid duplicate API calls during effect execution.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run test
npx tsc -b
```

## Verification

The main verification command used during development is:

```bash
npx tsc -b
```

## Deployment

This app is deployed in Netlify as a static frontend.

Required environment variable:

```env
VITE_API_BASE_URL=https://taskflow-backend-dycf.onrender.com
```
