export interface Note {
    id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
    user_id: string;
}

export interface CreateNoteInput {
    title: string;
    content: string;
}

export interface UpdateNoteInput extends CreateNoteInput {
    id: string;
} 