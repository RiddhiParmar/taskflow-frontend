// src/components/TaskModal.tsx
import { useState, useEffect } from 'react';
import { CalendarDays, ClipboardList, Flag, Sparkles, Users, X } from 'lucide-react';
import { useTasks } from '../context/TasksContext';
import type { Task } from '../types';
import { Button, Input } from './index';

interface AssignableUser {
  id: string;
  name: string;
  email?: string;
}

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  availableUsers?: AssignableUser[];
  canAssign?: boolean;
}

export default function TaskModal({
  task,
  isOpen,
  onClose,
  onSave,
  availableUsers = [],
  canAssign = false,
}: TaskModalProps) {
  const { createTask, updateTask } = useTasks();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    assigneeId: '',
    status: 'pending' as 'pending' | 'in-progress' | 'completed',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        assigneeId: task.assignee?._id || '',
        status: task.status,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assigneeId: '',
        status: 'pending',
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title required';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Max 100 characters';
    }

    if (formData.description.length > 1000) {
      newErrors.description = 'Max 1000 characters';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.dueDate = 'Due date must be in future';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (task) {
        await updateTask(task._id, {
          status: formData.status,
        });
      } else {
        await createTask({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          dueDate: formData.dueDate,
          status: formData.status,
          ...(formData.assigneeId ? { assignedTo: formData.assigneeId } : {}),
        });
      }
      onSave();
    } catch {
      // Error handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[var(--overlay)] backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="glass-panel-strong flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border">
          <div className="theme-modal-header shrink-0 border-b px-6 py-5 backdrop-blur-xl sm:px-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Task editor
                </p>
                <h2 className="text-2xl font-bold theme-text">
                  {task ? 'Edit your task' : 'Create a new task'}
                </h2>
                <p className="mt-1 text-sm theme-text-soft">
                  Keep it clear, assign priority, and set a realistic timeline.
                </p>
              </div>
              <button
                onClick={onClose}
                className="theme-icon-button flex h-10 w-10 items-center justify-center rounded-full border transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Input
                      label="Title"
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Task title..."
                      error={errors.title}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold theme-text-soft">
                      <ClipboardList className="h-4 w-4 theme-text-muted" />
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Add a concise summary or next step"
                      rows={4}
                      className={`theme-input glass-panel-strong w-full resize-none rounded-2xl border px-4 py-3.5 outline-none transition ${
                        errors.description
                          ? 'border-red-300 bg-red-50/80 focus:border-red-400 focus:ring-4 focus:ring-red-100'
                          : 'focus:border-primary-400 focus:ring-4 focus:ring-primary-100'
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-2 text-sm font-medium text-red-600">{errors.description}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold theme-text-soft">
                      <Flag className="h-4 w-4 theme-text-muted" />
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="theme-input theme-select glass-panel-strong w-full rounded-2xl border px-4 py-3.5 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold theme-text-soft">
                      <CalendarDays className="h-4 w-4 theme-text-muted" />
                      Due date
                    </label>
                    <Input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      error={errors.dueDate}
                      className="mb-0"
                    />
                  </div>

                  {canAssign && (
                    <div className="sm:col-span-2">
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold theme-text-soft">
                        <Users className="h-4 w-4 theme-text-muted" />
                        Assign to
                      </label>
                  <select
                        name="assigneeId"
                        value={formData.assigneeId}
                        onChange={handleChange}
                        className="theme-input theme-select glass-panel-strong w-full rounded-2xl border px-4 py-3.5 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
                      >
                        {!task && (
                          <option value="" disabled>
                            Select assignee
                          </option>
                        )}
                        {task && <option value="">Current: Unassigned</option>}
                        {availableUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.email ? `${user.name} • ${user.email}` : user.name}
                          </option>
                        ))}
                      </select>
                      {availableUsers.length === 0 && (
                        <p className="mt-2 text-sm theme-text-muted">
                          No assignable users are available right now.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {task && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold theme-text-soft">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="theme-input theme-select glass-panel-strong w-full rounded-2xl border px-4 py-3.5 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="theme-modal-footer shrink-0 border-t px-6 py-5 backdrop-blur-xl sm:px-8 sm:py-6">
              <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                className="flex-1"
              >
                {task ? 'Update task' : 'Create task'}
              </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
