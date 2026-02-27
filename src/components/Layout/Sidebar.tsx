import React, { useState, useEffect } from 'react';
import { FiPlus, FiChevronDown, FiChevronRight, FiMoreHorizontal, FiFolder, FiHome, FiLoader } from 'react-icons/fi';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { setActiveWorkspace, setActiveSpace } from '../../store/slices/workspaceSlice';
import { useWorkspaces, useCreateWorkspace, useSpaces, useCreateSpace } from '../../hooks';

const WorkspaceSpaces: React.FC<{
    workspaceId: string;
    activeSpaceId: string | null;
    onSpaceClick: (spaceId: string) => void;
    showInput: boolean;
    onHideInput: () => void;
}> = ({ workspaceId, activeSpaceId, onSpaceClick, showInput, onHideInput }) => {
    const { data: spaces = [], isLoading } = useSpaces(workspaceId);
    const createSpace = useCreateSpace();
    const [newSpaceName, setNewSpaceName] = useState('');

    // Auto-select first space if none active
    useEffect(() => {
        if (spaces.length > 0 && !activeSpaceId) {
            onSpaceClick(spaces[0].id);
        }
    }, [spaces, activeSpaceId, onSpaceClick]);

    const handleCreate = () => {
        if (newSpaceName.trim()) {
            createSpace.mutate({ workspaceId, name: newSpaceName.trim() });
            setNewSpaceName('');
            onHideInput();
        }
    };

    return (
        <div className="ml-4 mt-1">
            {showInput && (
                <div className="px-3 py-1">
                    <input
                        type="text"
                        value={newSpaceName}
                        onChange={e => setNewSpaceName(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleCreate();
                            if (e.key === 'Escape') { onHideInput(); setNewSpaceName(''); }
                        }}
                        onBlur={() => { if (!newSpaceName.trim()) onHideInput(); }}
                        placeholder="Space name..."
                        className="w-full px-2 py-1 bg-slate-800 border border-violet-500/50 rounded text-sm text-white placeholder-slate-500 focus:outline-none"
                        autoFocus
                    />
                </div>
            )}
            {isLoading ? (
                <div className="flex justify-center py-2">
                    <FiLoader className="w-4 h-4 text-violet-400 animate-spin" />
                </div>
            ) : (
                spaces.map(space => {
                    const isSpaceActive = activeSpaceId === space.id;
                    return (
                        <div
                            key={space.id}
                            className={`flex items-center gap-2 px-3 py-1.5 mx-2 rounded-lg cursor-pointer transition-all group ${
                                isSpaceActive ? 'bg-violet-600/20 text-violet-300' : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                            }`}
                            onClick={() => onSpaceClick(space.id)}
                        >
                            <FiFolder className="w-4 h-4" style={{ color: space.color }} />
                            <span className="flex-1 text-sm truncate">{space.name}</span>
                            <span className="text-xs">{space.icon}</span>
                        </div>
                    );
                })
            )}
        </div>
    );
};

