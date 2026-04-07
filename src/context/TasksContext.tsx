import React, { createContext, useState, useCallback } from 'react';
import apiClient from '../utils/apiClient';
import type { Task } from '../types';

interface TaskApiItem {
  _id: string | { toString?: () => string };
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  assignedTo?: string | { toString?: () => string } | null;
  createdBy?: string | { toString?: () => string } | null;
  assignedToDetails?: {
    _id?: string | { toString?: () => string };
    email?: string;
    name?: string;
  };
  createdByDetails?: {
    _id?: string | { toString?: () => string };
    email?: string;
    name?: string;
  };
  assignedToUser?: {
    name: string;
  };
  createdByUser?: {
    name: string;
  };
}

interface PaginatedTaskResponse {
  data: TaskApiItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateTaskPayload {
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  dueDate: string;
  assignedTo?: string;
}

interface TasksContextType {
  allTasks: Task[];
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  // Filters
  searchQuery: string;
  statusFilter: string;
  priorityFilter: string;
  assigneeFilter: string[];
  sortBy: 'dueDate' | 'priority' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  // Actions
  fetchTasks: (isAdmin?: boolean) => Promise<void>;
  createTask: (task: CreateTaskPayload) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  assignTask: (id: string, userId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setPriorityFilter: (priority: string) => void;
  setAssigneeFilter: (assigneeIds: string[]) => void;
  setSortBy: (field: 'dueDate' | 'priority' | 'createdAt') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  clearError: () => void;
}

export const TasksContext = createContext<TasksContextType | undefined>(undefined);

const mapApiStatusToUiStatus = (status: TaskApiItem['status']): Task['status'] => {
  switch (status) {
    case 'todo':
      return 'pending';
    default:
      return status;
  }
};

const mapUiStatusToApiStatus = (status: Task['status']): TaskApiItem['status'] => {
  switch (status) {
    case 'pending':
      return 'todo';
    default:
      return status;
  }
};

const normalizeObjectId = (value?: string | { toString?: () => string } | null): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value.toString === 'function') return value.toString();
  return '';
};

const getTaskArray = (response: unknown): TaskApiItem[] => {
  if (Array.isArray(response)) {
    return response as TaskApiItem[];
  }

  if (response && typeof response === 'object') {
    const maybePaginated = response as {
      data?: unknown;
      tasks?: unknown;
      items?: unknown;
      results?: unknown;
    };

    if (Array.isArray(maybePaginated.data)) return maybePaginated.data as TaskApiItem[];
    if (Array.isArray(maybePaginated.tasks)) return maybePaginated.tasks as TaskApiItem[];
    if (Array.isArray(maybePaginated.items)) return maybePaginated.items as TaskApiItem[];
    if (Array.isArray(maybePaginated.results)) return maybePaginated.results as TaskApiItem[];
  }

  return [];
};

const normalizeTask = (task: TaskApiItem): Task => ({
  _id: normalizeObjectId(task._id),
  title: task.title,
  description: task.description,
  status: mapApiStatusToUiStatus(task.status),
  priority: task.priority,
  dueDate: task.dueDate,
  createdAt: task.createdAt || new Date().toISOString(),
  updatedAt: task.updatedAt || task.createdAt || new Date().toISOString(),
  assignee: task.assignedTo
    ? {
        _id: normalizeObjectId(task.assignedToDetails?._id || task.assignedTo),
        email: task.assignedToDetails?.email || '',
        name: task.assignedToDetails?.name || task.assignedToUser?.name || 'Assigned user',
      }
    : undefined,
  createdBy: {
    _id: normalizeObjectId(task.createdByDetails?._id || task.createdBy),
    email: task.createdByDetails?.email || '',
    name: task.createdByDetails?.name || task.createdByUser?.name || 'Task creator',
  },
});

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get filtered and sorted tasks
  const getFilteredTasks = useCallback((allTasks: Task[]) => {
    let filtered = [...allTasks];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter && priorityFilter !== 'all') {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    if (assigneeFilter.length > 0) {
      filtered = filtered.filter((task) =>
        assigneeFilter.includes(task.assignee?._id || '__unassigned__')
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;

      if (sortBy === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        compareValue = dateA - dateB;
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        compareValue = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else {
        compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [searchQuery, statusFilter, priorityFilter, assigneeFilter, sortBy, sortOrder]);

  const fetchTasks = async (_isAdmin = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<PaginatedTaskResponse | TaskApiItem[]>('/task?page=1&limit=100');
      setAllTasks(getTaskArray(response).map(normalizeTask));
    } catch (err) {
      const errorMsg = (err as any).message || 'Failed to fetch tasks';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const createTask = async (newTask: CreateTaskPayload) => {
    setError(null);
    try {
      await apiClient.post<{ taskId: unknown }>('/task', {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        status: mapUiStatusToApiStatus(newTask.status),
        dueDate: new Date(newTask.dueDate).toISOString(),
        ...(newTask.assignedTo ? { assignedTo: newTask.assignedTo } : {}),
      });

      await fetchTasks();
    } catch (err) {
      const errorMsg = (err as any).message || 'Failed to create task';
      setError(errorMsg);
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setError(null);
    try {
      const payload: { status?: TaskApiItem['status']; completedAt?: string } = {};

      if (updates.status) {
        payload.status = mapUiStatusToApiStatus(updates.status);
        if (updates.status === 'completed') {
          payload.completedAt = new Date().toISOString();
        }
      }

      await apiClient.patch(`/task/${id}`, payload);
      await fetchTasks();
    } catch (err) {
      const errorMsg = (err as any).message || 'Failed to update task';
      setError(errorMsg);
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    setError(null);
    try {
      await apiClient.delete(`/task/${id}`);
      setAllTasks((currentTasks) => currentTasks.filter((task) => task._id !== id));
    } catch (err) {
      const errorMsg = (err as any).message || 'Failed to delete task';
      setError(errorMsg);
      throw err;
    }
  };

  const assignTask = async (id: string, userId: string) => {
    setError(null);
    try {
      await apiClient.patch(`/task/${id}/reassign`, { assignedTo: userId });
      await fetchTasks();
    } catch (err) {
      const errorMsg = (err as any).message || 'Failed to assign task';
      setError(errorMsg);
      throw err;
    }
  };

  const value: TasksContextType = {
    allTasks,
    tasks: getFilteredTasks(allTasks) as Task[],
    isLoading,
    error,
    searchQuery,
    statusFilter,
    priorityFilter,
    assigneeFilter,
    sortBy,
    sortOrder,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    assignTask,
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    setAssigneeFilter,
    setSortBy,
    setSortOrder,
    clearError: () => setError(null),
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

// Custom hook to use tasks context
export const useTasks = () => {
  const context = React.useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within TasksProvider');
  }
  return context;
};
