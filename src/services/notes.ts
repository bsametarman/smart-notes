import { supabase } from '@/lib/supabase';
import { Note, CreateNoteInput, UpdateNoteInput } from '@/types/notes';

export const notesService = {
    async getAllNotes(): Promise<Note[]> {
        // First, get the current session
        const { data: { session } } = await supabase.auth.getSession();

        // If no session, try to refresh it
        if (!session) {
            const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
            if (!refreshedSession) {
                throw new Error('User not authenticated');
            }
        }

        // Get the current user
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
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
            if (!refreshedSession) {
                throw new Error('User not authenticated');
            }
        }

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

    async updateNote(input: UpdateNoteInput & { ai_summary?: string }): Promise<Note> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
            if (!refreshedSession) {
                throw new Error('User not authenticated');
            }
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const updateData: any = {
            title: input.title,
            content: input.content,
            categories: input.categories
        };

        if (input.ai_summary !== undefined) {
            updateData.ai_summary = input.ai_summary;
            updateData.last_analyzed = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('notes')
            .update(updateData)
            .eq('id', input.id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteNote(id: string): Promise<void> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
            if (!refreshedSession) {
                throw new Error('User not authenticated');
            }
        }

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