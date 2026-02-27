import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FiCalendar, FiMoreHorizontal, FiMessageSquare, FiTrash2 } from 'react-icons/fi';
import { Task, PRIORITY_CONFIG } from '../../types/taskTypes';
import { useDeleteTask } from '../../hooks';
import TaskDetailModal from './TaskDetailModal';

interface TaskCardProps {
    task: Task;
    overlay?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, overlay = false }) => {
    const deleteTask = useDeleteTask();
    const [showMenu, setShowMenu] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: { type: 'task', task },
    });

    const style = { transform: CSS.Transform.toString(transform), transition };

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

    const handleDelete = () => {
        deleteTask.mutate({ id: task.id, columnId: task.columnId });
        setShowMenu(false);
        setConfirmDelete(false);
    };

    const priorityConfig = PRIORITY_CONFIG[task.priority];

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-slate-800/50 border-2 border-dashed border-violet-500/50 rounded-lg p-3 min-h-[80px] opacity-40"
            />
        );
    }

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className={`bg-slate-800 border border-slate-700/50 rounded-lg p-3 group transition-all hover:border-slate-600 hover:shadow-lg hover:shadow-slate-900/50 ${overlay ? 'shadow-2xl shadow-violet-500/20 rotate-3' : ''}`}
            >
                {/* Priority + menu row */}
                <div className="flex items-center justify-between mb-2">
                    <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: priorityConfig.bgColor, color: priorityConfig.color }}
                    >
                        {priorityConfig.label}
                    </span>

                    <div className="relative" ref={menuRef}>
                        <button
                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-700 rounded transition-all"
                            onClick={e => { e.stopPropagation(); setShowMenu(p => !p); setConfirmDelete(false); }}
                            onPointerDown={e => e.stopPropagation()}
                        >
                            <FiMoreHorizontal className="w-4 h-4 text-slate-400" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                                {!confirmDelete ? (
                                    <button
                                        onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
                                        onPointerDown={e => e.stopPropagation()}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                    >
                                        <FiTrash2 className="w-3.5 h-3.5" />
                                        Xóa task
                                    </button>
                                ) : (
                                    <div className="p-3">
                                        <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                                            Xác nhận xóa <span className="text-white font-medium">"{task.title}"</span>?
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={e => { e.stopPropagation(); handleDelete(); }}
                                                onPointerDown={e => e.stopPropagation()}
                                                disabled={deleteTask.isPending}
                                                className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs rounded transition-colors"
                                            >
                                                {deleteTask.isPending ? 'Đang xóa...' : 'Xóa'}
                                            </button>
                                            <button
                                                onClick={e => { e.stopPropagation(); setConfirmDelete(false); setShowMenu(false); }}
                                                onPointerDown={e => e.stopPropagation()}
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

                {/* Draggable + clickable content */}
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing"
                    onClick={() => setShowDetail(true)}
                >
                    <h4 className="text-sm font-medium text-slate-200 mb-2 line-clamp-2 hover:text-violet-300 transition-colors">
                        {task.title}
                    </h4>

                    {task.description && (
                        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
                    )}

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {task.tags.slice(0, 3).map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs rounded">
                                    {tag}
                                </span>
                            ))}
                            {task.tags.length > 3 && (
                                <span className="text-xs text-slate-500">+{task.tags.length - 3}</span>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                        <div className="flex items-center gap-3">
                            {task.dueDate && (
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <FiCalendar className="w-3 h-3" />
                                    <span>{new Date(task.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short' })}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                <FiMessageSquare className="w-3 h-3" />
                                <span>0</span>
                            </div>
                        </div>

                        {task.assignee ? (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center" title={task.assignee}>
                                <span className="text-xs text-white font-medium">{task.assignee.charAt(0).toUpperCase()}</span>
                            </div>
                        ) : (
                            <div className="w-6 h-6 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs text-slate-500">+</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Task Detail Modal */}
            {showDetail && (
                <TaskDetailModal task={task} onClose={() => setShowDetail(false)} />
            )}
        </>
    );
};

export default TaskCard;
