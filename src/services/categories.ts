import { supabase } from '@/lib/supabase';
import { Category, CreateCategoryInput, DEFAULT_CATEGORIES } from '@/types/notes';

export const categoriesService = {
    async getAllCategories(): Promise<Category[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', user.id)
            .order('name');

        if (error) throw error;
        return data || [];
    },

    async createCategory(input: CreateCategoryInput): Promise<Category> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Check if category with same name already exists
        const { data: existingCategory } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', user.id)
            .ilike('name', input.name)
            .single();

        if (existingCategory) {
            return existingCategory;
        }

        const { data, error } = await supabase
            .from('categories')
            .insert([{ ...input, user_id: user.id }])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteCategory(id: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

        if (error) throw error;
    },

    async initializeDefaultCategories(): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        try {
            // First, check if user already has any categories
            const { data: existingCategories, error: checkError } = await supabase
                .from('categories')
                .select('name')
                .eq('user_id', user.id);

            if (checkError) throw checkError;

            // If user already has categories, don't initialize
            if (existingCategories && existingCategories.length > 0) {
                return;
            }

            // Initialize default categories for new user
            const categoriesToInsert = DEFAULT_CATEGORIES.map(category => ({
                ...category,
                user_id: user.id
            }));

            const { error: insertError } = await supabase
                .from('categories')
                .insert(categoriesToInsert);

            if (insertError) throw insertError;

        } catch (error) {
            console.error('Error initializing default categories:', error);
            throw error;
        }
    },

    async cleanupDuplicateCategories(): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        try {
            // Get all categories for the user
            const { data: categories, error: fetchError } = await supabase
                .from('categories')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at');

            if (fetchError) throw fetchError;
            if (!categories) return;

            // Keep track of unique category names
            const seen = new Map<string, string>(); // name -> id
            const duplicateIds: string[] = [];

            categories.forEach(category => {
                const lowerName = category.name.toLowerCase();
                if (seen.has(lowerName)) {
                    duplicateIds.push(category.id);
                } else {
                    seen.set(lowerName, category.id);
                }
            });

            // Delete duplicate categories
            if (duplicateIds.length > 0) {
                const { error: deleteError } = await supabase
                    .from('categories')
                    .delete()
                    .in('id', duplicateIds);

                if (deleteError) throw deleteError;
            }
        } catch (error) {
            console.error('Error cleaning up duplicate categories:', error);
            throw error;
        }
    }
}; 