const Sidebar: React.FC = () => {
    const dispatch = useAppDispatch();
    const { activeWorkspaceId, activeSpaceId } = useAppSelector(state => state.workspace);

    const { data: workspaces = [], isLoading: workspacesLoading } = useWorkspaces();
    const createWorkspace = useCreateWorkspace();

    const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());
    const [showNewWorkspaceInput, setShowNewWorkspaceInput] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [showNewSpaceInput, setShowNewSpaceInput] = useState<string | null>(null);

    // Auto-expand all workspaces on load, set first active
    useEffect(() => {
        if (workspaces.length > 0 && !activeWorkspaceId) {
            dispatch(setActiveWorkspace(workspaces[0].id));
            setExpandedWorkspaces(new Set([workspaces[0].id]));
        } else if (workspaces.length > 0) {
            setExpandedWorkspaces(prev => new Set([...prev, ...workspaces.map(w => w.id)]));
        }
    }, [workspaces, activeWorkspaceId, dispatch]);

    const toggleWorkspace = (id: string) => {
        setExpandedWorkspaces(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleWorkspaceClick = (id: string) => {
        dispatch(setActiveWorkspace(id));
        if (!expandedWorkspaces.has(id)) toggleWorkspace(id);
    };

    const handleSpaceClick = (spaceId: string) => {
        dispatch(setActiveSpace(spaceId));
    };

    const handleCreateWorkspace = () => {
        if (newWorkspaceName.trim()) {
            createWorkspace.mutate({ name: newWorkspaceName.trim() });
            setNewWorkspaceName('');
            setShowNewWorkspaceInput(false);
        }
    };

    return (
        <aside className="w-64 bg-slate-900 border-r border-slate-800 fixed left-0 top-14 bottom-0 flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-300">
                        <FiHome className="w-4 h-4" />
                        <span className="text-sm font-medium">Workspaces</span>
                    </div>
                    <button
                        onClick={() => setShowNewWorkspaceInput(true)}
                        className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors"
                        title="Create Workspace"
                    >
                        <FiPlus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
                {showNewWorkspaceInput && (
                    <div className="px-3 py-2">
                        <input
                            type="text"
                            value={newWorkspaceName}
                            onChange={e => setNewWorkspaceName(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleCreateWorkspace();
                                if (e.key === 'Escape') { setShowNewWorkspaceInput(false); setNewWorkspaceName(''); }
                            }}
                            onBlur={() => { if (!newWorkspaceName.trim()) setShowNewWorkspaceInput(false); }}
                            placeholder="Workspace name..."
                            className="w-full px-2 py-1.5 bg-slate-800 border border-violet-500/50 rounded text-sm text-white placeholder-slate-500 focus:outline-none"
                            autoFocus
                        />
                    </div>
                )}

                {workspacesLoading ? (
                    <div className="flex justify-center py-6">
                        <FiLoader className="w-5 h-5 text-violet-400 animate-spin" />
                    </div>
                ) : (
                    workspaces.map(workspace => {
                        const isExpanded = expandedWorkspaces.has(workspace.id);
                        const isActive = activeWorkspaceId === workspace.id;

                        return (
                            <div key={workspace.id} className="mb-1">
                                <div
                                    className={`flex items-center gap-2 px-3 py-2 mx-2 rounded-lg cursor-pointer transition-all group ${
                                        isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                    }`}
                                    onClick={() => handleWorkspaceClick(workspace.id)}
                                >
                                    <button
                                        onClick={e => { e.stopPropagation(); toggleWorkspace(workspace.id); }}
                                        className="p-0.5 hover:bg-slate-700 rounded transition-colors"
                                    >
                                        {isExpanded
                                            ? <FiChevronDown className="w-3.5 h-3.5" />
                                            : <FiChevronRight className="w-3.5 h-3.5" />}
                                    </button>
                                    <span className="text-lg">{workspace.icon}</span>
                                    <span className="flex-1 text-sm font-medium truncate">{workspace.name}</span>
                                    <button
                                        onClick={e => { e.stopPropagation(); setShowNewSpaceInput(workspace.id); }}
                                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-700 rounded transition-all"
                                        title="Add Space"
                                    >
                                        <FiPlus className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={e => e.stopPropagation()}
                                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-700 rounded transition-all"
                                    >
                                        <FiMoreHorizontal className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {isExpanded && (
                                    <WorkspaceSpaces
                                        workspaceId={workspace.id}
                                        activeSpaceId={activeSpaceId}
                                        onSpaceClick={handleSpaceClick}
                                        showInput={showNewSpaceInput === workspace.id}
                                        onHideInput={() => setShowNewSpaceInput(null)}
                                    />
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <div className="p-3 border-t border-slate-800">
                <div className="flex items-center gap-3 text-slate-500 text-xs">
                    <span>© 2026 TaskMaster</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
