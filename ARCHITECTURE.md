# Architecture

## Overview

Taskflow Frontend is a client-rendered React application built with Vite. It uses React Context providers for authentication, tasks, and theme state. The UI communicates with a REST backend through a shared Axios client.

## High-Level Architecture

```text
Browser UI
  -> React Pages and Components
  -> Context Providers
     -> AuthContext
     -> TasksContext
     -> ThemeContext
  -> apiClient (Axios)
  -> Taskflow Backend REST API
```

## Application Layers

### Presentation Layer

Main screens:
- `Login`
- `Register`
- `Dashboard`

Shared UI:
- buttons, inputs, alerts, spinner
- filter bar
- task modal
- theme toggle

### State Layer

#### AuthContext

Responsibilities:
- register
- login
- load current user from saved token
- logout
- persist token through `apiClient`

#### TasksContext

Responsibilities:
- fetch task list
- normalize backend task shape into frontend `Task`
- create task
- update task status
- delete task
- reassign task
- maintain filter state for search, status, priority, and assignee

#### ThemeContext

Responsibilities:
- read saved theme from local storage
- fall back to `prefers-color-scheme`
- apply `data-theme` on `document.documentElement`
- expose light/dark toggle

## Routing

Public routes:
- `/signin`
- `/signup`

Compatibility redirects:
- `/login` -> `/signin`
- `/register` -> `/signup`

Protected route:
- `/dashboard`

## Task Workspace Design

The dashboard uses two workspaces inside the same authenticated screen.

### Dashboard tab
- summary cards
- top filters
- task table
- pagination
- column sorting

### Task Management tab
- create task action
- total task summary
- inline status updates
- admin reassignment
- deletion controls
- pagination

## Data Flow

### Authentication flow

```text
Login/Register form
  -> AuthContext action
  -> apiClient request
  -> backend response
  -> token storage
  -> current user mapping
  -> route navigation
```

### Task flow

```text
Dashboard or modal interaction
  -> TasksContext action
  -> apiClient request
  -> backend response
  -> task normalization
  -> filtered/sorted table render
```

## API Integration Design

The frontend is aligned to the live backend Swagger contract.

Primary endpoints used:
- `POST /user/auth`
- `POST /user/auth/login`
- `GET /user`
- `POST /user/logout`
- `GET /user/all`
- `GET /task?page=1&limit=100`
- `POST /task`
- `PATCH /task/{taskId}`
- `DELETE /task/{taskId}`
- `PATCH /task/{id}/reassign`

## Styling Architecture

Global styling is driven by:
- `tailwind.config.js` for theme tokens
- `src/index.css` for global variables and theme-aware utility classes

UI characteristics:
- blue-led light theme
- dark mode support
- glass-style panels
- shared `theme-*` utility classes
- responsive table and modal layouts

## Table and Filter Design

Top-bar filters are managed in `TasksContext`.
Table column sorting is managed locally in `Dashboard.tsx`.

This split keeps:
- filter state reusable and easy to reason about
- table sorting independent from API-backed filtering

## Error Handling

`apiClient` centralizes:
- auth token injection
- backend error message extraction
- unauthorized handling
- normalized thrown errors

Context providers expose user-friendly error strings to the UI.

## Testing and Verification

Primary verification:

```bash
npx tsc -b
```

Optional app checks:

```bash
npm run dev
npm run build
npm test
```

## Operational Notes

- Current Vite setup expects newer Node versions, so production build requires compatible Node.
- Development duplicate API calls were reduced by removing `React.StrictMode` in `main.tsx`.
- Task fetching currently loads up to 100 tasks from the backend and paginates in the frontend table.
