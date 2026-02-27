import React, { useState, useRef, useEffect } from 'react';
import {
    FiX, FiEdit2, FiCheck, FiClock, FiCalendar, FiTag, FiMessageSquare,
    FiUser, FiFlag, FiSend, FiPlus, FiAlignLeft,
} from 'react-icons/fi';
import { Task, PRIORITY_CONFIG } from '../../types/taskTypes';
import { useUpdateTask } from '../../hooks';
import { useAppSelector } from '../../store/hooks';

interface TaskDetailModalProps {
    task: Task;
    onClose: () => void;
}

interface Comment {
    id: string;
    author: string;
    text: string;
    createdAt: string;
}

const PRIORITY_OPTIONS = [
    { value: 'low', label: 'Low', color: '#6b7280', bg: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
    { value: 'medium', label: 'Medium', color: '#3b82f6', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    { value: 'high', label: 'High', color: '#f59e0b', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { value: 'urgent', label: 'Urgent', color: '#ef4444', bg: 'bg-red-500/20 text-red-300 border-red-500/30' },
] as const;

const PRESET_TAGS = ['Bug', 'Feature', 'Design', 'Backend', 'Frontend', 'Docs', 'Testing', 'Refactor'];

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, onClose }) => {
    const updateTask = useUpdateTask();
    const { user } = useAppSelector(state => state.auth);

    // Local editable state (sync với task prop)
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [priority, setPriority] = useState(task.priority);
    const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
    const [tags, setTags] = useState<string[]>(task.tags || []);
    const [estimateHours, setEstimateHours] = useState('');
    const [assignee, setAssignee] = useState(task.assignee || '');

    // UI state
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [showTagInput, setShowTagInput] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [isDirty, setIsDirty] = useState(false);

    const titleInputRef = useRef<HTMLInputElement>(null);
    const descInputRef = useRef<HTMLTextAreaElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Mark dirty on changes
    useEffect(() => {
        if (
            title !== task.title ||
            description !== (task.description || '') ||
            priority !== task.priority ||
            dueDate !== (task.dueDate ? task.dueDate.split('T')[0] : '') ||
            JSON.stringify(tags) !== JSON.stringify(task.tags || []) ||
            assignee !== (task.assignee || '')
        ) {
            setIsDirty(true);
        }
    }, [title, description, priority, dueDate, tags, assignee, task]);

    // ESC to close
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isDirty]);

    const handleClose = () => {
        if (isDirty) handleSave();
        onClose();
    };

    const handleSave = () => {
        updateTask.mutate({
            id: task.id,
            columnId: task.columnId,
            title: title.trim() || task.title,
            description,
            priority,
            dueDate: dueDate || null,
            tags,
        });
        setIsDirty(false);
    };

    const handleAddTag = (tag: string) => {
        const trimmed = tag.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags(prev => [...prev, trimmed]);
        }
        setNewTag('');
        setShowTagInput(false);
    };

    const handleRemoveTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

    const handleAddComment = () => {
        if (!commentText.trim()) return;
        const newComment: Comment = {
            id: Date.now().toString(),
            author: user?.name || 'You',
            text: commentText.trim(),
            createdAt: new Date().toISOString(),
        };
        setComments(prev => [...prev, newComment]);
        setCommentText('');
    };

    const priorityConfig = PRIORITY_CONFIG[priority];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal */}
            <div
                ref={modalRef}
                className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Priority badge */}
                        <span
                            className="px-2.5 py-1 rounded-md text-xs font-semibold flex-shrink-0 border"
                            style={{ backgroundColor: `${priorityConfig.bgColor}22`, color: priorityConfig.color, borderColor: `${priorityConfig.color}44` }}
                        >
                            <FiFlag className="inline w-3 h-3 mr-1" />
                            {priorityConfig.label}
                        </span>

                        {/* Title */}
                        {isEditingTitle ? (
                            <input
                                ref={titleInputRef}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                onBlur={() => setIsEditingTitle(false)}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === 'Escape') setIsEditingTitle(false); }}
                                className="flex-1 bg-slate-800 border border-violet-500/50 rounded-lg px-3 py-1.5 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500/30 min-w-0"
                                autoFocus
                            />
                        ) : (
                            <h2
                                onClick={() => { setIsEditingTitle(true); setTimeout(() => titleInputRef.current?.focus(), 50); }}
                                className="text-white font-semibold text-base truncate cursor-text hover:text-violet-300 transition-colors flex-1"
                                title="Click để đổi tên"
                            >
                                {title}
                                <FiEdit2 className="inline w-3.5 h-3.5 ml-2 text-slate-500 opacity-0 group-hover:opacity-100" />
                            </h2>
                        )}
                    </div>

                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                        {isDirty && (
                            <button
                                onClick={handleSave}
                                disabled={updateTask.isPending}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs rounded-lg transition-colors"
                            >
                                <FiCheck className="w-3.5 h-3.5" />
                                {updateTask.isPending ? 'Saving...' : 'Save'}
                            </button>
                        )}
                        <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Body — scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex gap-0 h-full">
                        {/* Left — main content */}
                        <div className="flex-1 px-6 py-4 space-y-5 min-w-0">

                            {/* Description */}
                            <div>
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                    <FiAlignLeft className="w-3.5 h-3.5" />
                                    Mô tả
                                </div>
                                {isEditingDesc ? (
                                    <textarea
                                        ref={descInputRef}
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        onBlur={() => setIsEditingDesc(false)}
                                        placeholder="Thêm mô tả..."
                                        rows={4}
                                        className="w-full bg-slate-800 border border-violet-500/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                                        autoFocus
                                    />
                                ) : (
                                    <div
                                        onClick={() => setIsEditingDesc(true)}
                                        className="min-h-[60px] px-3 py-2 bg-slate-800/50 hover:bg-slate-800 border border-transparent hover:border-slate-700 rounded-lg text-sm text-slate-400 cursor-text transition-all"
                                    >
                                        {description || <span className="italic text-slate-600">Click để thêm mô tả...</span>}
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            <div>
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                    <FiTag className="w-3.5 h-3.5" />
                                    Tags
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs rounded-full">
                                            {tag}
                                            <button onClick={() => handleRemoveTag(tag)} className="hover:text-white transition-colors">
                                                <FiX className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}

                                    {showTagInput ? (
                                        <div className="flex items-center gap-1">
                                            <input
                                                value={newTag}
                                                onChange={e => setNewTag(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') handleAddTag(newTag);
                                                    if (e.key === 'Escape') { setShowTagInput(false); setNewTag(''); }
                                                }}
                                                placeholder="Tag mới..."
                                                className="w-24 px-2 py-1 bg-slate-800 border border-violet-500/50 rounded-full text-xs text-white focus:outline-none"
                                                autoFocus
                                            />
                                            <button onClick={() => handleAddTag(newTag)} className="p-1 text-emerald-400 hover:text-emerald-300">
                                                <FiCheck className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setShowTagInput(true)}
                                            className="flex items-center gap-1 px-2.5 py-1 border border-dashed border-slate-600 hover:border-slate-500 text-slate-500 hover:text-slate-300 text-xs rounded-full transition-colors"
                                        >
                                            <FiPlus className="w-3 h-3" />
                                            Add tag
                                        </button>
                                    )}
                                </div>

                                {/* Preset tags */}
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {PRESET_TAGS.filter(t => !tags.includes(t)).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => handleAddTag(t)}
                                            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-500 hover:text-slate-300 text-xs rounded-full transition-colors"
                                        >
                                            + {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comments */}
                            <div>
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
                                    <FiMessageSquare className="w-3.5 h-3.5" />
                                    Comments ({comments.length})
                                </div>

                                {/* Comment list */}
                                <div className="space-y-3 mb-4">
                                    {comments.length === 0 && (
                                        <p className="text-xs text-slate-600 italic">Chưa có comment nào...</p>
                                    )}
                                    {comments.map(c => (
                                        <div key={c.id} className="flex gap-3">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 flex items-center justify-center flex-shrink-0 text-xs text-white font-semibold">
                                                {c.author.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-xs font-medium text-slate-300">{c.author}</span>
                                                    <span className="text-xs text-slate-600">
                                                        {new Date(c.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-300 bg-slate-800 rounded-xl rounded-tl-none px-3 py-2">{c.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Comment input */}
                                <div className="flex gap-3">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center flex-shrink-0 text-xs text-white font-semibold">
                                        {(user?.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 relative">
                                        <textarea
                                            value={commentText}
                                            onChange={e => setCommentText(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                                            placeholder="Viết comment... (Enter để gửi)"
                                            rows={2}
                                            className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-violet-500/50 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-colors pr-10"
                                        />
                                        <button
                                            onClick={handleAddComment}
                                            disabled={!commentText.trim()}
                                            className="absolute right-2.5 bottom-2.5 p-1 text-violet-400 hover:text-violet-300 disabled:text-slate-600 transition-colors"
                                        >
                                            <FiSend className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right sidebar — metadata */}
                        <div className="w-56 flex-shrink-0 border-l border-slate-800 px-4 py-4 space-y-5 bg-slate-900/50">

                            {/* Priority */}
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Độ ưu tiên</p>
                                <div className="space-y-1">
                                    {PRIORITY_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setPriority(opt.value)}
                                            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                                priority === opt.value
                                                    ? opt.bg + ' ring-1 ring-current'
                                                    : 'border-transparent text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                                            }`}
                                        >
                                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: opt.color }} />
                                            {opt.label}
                                            {priority === opt.value && <FiCheck className="w-3 h-3 ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Due Date */}
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                    <FiCalendar className="inline w-3.5 h-3.5 mr-1" />
                                    Due Date
                                </p>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={e => setDueDate(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-violet-500/50 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-colors"
                                />
                                {dueDate && (
                                    <button onClick={() => setDueDate('')} className="mt-1 text-xs text-slate-600 hover:text-slate-400 flex items-center gap-1">
                                        <FiX className="w-3 h-3" /> Xóa deadline
                                    </button>
                                )}
                            </div>

                            {/* Estimate */}
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                    <FiClock className="inline w-3.5 h-3.5 mr-1" />
                                    Time Estimate
                                </p>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.5"
                                        value={estimateHours}
                                        onChange={e => setEstimateHours(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-violet-500/50 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500/20 transition-colors pr-10"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">giờ</span>
                                </div>
                                {estimateHours && Number(estimateHours) > 0 && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        ≈ {Number(estimateHours) >= 8 ? `${(Number(estimateHours) / 8).toFixed(1)} ngày` : `${estimateHours} giờ`}
                                    </p>
                                )}
                            </div>

                            {/* Assignee */}
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                    <FiUser className="inline w-3.5 h-3.5 mr-1" />
                                    Assignee
                                </p>
                                <div className="space-y-1.5">
                                    {/* Assign to me */}
                                    <button
                                        onClick={() => setAssignee(user?.name || '')}
                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all border ${
                                            assignee === user?.name
                                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                                : 'border-transparent text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                                        }`}
                                    >
                                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-semibold" style={{ fontSize: '9px' }}>
                                            {(user?.name || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <span className="truncate">{user?.name || 'Me'}</span>
                                        {assignee === user?.name && <FiCheck className="w-3 h-3 ml-auto flex-shrink-0" />}
                                    </button>

                                    {/* Unassign */}
                                    {assignee && (
                                        <button
                                            onClick={() => setAssignee('')}
                                            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-400 hover:bg-slate-800 transition-all"
                                        >
                                            <FiX className="w-3.5 h-3.5" />
                                            Bỏ assign
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Created at */}
                            <div className="pt-2 border-t border-slate-800">
                                <p className="text-xs text-slate-600">
                                    Tạo lúc: {new Date(task.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;
