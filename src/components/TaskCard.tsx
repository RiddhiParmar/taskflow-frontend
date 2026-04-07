// src/components/TaskCard.tsx
import { CalendarDays, CheckCircle2, Clock3, Trash2, UserRound, UserSquare2 } from 'lucide-react';
import type { Task } from '../types';
import { formatDate, getPriorityColor, getStatusColor, getDaysUntilDue, getPriorityLabel, getStatusLabel } from '../utils/helpers';
import { Button } from './Button';

interface AssignableUser {
  id: string;
  name: string;
}

interface TaskCardProps {
  task: Task;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: Task['status']) => void;
  onAssign?: (id: string, assigneeId: string) => void;
  editable?: boolean;
  managementMode?: boolean;
  canReassign?: boolean;
  assignableUsers?: AssignableUser[];
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onDelete,
  onStatusChange,
  editable = true,
  onAssign,
  managementMode = false,
  canReassign = false,
  assignableUsers = [],
}) => {
  const daysUntilDue = task.dueDate ? getDaysUntilDue(task.dueDate) : null;
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
  const statusActionLabel = task.status === 'pending' ? 'Start task' : 'Mark complete';

  return (
    <article className="glass-panel group flex h-full flex-col rounded-[28px] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-medium animate-fade-in">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-secondary-500">
            Task card
          </p>
          <h3 className="line-clamp-2 text-xl font-bold text-secondary-900 transition-colors duration-200 group-hover:text-primary-700">
            {task.title}
          </h3>
        </div>
        <div className="rounded-full bg-white/90 p-2 shadow-soft">
          {task.status === 'completed' ? (
            <CheckCircle2 className="h-5 w-5 text-primary-600" />
          ) : (
            <Clock3 className="h-5 w-5 text-accent-600" />
          )}
        </div>
      </div>

      <p className="mb-5 line-clamp-3 text-sm leading-6 text-secondary-600">
        {task.description || 'No description added yet.'}
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getPriorityColor(task.priority)}`}>
          {getPriorityLabel(task.priority)}
        </span>
        <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusColor(task.status)}`}>
          {getStatusLabel(task.status)}
        </span>
      </div>

      <div className="mb-6 space-y-3 rounded-2xl bg-white/65 p-4 text-sm text-secondary-600">
        {task.dueDate && (
          <div className={`flex items-start gap-3 ${isOverdue ? 'text-red-600' : 'text-secondary-600'}`}>
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="font-medium">
              Due: {formatDate(task.dueDate)}
              {daysUntilDue !== null && (
                <span className="ml-2 text-xs font-normal">
                  ({daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : `${daysUntilDue} days left`})
                </span>
              )}
            </span>
          </div>
        )}
        {task.assignee && (
          <div className="flex items-center gap-3">
            <UserRound className="h-4 w-4 shrink-0" />
            <span className="font-medium">Assigned to {task.assignee.name}</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <UserSquare2 className="h-4 w-4 shrink-0" />
          <span className="font-medium">Created by {task.createdBy.name}</span>
        </div>
      </div>

      <div className="mt-auto border-t border-secondary-200/70 pt-4">
        <p className="mb-4 text-xs uppercase tracking-[0.24em] text-secondary-500">
          {managementMode ? 'Management actions' : 'Quick actions'}
        </p>
        
      {editable && (
        <>
          {managementMode ? (
            <div className="space-y-3">
              {onStatusChange && (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-secondary-500">
                    Status
                  </label>
                  <select
                    value={task.status}
                    onChange={(event) => onStatusChange(task._id, event.target.value as Task['status'])}
                    className="glass-panel-strong w-full rounded-2xl border px-4 py-3 text-sm text-secondary-900 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}

              {canReassign && onAssign && (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-secondary-500">
                    Reassign task
                  </label>
                  <select
                    value={task.assignee?._id || ''}
                    onChange={(event) => onAssign(task._id, event.target.value)}
                    className="glass-panel-strong w-full rounded-2xl border px-4 py-3 text-sm text-secondary-900 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
                  >
                    <option value="">Unassigned</option>
                    {assignableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {onDelete && (
                <Button size="sm" variant="danger" onClick={() => onDelete(task._id)} className="w-full">
                  <Trash2 className="h-4 w-4" />
                  Delete task
                </Button>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {onStatusChange && task.status !== 'completed' && (
                <Button
                  size="sm"
                  variant={task.status === 'pending' ? 'primary' : 'secondary'}
                  onClick={() =>
                    onStatusChange(
                      task._id,
                      task.status === 'pending' ? 'in-progress' : 'completed'
                    )
                  }
                  className="flex-1 min-w-[140px]"
                >
                  {statusActionLabel}
                </Button>
              )}
              {onDelete && (
                <Button size="sm" variant="danger" onClick={() => onDelete(task._id)} className="px-4">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </>
      )}
      </div>
    </article>
  );
};
