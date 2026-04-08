// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpDown, CalendarRange, CheckCircle2, ChevronLeft, ChevronRight, Clock3, LayoutDashboard, ListTodo, LogOut, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TasksContext';
import { Button, Alert, LoadingSpinner, FilterBar, ThemeToggle } from '../components';
import TaskModal from '../components/TaskModal';
import apiClient from '../utils/apiClient';
import { formatDate, getPriorityColor, getPriorityLabel, getStatusColor, getStatusLabel } from '../utils/helpers';

interface DashboardUser {
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  fullName?: string;
  email?: string;
}

interface AssignableUser {
  id: string;
  name: string;
  email?: string;
}

type WorkspaceTab = 'dashboard' | 'management';
type TableSortKey = 'title' | 'status' | 'priority' | 'dueDate' | 'assignee' | 'createdBy';
type TableSortDirection = 'asc' | 'desc';

const normalizeUsers = (response: unknown): AssignableUser[] => {
  const rawUsers = Array.isArray(response)
    ? response
    : response && typeof response === 'object' && Array.isArray((response as { data?: unknown }).data)
      ? (response as { data: DashboardUser[] }).data
      : response && typeof response === 'object' && Array.isArray((response as { users?: unknown }).users)
        ? (response as { users: DashboardUser[] }).users
        : response && typeof response === 'object' && Array.isArray((response as { items?: unknown }).items)
          ? (response as { items: DashboardUser[] }).items
          : response && typeof response === 'object' && Array.isArray((response as { results?: unknown }).results)
            ? (response as { results: DashboardUser[] }).results
      : [];

  return rawUsers
    .map((user): AssignableUser | null => {
      const typedUser = user as DashboardUser;
      const id = typedUser._id || typedUser.id;
      if (!id) return null;

      const name =
        typedUser.name ||
        typedUser.fullName ||
        [typedUser.firstName, typedUser.lastName].filter(Boolean).join(' ').trim() ||
        typedUser.email ||
        'User';

      return { id, name, email: typedUser.email };
    })
    .filter((user): user is AssignableUser => Boolean(user))
    .filter((user, index, users) => users.findIndex((currentUser) => currentUser.id === user.id) === index);
};

