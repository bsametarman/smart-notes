'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '@/components/Layout';
import CreateNoteModal from '@/components/CreateNoteModal';
import NoteDetails from '@/components/NoteDetails';
import Auth from '@/components/Auth';
import { Note, Category } from '@/types/notes';
import { notesService } from '@/services/notes';
import { categoriesService } from '@/services/categories';
import { useAuth } from '@/contexts/AuthContext';
import CategorySelector from '@/components/CategorySelector';
import { HexColorPicker } from 'react-colorful';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#33FFF5',
    '#FFB533', '#FF3333', '#33FF33', '#3333FF', '#FF33B5'
  ];

  const loadCategories = useCallback(async () => {
    try {
      await categoriesService.cleanupDuplicateCategories();
      const categories = await categoriesService.getAllCategories();
      setCategories(categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  const loadNotes = useCallback(async () => {
    try {
      const notes = await notesService.getAllNotes();
      setNotes(notes);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }, []);

  const initializeDefaultCategories = useCallback(async () => {
    try {
      await categoriesService.initializeDefaultCategories();
      await loadCategories();
    } catch (error) {
      console.error('Failed to initialize categories:', error);
    }
  }, [loadCategories]);

  useEffect(() => {
    if (user) {
      const initializeData = async () => {
        setIsLoading(true);
        try {
          await Promise.all([
            loadNotes(),
            loadCategories(),
            initializeDefaultCategories()
          ]);
        } finally {
          setIsLoading(false);
        }
      };
      initializeData();
    }
  }, [user, loadNotes, loadCategories, initializeDefaultCategories]);

  const handleCreateNote = useCallback(async (input: { title: string; content: string; categories: string[] }) => {
    try {
      await notesService.createNote(input);
      await loadNotes();
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  }, [loadNotes]);

  const handleDeleteNote = useCallback((note: Note) => {
    setNoteToDelete(note);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!noteToDelete) return;
    try {
      await notesService.deleteNote(noteToDelete.id);
      await loadNotes();
      setNoteToDelete(null);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  }, [noteToDelete, loadNotes]);

  const handleViewDetails = useCallback((note: Note) => {
    setSelectedNote(note);
    setIsDetailsModalOpen(true);
  }, []);

  const filteredNotes = useMemo(() =>
    selectedCategories.length > 0
      ? notes.filter(note => note.categories.some(catId => selectedCategories.includes(catId)))
      : notes,
    [notes, selectedCategories]
  );

  const getCategoryById = useCallback((id: string) =>
    categories.find(cat => cat.id === id),
    [categories]
  );

  const handleCreateCategory = async () => {
    try {
      await categoriesService.createCategory({ name: newCategoryName, color: selectedColor });
      await loadCategories();
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">My Notes</h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Note
          </button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <CategorySelector
            selectedCategories={selectedCategories}
            onChange={setSelectedCategories}
            onCategoryChange={loadCategories}
          />
        </div>

        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Category</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category Name</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Enter category name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <span className="text-sm text-gray-600 uppercase">{selectedColor}</span>
                  </div>
                  {showColorPicker && (
                    <div className="absolute mt-2 bg-white p-3 rounded-lg shadow-lg z-50">
                      <HexColorPicker
                        color={selectedColor}
                        onChange={setSelectedColor}
                      />
                    </div>
                  )}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preset Colors</label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setSelectedColor(color);
                            setShowColorPicker(false);
                          }}
                          className={`w-8 h-8 rounded-full ${selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setShowColorPicker(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-10">
              {notes.length === 0 ? "No notes yet. Create your first note!" : "No notes match the selected categories."}
            </p>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow h-[280px] flex flex-col"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{note.title}</h3>
                <p className="text-gray-600 line-clamp-3 mb-4 flex-grow">{note.content}</p>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {note.categories.map(categoryId => {
                      const category = getCategoryById(categoryId);
                      if (!category) return null;
                      return (
                        <span
                          key={categoryId}
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: category.color,
                            color: isLightColor(category.color) ? '#000000' : '#FFFFFF'
                          }}
                        >
                          {category.name}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      {new Date(note.updated_at).toLocaleDateString()}
                    </span>
                    <div className="space-x-4">
                      <button
                        onClick={() => handleViewDetails(note)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CreateNoteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateNote}
      />

      <NoteDetails
        note={selectedNote}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedNote(null);
        }}
        onUpdate={loadNotes}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      {noteToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Note</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "{noteToDelete.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setNoteToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

// Helper function to determine if a color is light or dark
function isLightColor(color: string): boolean {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
}
