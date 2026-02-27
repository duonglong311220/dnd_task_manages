import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Column, Task, TaskState, CreateTaskData, MoveTaskData, DEFAULT_COLUMNS } from '../../types/taskTypes';

// Helper để tạo ID unique
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Sample columns for space sp-1
const initialColumns: Column[] = [
    { id: 'col-1', spaceId: 'sp-1', name: 'To Do', color: '#6b7280', order: 0 },
    { id: 'col-2', spaceId: 'sp-1', name: 'In Progress', color: '#3b82f6', order: 1 },
    { id: 'col-3', spaceId: 'sp-1', name: 'Review', color: '#f59e0b', order: 2 },
    { id: 'col-4', spaceId: 'sp-1', name: 'Done', color: '#10b981', order: 3 },
];

// Sample tasks
const initialTasks: Task[] = [
    {
        id: 'task-1',
        columnId: 'col-1',
        title: 'Research Kanban libraries',
        description: 'Compare dnd-kit with react-beautiful-dnd',
        priority: 'high',
        order: 0,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'task-2',
        columnId: 'col-1',
        title: 'Design UI mockups',
        description: 'Create Figma designs for the task board',
        priority: 'medium',
        dueDate: '2026-02-01',
        order: 1,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'task-3',
        columnId: 'col-2',
        title: 'Implement drag and drop',
        description: 'Setup dnd-kit context and sortable components',
        priority: 'urgent',
        order: 0,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'task-4',
        columnId: 'col-3',
        title: 'Review PR #42',
        description: 'Check authentication flow implementation',
        priority: 'low',
        order: 0,
        createdAt: new Date().toISOString(),
    },
    {
        id: 'task-5',
        columnId: 'col-4',
        title: 'Setup project structure',
        description: 'Initialize React + TypeScript + Tailwind project',
        priority: 'medium',
        order: 0,
        createdAt: new Date().toISOString(),
    },
];

const initialState: TaskState = {
    columns: initialColumns,
    tasks: initialTasks,
    loading: false,
    error: null,
};

const taskSlice = createSlice({
    name: 'task',
    initialState,
    reducers: {
        // Column actions
        addColumn: (state, action: PayloadAction<{ spaceId: string; name: string; color: string }>) => {
            const maxOrder = Math.max(...state.columns.filter(c => c.spaceId === action.payload.spaceId).map(c => c.order), -1);
            const newColumn: Column = {
                id: generateId(),
                spaceId: action.payload.spaceId,
                name: action.payload.name,
                color: action.payload.color,
                order: maxOrder + 1,
            };
            state.columns.push(newColumn);
        },

        updateColumn: (state, action: PayloadAction<{ id: string; data: Partial<Column> }>) => {
            const index = state.columns.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.columns[index] = { ...state.columns[index], ...action.payload.data };
            }
        },

        deleteColumn: (state, action: PayloadAction<string>) => {
            state.columns = state.columns.filter(c => c.id !== action.payload);
            state.tasks = state.tasks.filter(t => t.columnId !== action.payload);
        },

        // Initialize columns for a new space
        initializeColumnsForSpace: (state, action: PayloadAction<string>) => {
            const spaceId = action.payload;
            const newColumns = DEFAULT_COLUMNS.map((col, index) => ({
                id: generateId(),
                spaceId,
                ...col,
                order: index,
            }));
            state.columns.push(...newColumns);
        },

        // Task actions
        addTask: (state, action: PayloadAction<CreateTaskData>) => {
            const columnTasks = state.tasks.filter(t => t.columnId === action.payload.columnId);
            const maxOrder = Math.max(...columnTasks.map(t => t.order), -1);

            const newTask: Task = {
                id: generateId(),
                columnId: action.payload.columnId,
                title: action.payload.title,
                description: action.payload.description || '',
                priority: action.payload.priority || 'medium',
                dueDate: action.payload.dueDate,
                order: maxOrder + 1,
                createdAt: new Date().toISOString(),
            };
            state.tasks.push(newTask);
        },

        updateTask: (state, action: PayloadAction<{ id: string; data: Partial<Task> }>) => {
            const index = state.tasks.findIndex(t => t.id === action.payload.id);
            if (index !== -1) {
                state.tasks[index] = { ...state.tasks[index], ...action.payload.data };
            }
        },

        deleteTask: (state, action: PayloadAction<string>) => {
            state.tasks = state.tasks.filter(t => t.id !== action.payload);
        },

        moveTask: (state, action: PayloadAction<MoveTaskData>) => {
            const { taskId, destinationColumnId, newOrder } = action.payload;
            const taskIndex = state.tasks.findIndex(t => t.id === taskId);

            if (taskIndex !== -1) {
                // Update task's column and order
                state.tasks[taskIndex].columnId = destinationColumnId;
                state.tasks[taskIndex].order = newOrder;

                // Reorder other tasks in destination column
                state.tasks
                    .filter(t => t.columnId === destinationColumnId && t.id !== taskId)
                    .forEach(t => {
                        if (t.order >= newOrder) {
                            t.order += 1;
                        }
                    });
            }
        },

        reorderTasks: (state, action: PayloadAction<{ columnId: string; taskIds: string[] }>) => {
            const { columnId, taskIds } = action.payload;
            taskIds.forEach((taskId, index) => {
                const task = state.tasks.find(t => t.id === taskId);
                if (task && task.columnId === columnId) {
                    task.order = index;
                }
            });
        },
    },
});

export const {
    addColumn,
    updateColumn,
    deleteColumn,
    initializeColumnsForSpace,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
} = taskSlice.actions;

export default taskSlice.reducer;
