import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FiPlus, FiMoreHorizontal, FiLoader, FiEdit2, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import { Column } from '../../types/taskTypes';
import TaskCard from './TaskCard';
import { useTasks, useCreateTask, useUpdateColumn, useDeleteColumn } from '../../hooks';
import { FilterState } from './KanbanBoard';

interface KanbanColumnProps {
    column: Column;
    searchQuery?: string;
    filters?: FilterState;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, searchQuery = '', filters }) => {
    const { data: allTasks = [], isLoading } = useTasks(column.id);
    const createTask = useCreateTask();
    const updateColumn = useUpdateColumn();
    const deleteColumn = useDeleteColumn();

    const [showNewTaskInput, setShowNewTaskInput] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // Column menu
    const [showMenu, setShowMenu] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Rename state
    const [isRenaming, setIsRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState(column.name);
    const renameInputRef = useRef<HTMLInputElement>(null);

    // Close menu on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
                setConfirmDelete(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Focus input when renaming starts
    useEffect(() => {
        if (isRenaming) {
            setTimeout(() => renameInputRef.current?.focus(), 50);
        }
    }, [isRenaming]);

    const handleRenameStart = () => {
        setRenameValue(column.name);
        setIsRenaming(true);
        setShowMenu(false);
        setConfirmDelete(false);
    };

    const handleRenameConfirm = () => {
        if (renameValue.trim() && renameValue.trim() !== column.name) {
            updateColumn.mutate({ id: column.id, spaceId: column.spaceId, name: renameValue.trim() });
        }
        setIsRenaming(false);
    };

    const handleRenameCancel = () => {
        setRenameValue(column.name);
        setIsRenaming(false);
    };

    const handleDeleteColumn = () => {
        deleteColumn.mutate({ id: column.id, spaceId: column.spaceId });
        setShowMenu(false);
        setConfirmDelete(false);
    };

    const tasks = useMemo(() => {
        let result = [...allTasks].sort((a, b) => a.order - b.order);

        // Search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.title.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q)
            );
        }

        // Priority filter
        if (filters?.priority && filters.priority.length > 0) {
            result = result.filter(t => filters.priority.includes(t.priority));
        }

        // Due date filter
        if (filters?.hasDueDate === true) {
            result = result.filter(t => !!t.dueDate);
        } else if (filters?.hasDueDate === false) {
            result = result.filter(t => !t.dueDate);
        }

        return result;
    }, [allTasks, searchQuery, filters]);

    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
        data: { type: 'column', column },
    });

    const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);

    const handleCreateTask = () => {
        if (newTaskTitle.trim()) {
            createTask.mutate({ columnId: column.id, title: newTaskTitle.trim() });
            setNewTaskTitle('');
            setShowNewTaskInput(false);
        }
    };

    return (
        <div className="flex-shrink-0 w-72 bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col max-h-full">
            {/* Column Header */}
            <div className="p-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                    {/* Title / Rename input */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: column.color }} />
                        {isRenaming ? (
                            <div className="flex items-center gap-1 flex-1">
                                <input
                                    ref={renameInputRef}
                                    value={renameValue}
                                    onChange={e => setRenameValue(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleRenameConfirm();
                                        if (e.key === 'Escape') handleRenameCancel();
                                    }}
                                    className="flex-1 bg-slate-700 border border-violet-500/50 rounded px-2 py-0.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500 min-w-0"
                                />
                                <button onClick={handleRenameConfirm} className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors">
                                    <FiCheck className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={handleRenameCancel} className="p-1 text-slate-400 hover:text-white transition-colors">
                                    <FiX className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <h3 className="text-sm font-semibold text-slate-200 truncate">{column.name}</h3>
                                <span className="px-2 py-0.5 bg-slate-800 rounded-full text-xs text-slate-400 font-medium flex-shrink-0">
                                    {isLoading ? '…' : tasks.length}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Action buttons */}
                    {!isRenaming && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                                onClick={() => setShowNewTaskInput(true)}
                                className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                            >
                                <FiPlus className="w-4 h-4" />
                            </button>

                            {/* More menu */}
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setShowMenu(p => !p)}
                                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                                >
                                    <FiMoreHorizontal className="w-4 h-4" />
                                </button>

                                {showMenu && (
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                                        {!confirmDelete ? (
                                            <>
                                                <button
                                                    onClick={handleRenameStart}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                                                >
                                                    <FiEdit2 className="w-3.5 h-3.5 text-slate-400" />
                                                    Đổi tên cột
                                                </button>
                                                <div className="h-px bg-slate-700 mx-2" />
                                                <button
                                                    onClick={() => setConfirmDelete(true)}
                                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                                >
                                                    <FiTrash2 className="w-3.5 h-3.5" />
                                                    Xóa cột
                                                </button>
                                            </>
                                        ) : (
                                            <div className="p-3">
                                                <p className="text-xs text-slate-300 mb-1 font-medium">Xóa cột "{column.name}"?</p>
                                                <p className="text-xs text-slate-500 mb-3">Tất cả task trong cột sẽ bị xóa vĩnh viễn.</p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={handleDeleteColumn}
                                                        disabled={deleteColumn.isPending}
                                                        className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs rounded transition-colors"
                                                    >
                                                        {deleteColumn.isPending ? 'Đang xóa...' : 'Xóa'}
                                                    </button>
                                                    <button
                                                        onClick={() => { setConfirmDelete(false); setShowMenu(false); }}
                                                        className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded transition-colors"
                                                    >
                                                        Hủy
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tasks Container */}
            <div
                ref={setNodeRef}
                className={`flex-1 p-2 overflow-y-auto custom-scrollbar space-y-2 transition-colors ${isOver ? 'bg-violet-500/10' : ''}`}
            >
                {isLoading ? (
                    <div className="flex justify-center py-4">
                        <FiLoader className="w-5 h-5 text-violet-400 animate-spin" />
                    </div>
                ) : (
                    <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                        {tasks.map(task => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                    </SortableContext>
                )}

                {/* New Task Input */}
                {showNewTaskInput && (
                    <div className="bg-slate-800 rounded-lg p-3 border border-violet-500/50">
                        <textarea
                            value={newTaskTitle}
                            onChange={e => setNewTaskTitle(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleCreateTask(); }
                                if (e.key === 'Escape') { setShowNewTaskInput(false); setNewTaskTitle(''); }
                            }}
                            placeholder="Enter task title..."
                            className="w-full bg-transparent text-sm text-white placeholder-slate-500 resize-none focus:outline-none"
                            rows={2}
                            autoFocus
                        />
                        <div className="flex items-center justify-end gap-2 mt-2">
                            <button
                                onClick={() => { setShowNewTaskInput(false); setNewTaskTitle(''); }}
                                className="px-3 py-1 text-xs text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateTask}
                                disabled={!newTaskTitle.trim()}
                                className="px-3 py-1 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs rounded transition-colors"
                            >
                                Add Task
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add Task Button */}
            {!showNewTaskInput && (
                <div className="p-2 border-t border-slate-800">
                    <button
                        onClick={() => setShowNewTaskInput(true)}
                        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
                    >
                        <FiPlus className="w-4 h-4" />
                        <span>Add Task</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default KanbanColumn;
