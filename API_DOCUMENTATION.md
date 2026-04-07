# Frontend API Integration Guide

## Overview

This frontend integrates with the Taskflow backend hosted on Render.

Primary reference:
- Swagger UI: `https://taskflow-backend-dycf.onrender.com/api/docs`

Base URL used by the frontend:

```env
VITE_API_BASE_URL=https://taskflow-backend-dycf.onrender.com
```

## API Client

Shared client location:
- `src/utils/apiClient.ts`

Responsibilities:
- set base URL
- attach bearer token when available
- normalize backend errors
- expose `get`, `post`, `patch`, `put`, and `delete`

## Authentication Endpoints

### Register

Used by `AuthContext.register()`.

```http
POST /user/auth
Content-Type: application/json
```

Request body:

```json
{
  "firstName": "Riddhi",
  "lastName": "Parmar",
  "email": "riddhi@example.com",
  "password": "SecurePass123"
}
```

Frontend behavior:
- does not auto-login after register
- redirects to `/signin` on success

### Login

Used by `AuthContext.login()`.

```http
POST /user/auth/login
Content-Type: application/json
```

Request body:

```json
{
  "email": "riddhi@example.com",
  "password": "SecurePass123"
}
```

Frontend token handling:
- accepts `accessToken`, `token`, or `jwt`
- stores token through `apiClient.setToken()`
- then fetches current user if needed

### Current user

```http
GET /user
Authorization: Bearer <token>
```

Frontend mapping:
- backend `firstName` + `lastName` -> frontend `name`
- backend `_id` or `id` -> frontend `id`

### Logout

```http
POST /user/logout
Authorization: Bearer <token>
```

Frontend behavior:
- calls backend logout
- clears local session even if API logout fails

### Get all users

Used for admin reassignment and assignee filtering.

```http
GET /user/all
Authorization: Bearer <token>
```

Frontend notes:
- response normalization supports `data`, `users`, `items`, and `results`
- user shape is normalized to `{ id, name, email }`

## Task Endpoints

### Fetch tasks

```http
GET /task?page=1&limit=100
Authorization: Bearer <token>
```

Frontend notes:
- response unwrapping supports direct arrays plus paginated shapes
- backend `todo` status is mapped to frontend `pending`
- fetched tasks are stored in `allTasks`
- dashboard filters are applied in `TasksContext`
- table pagination is handled in the UI

### Create task

```http
POST /task
Authorization: Bearer <token>
Content-Type: application/json
```

Request body sent by frontend:

```json
{
  "title": "Prepare release notes",
  "description": "Summarize this sprint's work",
  "status": "todo",
  "priority": "medium",
  "dueDate": "2026-04-15T00:00:00.000Z",
  "assignedTo": "optional-user-id"
}
```

Frontend notes:
- due date is required in the modal
- assignee is shown for admins in create flow
- after creation, the app refreshes the task list

### Update task status

```http
PATCH /task/{taskId}
Authorization: Bearer <token>
Content-Type: application/json
```

Request body example:

```json
{
  "status": "completed",
  "completedAt": "2026-04-07T12:00:00.000Z"
}
```

Frontend notes:
- current frontend uses this endpoint for status changes
- full edit behavior is intentionally limited to the documented API shape

### Delete task

```http
DELETE /task/{taskId}
Authorization: Bearer <token>
```

### Reassign task

```http
PATCH /task/{id}/reassign
Authorization: Bearer <token>
Content-Type: application/json
```

Request body:

```json
{
  "assignedTo": "user-id"
}
```

## Frontend-Normalized Task Shape

Used internally by the UI:

```ts
interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignee?: {
    _id: string;
    email: string;
    name: string;
  };
  createdBy: {
    _id: string;
    email: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

## Frontend Error Handling

Errors are normalized by `apiClient`.

Examples:
- `400` -> invalid request message
- `401` -> unauthorized and token cleared
- `403` -> permission error
- `404` -> resource not found
- `409` -> conflict such as duplicate registration
- `500` -> generic server error

## Frontend Filtering and Sorting

Implemented client-side after task fetch.

Top-bar filters:
- search
- status
- priority
- assignee

Table header sorting:
- title
- status
- priority
- due date
- assigned to
- created by

## Verification Commands

```bash
npx tsc -b
npm run dev
```
