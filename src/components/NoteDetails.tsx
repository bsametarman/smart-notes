'use client';

import React from 'react';
import { Note } from '@/types/notes';

interface NoteDetailsProps {
    note: Note | null;
    isOpen: boolean;
    onClose: () => void;
}

const NoteDetails: React.FC<NoteDetailsProps> = ({ note, isOpen, onClose }) => {
    if (!isOpen || !note) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{note.title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                </div>

                <div className="mt-6 text-sm text-gray-500">
                    <p>Created: {new Date(note.created_at).toLocaleString()}</p>
                    <p>Last updated: {new Date(note.updated_at).toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};

export default NoteDetails; 