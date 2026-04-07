# Developer Guide

## Overview

This guide is for working on the current Taskflow frontend codebase.

The app uses:
- React + TypeScript
- Vite
- Tailwind CSS
- React Context API
- Axios

It does not use Redux.

## Run the Project

```bash
npm install
npm run dev
```

Type check:

```bash
npx tsc -b
```

Build:

```bash
npm run build
```

## Environment Setup

Use `.env.local`:

```env
VITE_API_BASE_URL=https://taskflow-backend-dycf.onrender.com
```

## Key Files

### App shell
- `src/App.tsx`
- `src/main.tsx`
- `src/index.css`

### Context providers
- `src/context/AuthContext.tsx`
- `src/context/TasksContext.tsx`
- `src/context/ThemeContext.tsx`

### Pages
- `src/pages/Login.tsx`
- `src/pages/Register.tsx`
- `src/pages/Dashboard.tsx`

### Shared components
- `src/components/FilterBar.tsx`
- `src/components/TaskModal.tsx`
- `src/components/Button.tsx`
- `src/components/Input.tsx`
- `src/components/ThemeToggle.tsx`

### Utilities
- `src/utils/apiClient.ts`
- `src/utils/helpers.ts`
- `src/utils/validation.ts`

## Current Frontend Patterns

### Authentication

Use `useAuth()` from `AuthContext`.

Available actions:
- `register(email, firstName, lastName, password)`
- `login(email, password)`
- `logout()`

### Tasks

Use `useTasks()` from `TasksContext`.

Available state:
- `allTasks`
- `tasks`
- `isLoading`
- `error`
- filter values

Available actions:
- `fetchTasks()`
- `createTask()`
- `updateTask()`
- `deleteTask()`
- `assignTask()`
- filter setters

### Theme

Use `useTheme()` from `ThemeContext`.

Available state:
- `theme`

Available actions:
- `toggleTheme()`

## UI Conventions

### Forms

- keep validation in the component or shared validation utils
- use shared `Input` and `Button` where possible
- surface errors with `Alert`

### Styling

- prefer existing `theme-*` utility classes from `src/index.css`
- keep dark mode compatible when adding new surfaces
- use the blue-led palette already defined in `tailwind.config.js`

### Tables

- dashboard tables use client-side pagination
- default page size is `10`
- table sorting is local to `Dashboard.tsx`
- filters live in `TasksContext`

## Assignee Filtering

The dashboard assignee filter uses a checkbox dropdown.

Implementation details:
- options come from `/user/all`
- selection uses user IDs, not names
- duplicate names are supported safely
- hover state can reveal extra user detail in the dropdown

## API Notes

Backend reference:
- `https://taskflow-backend-dycf.onrender.com/api/docs`

Current endpoint mapping:
- register -> `POST /user/auth`
- login -> `POST /user/auth/login`
- current user -> `GET /user`
- logout -> `POST /user/logout`
- users -> `GET /user/all`
- tasks -> `GET /task?page=1&limit=100`
- create task -> `POST /task`
- update task status -> `PATCH /task/{taskId}`
- delete task -> `DELETE /task/{taskId}`
- reassign task -> `PATCH /task/{id}/reassign`

## Common Development Tasks

### Add a new filter

1. add filter state to `TasksContext`
2. apply it inside `getFilteredTasks`
3. pass props through `FilterBar`
4. reset dashboard page when the filter changes

### Update table behavior

1. edit `Dashboard.tsx`
2. keep pagination and sorting in sync
3. run `npx tsc -b`

### Add a new themed component

1. start with shared `glass-panel` or `glass-panel-strong`
2. use `theme-text`, `theme-text-soft`, and `theme-input`
3. check both light and dark mode before finishing

## Validation and Checks

Preferred verification steps:

```bash
npx tsc -b
npm run dev
```

If build verification is needed, make sure Node is on a version compatible with the installed Vite release.

## Documentation Reference

Keep these files aligned when behavior changes:
- `README.md`
- `ARCHITECTURE.md`
- `API_DOCUMENTATION.md`
- `DEVELOPER_GUIDE.md`
