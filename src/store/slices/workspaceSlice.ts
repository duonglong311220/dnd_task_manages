import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Workspace, Space, WorkspaceState, CreateWorkspaceData, CreateSpaceData } from '../../types/taskTypes';

// Helper để tạo ID unique
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const initialState: WorkspaceState = {
    workspaces: [],
    spaces: [],
    activeWorkspaceId: null,
    activeSpaceId: null,
    loading: false,
    error: null,
};

const workspaceSlice = createSlice({
    name: 'workspace',
    initialState,
    reducers: {
        addWorkspace: (state, action: PayloadAction<CreateWorkspaceData>) => {
            const newWorkspace: Workspace = {
                id: generateId(),
                name: action.payload.name,
                icon: action.payload.icon || '📁',
                color: action.payload.color || '#3b82f6',
                createdAt: new Date().toISOString(),
            };
            state.workspaces.push(newWorkspace);
            state.activeWorkspaceId = newWorkspace.id;
        },

        updateWorkspace: (state, action: PayloadAction<{ id: string; data: Partial<Workspace> }>) => {
            const index = state.workspaces.findIndex(w => w.id === action.payload.id);
            if (index !== -1) {
                state.workspaces[index] = { ...state.workspaces[index], ...action.payload.data };
            }
        },

        deleteWorkspace: (state, action: PayloadAction<string>) => {
            state.workspaces = state.workspaces.filter(w => w.id !== action.payload);
            state.spaces = state.spaces.filter(s => s.workspaceId !== action.payload);
            if (state.activeWorkspaceId === action.payload) {
                state.activeWorkspaceId = state.workspaces[0]?.id || null;
                state.activeSpaceId = null;
            }
        },

        setActiveWorkspace: (state, action: PayloadAction<string>) => {
            state.activeWorkspaceId = action.payload;
            // Reset activeSpaceId when workspace changes; Sidebar will set it from API data
            state.activeSpaceId = null;
        },

        addSpace: (state, action: PayloadAction<CreateSpaceData>) => {
            const newSpace: Space = {
                id: generateId(),
                workspaceId: action.payload.workspaceId,
                name: action.payload.name,
                icon: action.payload.icon || '📂',
                color: action.payload.color || '#6366f1',
            };
            state.spaces.push(newSpace);
            state.activeSpaceId = newSpace.id;
        },

        updateSpace: (state, action: PayloadAction<{ id: string; data: Partial<Space> }>) => {
            const index = state.spaces.findIndex(s => s.id === action.payload.id);
            if (index !== -1) {
                state.spaces[index] = { ...state.spaces[index], ...action.payload.data };
            }
        },

        deleteSpace: (state, action: PayloadAction<string>) => {
            state.spaces = state.spaces.filter(s => s.id !== action.payload);
            if (state.activeSpaceId === action.payload) {
                const activeWorkspaceSpaces = state.spaces.filter(s => s.workspaceId === state.activeWorkspaceId);
                state.activeSpaceId = activeWorkspaceSpaces[0]?.id || null;
            }
        },

        setActiveSpace: (state, action: PayloadAction<string>) => {
            state.activeSpaceId = action.payload;
        },

        resetWorkspace: (state) => {
            state.activeWorkspaceId = null;
            state.activeSpaceId = null;
        },
    },
});

export const {
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    setActiveWorkspace,
    addSpace,
    updateSpace,
    deleteSpace,
    setActiveSpace,
    resetWorkspace,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
