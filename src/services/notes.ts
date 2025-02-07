import { supabase } from '@/lib/supabase';
import { Note, CreateNoteInput, UpdateNoteInput } from '@/types/notes';

export const notesService = {
    async getAllNotes(): Promise<Note[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('notes')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async createNote(input: CreateNoteInput): Promise<Note> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('notes')
            .insert([{ ...input, user_id: user.id }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateNote(input: UpdateNoteInput): Promise<Note> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('notes')
            .update({ title: input.title, content: input.content })
            .eq('id', input.id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteNote(id: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;
    }
}; 