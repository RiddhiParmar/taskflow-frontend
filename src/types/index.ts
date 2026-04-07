// src/types/index.ts

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt?: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee?: {
    _id: string;
    email: string;
    name: string;
  };
  dueDate?: string;
  createdBy: {
    _id: string;
    email: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TasksState {
  tasks: Task[];
  filteredTasks: Task[];
  isLoading: boolean;
  error: string | null;
  filters: {
    search: string;
    status: string;
    priority: string;
    sortBy: 'dueDate' | 'priority' | 'createdAt';
    sortOrder: 'asc' | 'desc';
  };
}

export interface ApiError {
  message: string;
  statusCode?: number;
  data?: Record<string, unknown>;
}
