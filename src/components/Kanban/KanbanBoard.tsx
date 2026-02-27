import React, { useState, useRef, useEffect } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { FiPlus, FiFilter, FiSearch, FiLoader, FiX, FiChevronDown } from 'react-icons/fi';
import { useAppSelector } from '../../store/hooks';
import { useColumns, useMoveTask, useReorderTasks, useCreateColumn } from '../../hooks';
import { Task } from '../../types/taskTypes';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';

export interface FilterState {
    priority: ('low' | 'medium' | 'high' | 'urgent')[];
    hasDueDate: boolean | null; // null = all, true = có deadline, false = không có
}

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low', color: '#6b7280', bg: 'bg-gray-500/20 text-gray-300' },
    { value: 'medium', label: 'Medium', color: '#3b82f6', bg: 'bg-blue-500/20 text-blue-300' },
    { value: 'high', label: 'High', color: '#f59e0b', bg: 'bg-amber-500/20 text-amber-300' },
    { value: 'urgent', label: 'Urgent', color: '#ef4444', bg: 'bg-red-500/20 text-red-300' },
] as const;

const KanbanBoard: React.FC = () => {
    const { activeSpaceId } = useAppSelector(state => state.workspace);

    const { data: columns = [], isLoading: columnsLoading } = useColumns(activeSpaceId || '');
    const moveTask = useMoveTask();
    const reorderTasks = useReorderTasks();
    const createColumn = useCreateColumn();

    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [newColumnName, setNewColumnName] = useState('');
    const [showAddColumn, setShowAddColumn] = useState(false);

    // Filter state
    const [showFilterPanel, setShowFilterPanel] = useState(false);
    const [filters, setFilters] = useState<FilterState>({ priority: [], hasDueDate: null });
    const filterRef = useRef<HTMLDivElement>(null);

    const activeFilterCount = filters.priority.length + (filters.hasDueDate !== null ? 1 : 0);

    // Close filter panel on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
                setShowFilterPanel(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const togglePriority = (p: 'low' | 'medium' | 'high' | 'urgent') => {
        setFilters(prev => ({
            ...prev,
            priority: prev.priority.includes(p)
                ? prev.priority.filter(x => x !== p)
                : [...prev.priority, p],
        }));
    };

    const clearFilters = () => setFilters({ priority: [], hasDueDate: null });

    const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const taskData = event.active.data.current?.task as Task | undefined;
        if (taskData) setActiveTask(taskData);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;
        if (activeId === overId) return;

        const draggedTask = active.data.current?.task as Task | undefined;
        if (!draggedTask) return;

        const overColumn = columns.find(c => c.id === overId);
        const overTask = over.data.current?.task as Task | undefined;

        if (overColumn) {
            if (draggedTask.columnId !== overColumn.id) {
                moveTask.mutate({ id: activeId, sourceColumnId: draggedTask.columnId, destinationColumnId: overColumn.id, order: 0 });
            }
        } else if (overTask) {
            if (draggedTask.columnId !== overTask.columnId) {
                moveTask.mutate({ id: activeId, sourceColumnId: draggedTask.columnId, destinationColumnId: overTask.columnId, order: overTask.order });
            } else {
                const columnId = draggedTask.columnId;
                reorderTasks.mutate({ columnId, tasks: [{ id: activeId, order: overTask.order, columnId }, { id: overTask.id, order: draggedTask.order, columnId }] });
            }
        }
    };

    const handleAddColumn = () => {
        if (!newColumnName.trim() || !activeSpaceId) return;
        createColumn.mutate({ spaceId: activeSpaceId, name: newColumnName.trim() });
        setNewColumnName('');
        setShowAddColumn(false);
    };

    if (!activeSpaceId) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
                        <FiPlus className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-300 mb-2">No Space Selected</h3>
                    <p className="text-sm text-slate-500">Select a space from the sidebar to view tasks</p>
                </div>
            </div>
        );
    }

    if (columnsLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <FiLoader className="w-8 h-8 text-violet-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-slate-950">
            {/* Board Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-white">Board View</h2>
                    {activeFilterCount > 0 && (
                        <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 text-xs rounded-full font-medium">
                            {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm task..."
                            className="pl-9 pr-8 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 w-52 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                            >
                                <FiX className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filter Button + Panel */}
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setShowFilterPanel(p => !p)}
                            className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm transition-colors ${
                                activeFilterCount > 0
                                    ? 'bg-violet-600/20 border-violet-500/50 text-violet-300 hover:bg-violet-600/30'
                                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                            }`}
                        >
                            <FiFilter className="w-4 h-4" />
                            <span>Filter</span>
                            {activeFilterCount > 0 && (
                                <span className="w-4 h-4 bg-violet-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                    {activeFilterCount}
                                </span>
                            )}
                            <FiChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilterPanel ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Filter Dropdown Panel */}
                        {showFilterPanel && (
                            <div className="absolute right-0 top-full mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/40 z-50 overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                                    <span className="text-sm font-medium text-white">Bộ lọc</span>
                                    {activeFilterCount > 0 && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1"
                                        >
                                            <FiX className="w-3 h-3" />
                                            Xóa tất cả
                                        </button>
                                    )}
                                </div>

                                {/* Priority Filter */}
                                <div className="p-4 border-b border-slate-700/50">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Độ ưu tiên</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {PRIORITY_OPTIONS.map(opt => {
                                            const isActive = filters.priority.includes(opt.value);
                                            return (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => togglePriority(opt.value)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                                                        isActive
                                                            ? 'border-current opacity-100 ring-1 ring-current'
                                                            : 'border-slate-700 opacity-60 hover:opacity-100 hover:border-slate-600'
                                                    } ${opt.bg}`}
                                                >
                                                    <span
                                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: opt.color }}
                                                    />
                                                    {opt.label}
                                                    {isActive && <FiX className="w-3 h-3 ml-auto" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Due Date Filter */}
                                <div className="p-4">
                                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Deadline</p>
                                    <div className="flex flex-col gap-1.5">
                                        {[
                                            { value: null, label: 'Tất cả' },
                                            { value: true, label: 'Có deadline' },
                                            { value: false, label: 'Không có deadline' },
                                        ].map(opt => (
                                            <button
                                                key={String(opt.value)}
                                                onClick={() => setFilters(prev => ({ ...prev, hasDueDate: opt.value }))}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                                                    filters.hasDueDate === opt.value
                                                        ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
                                                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border border-transparent'
                                                }`}
                                            >
                                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${filters.hasDueDate === opt.value ? 'bg-violet-400' : 'bg-slate-600'}`} />
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Active filter tags */}
            {activeFilterCount > 0 && (
                <div className="flex items-center gap-2 px-6 py-2 border-b border-slate-800/50 flex-shrink-0 flex-wrap">
                    <span className="text-xs text-slate-500">Đang lọc:</span>
                    {filters.priority.map(p => {
                        const opt = PRIORITY_OPTIONS.find(o => o.value === p)!;
                        return (
                            <span
                                key={p}
                                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${opt.bg}`}
                            >
                                {opt.label}
                                <button onClick={() => togglePriority(p)} className="hover:opacity-70">
                                    <FiX className="w-3 h-3" />
                                </button>
                            </span>
                        );
                    })}
                    {filters.hasDueDate !== null && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/20 text-violet-300">
                            {filters.hasDueDate ? 'Có deadline' : 'Không có deadline'}
                            <button onClick={() => setFilters(p => ({ ...p, hasDueDate: null }))} className="hover:opacity-70">
                                <FiX className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                </div>
            )}

            {/* Kanban Columns */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={() => setActiveTask(null)}
                >
                    <div className="flex gap-4 h-full">
                        {sortedColumns.map(column => (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                searchQuery={searchQuery}
                                filters={filters}
                            />
                        ))}

                        {/* Add Column */}
                        <div className="flex-shrink-0 w-72">
                            {showAddColumn ? (
                                <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 space-y-2">
                                    <input
                                        autoFocus
                                        value={newColumnName}
                                        onChange={e => setNewColumnName(e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') handleAddColumn();
                                            if (e.key === 'Escape') setShowAddColumn(false);
                                        }}
                                        placeholder="Column name..."
                                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-violet-500"
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={handleAddColumn} className="flex-1 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-lg transition-colors">Add</button>
                                        <button onClick={() => setShowAddColumn(false)} className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm rounded-lg transition-colors">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => setShowAddColumn(true)}
                                    className="border-2 border-dashed border-slate-800 rounded-xl h-24 flex items-center justify-center hover:border-slate-700 hover:bg-slate-900/30 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-400">
                                        <FiPlus className="w-5 h-5" />
                                        <span className="text-sm">Add Column</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <DragOverlay>
                        {activeTask && <TaskCard task={activeTask} overlay />}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
};

export default KanbanBoard;
