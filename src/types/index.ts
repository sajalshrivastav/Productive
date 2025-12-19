export interface User {
    _id: string;
    name: string;
    email: string;
    token?: string;
    isAdmin?: boolean;
}

export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
    _id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority?: Priority;
    project?: string; // Project ID
    assignee?: string; // User ID
    dueDate?: string;
    createdAt: string;
    updatedAt?: string;
}

export type ProjectStatus = 'active' | 'completed' | 'archived';

export interface Project {
    _id: string;
    name: string;
    description?: string;
    color: string;
    status: ProjectStatus;
    priority?: Priority;
    deadline?: string;
    user?: string; // User ID
    createdAt: string;
    updatedAt?: string;
}

export interface FocusSession {
    _id: string;
    duration: number; // in minutes
    project?: string;
    task?: string;
    notes?: string;
    completedAt: string;
}
