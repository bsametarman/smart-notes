'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import CreateNoteModal from '@/components/CreateNoteModal';
import NoteDetails from '@/components/NoteDetails';
import Auth from '@/components/Auth';
import { Note } from '@/types/notes';
import { notesService } from '@/services/notes';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    try {
      const notes = await notesService.getAllNotes();
      setNotes(notes);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const handleCreateNote = async (input: { title: string; content: string }) => {
    try {
      await notesService.createNote(input);
      await loadNotes();
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await notesService.deleteNote(id);
      await loadNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleViewDetails = (note: Note) => {
    setSelectedNote(note);
    setIsDetailsModalOpen(true);
  };

  if (loading) {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-10">
              No notes yet. Create your first note!
            </p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{note.title}</h3>
                <p className="text-gray-600 line-clamp-3 mb-4">{note.content}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleViewDetails(note)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
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
      />
    </Layout>
  );
}