export default function Dashboard() {
  const PAGE_SIZE = 10;
  const priorityRank = { low: 1, medium: 2, high: 3 } as const;
  const statusRank = { pending: 1, 'in-progress': 2, completed: 3 } as const;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { 
    allTasks,
    tasks, 
    isLoading, 
    error, 
    fetchTasks, 
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    setAssigneeFilter,
    updateTask,
    deleteTask,
    assignTask,
    searchQuery,
    statusFilter,
    priorityFilter,
    assigneeFilter,
  } = useTasks();

  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('dashboard');
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const [dashboardPage, setDashboardPage] = useState(1);
  const [managementPage, setManagementPage] = useState(1);
  const [tableSort, setTableSort] = useState<{ key: TableSortKey; direction: TableSortDirection }>({
    key: 'dueDate',
    direction: 'asc',
  });

  const completedTasks = tasks.filter((task) => task.status === 'completed').length;
  const activeTasks = tasks.filter((task) => task.status === 'in-progress').length;
  const upcomingTasks = tasks.filter((task) => {
    if (!task.dueDate || task.status === 'completed') {
      return false;
    }

    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate >= today;
  }).length;
  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate || task.status === 'completed') {
      return false;
    }

    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }).length;
  const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Load tasks on mount
  useEffect(() => {
    const isAdmin = user?.role === 'admin';
    fetchTasks(isAdmin);
  }, [user?.role]);

  useEffect(() => {
    setDashboardPage(1);
  }, [searchQuery, statusFilter, priorityFilter, assigneeFilter, tasks.length]);

  useEffect(() => {
    setManagementPage(1);
  }, [allTasks.length]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      setDashboardPage(1);
      return;
    }

    setManagementPage(1);
  }, [tableSort, activeTab]);

  useEffect(() => {
    const loadUsers = async () => {
      if (user?.role !== 'admin') {
        setAssignableUsers([]);
        return;
      }

      try {
        const response = await apiClient.get<DashboardUser[] | { data?: DashboardUser[] }>('/user/all');
        setAssignableUsers(normalizeUsers(response));
      } catch {
        setAssignableUsers([]);
      }
    };

    loadUsers();
  }, [user?.role]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateTask(id, { status: newStatus as any });
      setSuccessMessage('Task status updated');
    } catch {
      // Error handled by context
    }
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm('Delete this task?')) {
      deleteTask(id).then(() => setSuccessMessage('Task deleted'));
    }
  };

  const handleCreateTask = () => {
    setShowModal(true);
  };

  const handleTaskModalClose = () => {
    setShowModal(false);
  };

  const handleTaskSave = () => {
    setSuccessMessage('Task created');
    handleTaskModalClose();
  };

  const handleAssignTask = async (taskId: string, assigneeId: string) => {
    try {
      await assignTask(taskId, assigneeId);
      setSuccessMessage(assigneeId ? 'Task reassigned' : 'Task updated');
    } catch {
      // Error handled by context
    }
  };

  const handleTableSort = (key: TableSortKey) => {
    setTableSort((currentSort) => ({
      key,
      direction: currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortableValue = (task: typeof currentTasks[number], key: TableSortKey): string | number => {
    switch (key) {
      case 'title':
        return task.title.toLowerCase();
      case 'status':
        return statusRank[task.status];
      case 'priority':
        return priorityRank[task.priority];
      case 'dueDate':
        return task.dueDate ? new Date(task.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      case 'assignee':
        return (task.assignee?.name || '').toLowerCase();
      case 'createdBy':
        return task.createdBy.name.toLowerCase();
      default:
        return '';
    }
  };

  const currentTasks = activeTab === 'dashboard' ? tasks : allTasks;
  const sortedTasks = [...currentTasks].sort((taskA, taskB) => {
    const valueA = getSortableValue(taskA, tableSort.key);
    const valueB = getSortableValue(taskB, tableSort.key);

    if (valueA < valueB) {
      return tableSort.direction === 'asc' ? -1 : 1;
    }

    if (valueA > valueB) {
      return tableSort.direction === 'asc' ? 1 : -1;
    }

    return 0;
  });
  const currentPage = activeTab === 'dashboard' ? dashboardPage : managementPage;
  const totalPages = Math.max(1, Math.ceil(sortedTasks.length / PAGE_SIZE));
  const paginatedTasks = sortedTasks.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const setPage = (page: number) => {
    const safePage = Math.min(Math.max(page, 1), totalPages);
    if (activeTab === 'dashboard') {
      setDashboardPage(safePage);
    } else {
      setManagementPage(safePage);
    }
  };

  return (
    <div className="app-shell">
      <header className="theme-topbar sticky top-0 z-50 border-b backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="animate-slide-up">
            <p className="theme-chip mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] shadow-soft">
              <Sparkles className="h-3.5 w-3.5" />
              Task management workspace
            </p>
            <h1 className="text-3xl font-bold theme-text sm:text-4xl">TaskFlow</h1>
            <p className="mt-1 text-sm theme-text-soft">
              Welcome back, <span className="font-semibold theme-text">{user?.name}</span>
              <span className="mx-2 theme-text-muted">•</span>
              <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700 capitalize">
                {user?.role}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button variant="secondary" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {successMessage && (
          <div className="mb-6 animate-slide-up">
            <Alert
              type="success"
              message={successMessage}
              onClose={() => setSuccessMessage('')}
              dismissible
            />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 animate-slide-up">
            <Alert type="error" message={error} dismissible />
          </div>
        )}

        <div className="mb-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === 'dashboard'
                ? 'bg-primary-700 text-white shadow-medium'
                : 'glass-panel-strong theme-text-soft hover:border-primary-200'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('management')}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
              activeTab === 'management'
                ? 'bg-primary-700 text-white shadow-medium'
                : 'glass-panel-strong theme-text-soft hover:border-primary-200'
            }`}
          >
            <ListTodo className="h-4 w-4" />
            Task Management
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <>
            <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="glass-panel rounded-[28px] p-5 animate-slide-up">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] theme-text-muted">Filtered tasks</p>
                    <p className="mt-3 text-3xl font-bold theme-text">{tasks.length}</p>
                  </div>
                  <div className="theme-subtle-chip rounded-2xl p-3 shadow-soft">
                    <CalendarRange className="h-5 w-5 text-primary-700" />
                  </div>
                </div>
                <p className="mt-4 text-sm theme-text-soft">Tasks currently visible with your active filters</p>
              </div>

              <div className="glass-panel rounded-[28px] p-5 animate-slide-up" style={{ animationDelay: '0.05s' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] theme-text-muted">Completion</p>
                    <p className="mt-3 text-3xl font-bold theme-text">{completionRate}%</p>
                  </div>
                  <div className="rounded-2xl bg-primary-50 p-3">
                    <CheckCircle2 className="h-5 w-5 text-primary-700" />
                  </div>
                </div>
                <p className="mt-4 text-sm theme-text-soft">{completedTasks} completed tasks</p>
              </div>

              <div className="glass-panel rounded-[28px] p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] theme-text-muted">In progress</p>
                    <p className="mt-3 text-3xl font-bold theme-text">{activeTasks}</p>
                  </div>
                  <div className="rounded-2xl bg-accent-50 p-3">
                    <Clock3 className="h-5 w-5 text-accent-700" />
                  </div>
                </div>
                <p className="mt-4 text-sm theme-text-soft">{upcomingTasks} tasks with upcoming deadlines</p>
              </div>

              <div className="glass-panel rounded-[28px] p-5 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] theme-text-muted">Overdue</p>
                    <p className="mt-3 text-3xl font-bold theme-text">{overdueTasks}</p>
                  </div>
                  <div className="rounded-2xl bg-red-50 p-3">
                    <Clock3 className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <p className="mt-4 text-sm theme-text-soft">{overdueTasks} overdue tasks based on due date</p>
              </div>
            </section>

            <FilterBar
              onSearch={setSearchQuery}
              onStatusChange={setStatusFilter}
              onPriorityChange={setPriorityFilter}
              onAssigneeChange={setAssigneeFilter}
              currentSearch={searchQuery}
              currentStatus={statusFilter}
              currentPriority={priorityFilter}
              currentAssignees={assigneeFilter}
              assigneeOptions={assignableUsers}
            />
          </>
        )}

        {activeTab === 'management' && (
          <section className="mb-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="glass-panel rounded-[28px] p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] theme-text-muted">Task management</p>
                  <h2 className="mt-2 text-2xl font-bold theme-text">Create and manage tasks</h2>
                  <p className="mt-2 text-sm theme-text-soft">
                    Add a new task, update status, and reassign work from one place.
                  </p>
                </div>
                <Button onClick={handleCreateTask} size="lg" className="min-w-[190px] shadow-medium">
                  <Plus className="h-4 w-4" />
                  Create task
                </Button>
              </div>
            </div>

            <div className="glass-panel rounded-[28px] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] theme-text-muted">Available tasks</p>
                  <p className="mt-3 text-3xl font-bold theme-text">{allTasks.length}</p>
                </div>
                <div className="rounded-2xl bg-primary-50 p-3">
                  <CalendarRange className="h-5 w-5 text-primary-700" />
                </div>
              </div>
              <p className="mt-4 text-sm theme-text-soft">
                Total task{allTasks.length === 1 ? '' : 's'} currently loaded in this workspace.
              </p>
            </div>
          </section>
        )}

        {isLoading ? (
          <div className="animate-fade-in">
            <LoadingSpinner message="Loading your tasks..." />
          </div>
        ) : currentTasks.length === 0 ? (
          <div className="glass-panel rounded-[34px] py-16 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
              <Plus className="h-7 w-7 text-primary-700" />
            </div>
            <h3 className="mt-6 text-2xl font-bold theme-text">
              {activeTab === 'dashboard' ? 'No tasks match your filters' : 'No tasks yet'}
            </h3>
            <p className="mx-auto mt-3 max-w-md theme-text-soft">
              {activeTab === 'dashboard'
                ? 'Try changing the filters or search term to see more tasks.'
                : 'Start with one clean task and build the rest of the board from there.'}
            </p>
            <Button onClick={handleCreateTask} variant="primary" size="lg">
              {activeTab === 'dashboard' ? 'Create a new task' : 'Create your first task'}
            </Button>
          </div>
        ) : (
          <section className="glass-panel overflow-hidden rounded-[32px] animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left">
                <thead className="theme-table-head">
                  <tr className="theme-row-divider text-xs uppercase tracking-[0.18em] theme-text-muted">
                    <th className="px-5 py-4 font-semibold">
                      <button type="button" onClick={() => handleTableSort('title')} className="inline-flex items-center gap-2 transition hover:text-primary-700">
                        Task
                        <ArrowUpDown className={`h-3.5 w-3.5 ${tableSort.key === 'title' ? 'text-primary-700' : ''}`} />
                      </button>
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      <button type="button" onClick={() => handleTableSort('status')} className="inline-flex items-center gap-2 transition hover:text-primary-700">
                        Status
                        <ArrowUpDown className={`h-3.5 w-3.5 ${tableSort.key === 'status' ? 'text-primary-700' : ''}`} />
                      </button>
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      <button type="button" onClick={() => handleTableSort('priority')} className="inline-flex items-center gap-2 transition hover:text-primary-700">
                        Priority
                        <ArrowUpDown className={`h-3.5 w-3.5 ${tableSort.key === 'priority' ? 'text-primary-700' : ''}`} />
                      </button>
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      <button type="button" onClick={() => handleTableSort('dueDate')} className="inline-flex items-center gap-2 transition hover:text-primary-700">
                        Due Date
                        <ArrowUpDown className={`h-3.5 w-3.5 ${tableSort.key === 'dueDate' ? 'text-primary-700' : ''}`} />
                      </button>
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      <button type="button" onClick={() => handleTableSort('assignee')} className="inline-flex items-center gap-2 transition hover:text-primary-700">
                        Assigned To
                        <ArrowUpDown className={`h-3.5 w-3.5 ${tableSort.key === 'assignee' ? 'text-primary-700' : ''}`} />
                      </button>
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      <button type="button" onClick={() => handleTableSort('createdBy')} className="inline-flex items-center gap-2 transition hover:text-primary-700">
                        Created By
                        <ArrowUpDown className={`h-3.5 w-3.5 ${tableSort.key === 'createdBy' ? 'text-primary-700' : ''}`} />
                      </button>
                    </th>
                    {activeTab === 'management' && <th className="px-5 py-4 font-semibold">Actions</th>}
                  </tr>
                </thead>
                <tbody className="bg-transparent">
                  {paginatedTasks.map((task) => (
                    <tr key={task._id} className="theme-row-divider theme-row-hover align-top transition">
                      <td className="px-5 py-4">
                        <div className="min-w-[220px]">
                          <p className="font-semibold theme-text">{task.title}</p>
                          <p className="mt-1 line-clamp-2 text-sm theme-text-soft">{task.description}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {activeTab === 'management' ? (
                          <select
                            value={task.status}
                            onChange={(event) => handleStatusChange(task._id, event.target.value)}
                            className="theme-input theme-select glass-panel-strong min-w-[150px] rounded-2xl border px-3 py-2.5 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusColor(task.status)}`}>
                            {getStatusLabel(task.status)}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                          {getPriorityLabel(task.priority)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium theme-text-soft">
                        {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                      </td>
                      <td className="px-5 py-4 text-sm theme-text-soft">
                        {activeTab === 'management' && user?.role === 'admin' ? (
                          <select
                            value={task.assignee?._id || ''}
                            onChange={(event) => handleAssignTask(task._id, event.target.value)}
                            className="theme-input theme-select glass-panel-strong min-w-[180px] rounded-2xl border px-3 py-2.5 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
                          >
                            <option value="">Unassigned</option>
                            {assignableUsers.map((assignableUser) => (
                              <option key={assignableUser.id} value={assignableUser.id}>
                                {assignableUser.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          task.assignee?.name || 'Unassigned'
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm theme-text-soft">{task.createdBy.name}</td>
                      {activeTab === 'management' && (
                        <td className="px-5 py-4">
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDeleteTask(task._id)}
                            disabled={!(user?.role === 'admin' || task.createdBy._id === user?.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="theme-footer-strip flex flex-col gap-4 border-t px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm theme-text-soft">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, sortedTasks.length)} of {sortedTasks.length} tasks
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="theme-chip rounded-2xl px-4 py-2 text-sm font-semibold shadow-soft">
                  Page {currentPage} of {totalPages}
                </span>
                <Button size="sm" variant="secondary" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </section>
        )}
      </main>

      {showModal && (
        <TaskModal
          task={null}
          isOpen={showModal}
          onClose={handleTaskModalClose}
          onSave={handleTaskSave}
          availableUsers={assignableUsers}
          canAssign={user?.role === 'admin'}
        />
      )}
    </div>
  );
}
