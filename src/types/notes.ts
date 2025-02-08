export interface Note {
    id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
    user_id: string;
    categories: string[];
    ai_summary?: string;
    last_analyzed?: string;
}

export interface CreateNoteInput {
    title: string;
    content: string;
    categories: string[];
}

export interface UpdateNoteInput extends CreateNoteInput {
    id: string;
}

export interface Category {
    id: string;
    name: string;
    color: string;
    user_id: string;
}

export interface CreateCategoryInput {
    name: string;
    color: string;
}

// Predefined categories with their colors
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'user_id'>[] = [
    { name: 'Work', color: '#FF5733' },
    { name: 'Personal', color: '#33FF57' },
    { name: 'Study', color: '#3357FF' },
    { name: 'Important', color: '#FF33F5' },
    { name: 'Ideas', color: '#33FFF5' },
]; 