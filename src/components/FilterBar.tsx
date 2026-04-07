// src/components/FilterBar.tsx
import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Search, SlidersHorizontal } from 'lucide-react';

interface AssigneeOption {
  id: string;
  name: string;
  email?: string;
}

interface FilterBarProps {
  onSearch: (search: string) => void;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
  onAssigneeChange?: (assigneeIds: string[]) => void;
  currentSearch?: string;
  currentStatus?: string;
  currentPriority?: string;
  currentAssignees?: string[];
  assigneeOptions?: AssigneeOption[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  onSearch,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  currentSearch = '',
  currentStatus = 'all',
  currentPriority = 'all',
  currentAssignees = [],
  assigneeOptions = [],
}) => {
  const [search, setSearch] = useState(currentSearch);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(currentAssignees);
  const [isAssigneeMenuOpen, setIsAssigneeMenuOpen] = useState(false);
  const [hoveredAssigneeId, setHoveredAssigneeId] = useState<string | null>(null);
  const assigneeMenuRef = useRef<HTMLDivElement | null>(null);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearch(value);
  };

  const handleAssigneeToggle = (assigneeId: string) => {
    const nextAssignees = selectedAssignees.includes(assigneeId)
      ? selectedAssignees.filter((value) => value !== assigneeId)
      : [...selectedAssignees, assigneeId];

    setSelectedAssignees(nextAssignees);
    onAssigneeChange?.(nextAssignees);
  };

  useEffect(() => {
    setSelectedAssignees(currentAssignees);
  }, [currentAssignees]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!assigneeMenuRef.current?.contains(event.target as Node)) {
        setIsAssigneeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedAssigneeNames = selectedAssignees
    .map((selectedId) => assigneeOptions.find((option) => option.id === selectedId))
    .filter((option): option is AssigneeOption => Boolean(option))
    .map((option) => option.name);

  const assigneeLabel =
    selectedAssignees.length === 0
      ? 'All assignees'
      : selectedAssignees.length === 1
        ? selectedAssigneeNames[0]
        : `${selectedAssignees.length} assignees selected`;

  return (
    <div className="glass-panel relative z-20 mb-8 rounded-[28px] p-6 animate-slide-up sm:p-7">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] theme-text-muted">Workspace filters</p>
          <h3 className="mt-1 text-xl font-bold theme-text">Refine your task board</h3>
        </div>
        <div className="theme-chip inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium">
          <SlidersHorizontal className="h-4 w-4" />
          Quick controls
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {/* Search */}
        <div className="animate-fade-in xl:col-span-2" style={{ animationDelay: '0.1s' }}>
          <label className="mb-2 block text-sm font-semibold theme-text-soft">Search</label>
          <div className="glass-panel-strong flex items-center gap-3 rounded-2xl px-4 py-3 transition focus-within:ring-4 focus-within:ring-primary-100">
            <Search className="h-4 w-4 theme-text-muted" />
            <input
              type="text"
              placeholder="Search by title or description"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="theme-input w-full border-0 bg-transparent px-0 py-0 text-sm focus:ring-0"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <label className="mb-2 block text-sm font-semibold theme-text-soft">Status</label>
          <select
            value={currentStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="theme-input theme-select glass-panel-strong w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <label className="mb-2 block text-sm font-semibold theme-text-soft">Priority</label>
          <select
            value={currentPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="theme-input theme-select glass-panel-strong w-full rounded-2xl border px-4 py-3 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Assignee */}
        <div className="animate-fade-in relative" style={{ animationDelay: '0.4s' }} ref={assigneeMenuRef}>
          <label className="mb-2 block text-sm font-semibold theme-text-soft">Assignee</label>
          <button
            type="button"
            onClick={() => setIsAssigneeMenuOpen((currentState) => !currentState)}
            className="theme-input glass-panel-strong flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm outline-none transition hover:border-primary-300"
          >
            <span className="truncate text-left">{assigneeLabel}</span>
            <ChevronDown className={`h-4 w-4 shrink-0 theme-text-muted transition ${isAssigneeMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isAssigneeMenuOpen && (
            <div className="glass-panel-strong absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border p-2 shadow-medium">
              <button
                type="button"
                onClick={() => {
                  setSelectedAssignees([]);
                  onAssigneeChange?.([]);
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-[var(--chip-bg-soft)]"
              >
                <span className={`flex h-4 w-4 items-center justify-center rounded border ${selectedAssignees.length === 0 ? 'border-primary-600 bg-primary-600 text-white' : 'theme-border theme-text-muted'}`}>
                  {selectedAssignees.length === 0 && <Check className="h-3 w-3" />}
                </span>
                <span className="theme-text">All assignees</span>
              </button>

              {assigneeOptions.map((assigneeOption) => {
                const isChecked = selectedAssignees.includes(assigneeOption.id);

                return (
                  <button
                    key={assigneeOption.id}
                    type="button"
                    onClick={() => handleAssigneeToggle(assigneeOption.id)}
                    onMouseEnter={() => setHoveredAssigneeId(assigneeOption.id)}
                    onMouseLeave={() => setHoveredAssigneeId((currentId) => (currentId === assigneeOption.id ? null : currentId))}
                    className="relative flex w-full items-start gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-[var(--chip-bg-soft)]"
                  >
                    <span className={`flex h-4 w-4 items-center justify-center rounded border ${isChecked ? 'border-primary-600 bg-primary-600 text-white' : 'theme-border theme-text-muted'}`}>
                      {isChecked && <Check className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block truncate theme-text">{assigneeOption.name}</span>
                      {hoveredAssigneeId === assigneeOption.id && assigneeOption.email && (
                        <span className="mt-1 block truncate text-xs theme-text-muted">
                          {assigneeOption.email}
                        </span>
                      )}
                    </span>
                    {hoveredAssigneeId === assigneeOption.id && assigneeOption.email && (
                      <span className="sr-only">{assigneeOption.email}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
