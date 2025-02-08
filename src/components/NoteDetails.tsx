'use client';

import React, { useState, useEffect } from 'react';
import { Note, Category } from '@/types/notes';
import { notesService } from '@/services/notes';
import { aiService, AIAnalysisResult } from '@/services/ai';
import { categoriesService } from '@/services/categories';
import CategorySelector from './CategorySelector';
import { HexColorPicker } from 'react-colorful';

interface NoteDetailsProps {
    note: Note | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
    categories: Category[];
}

export default function NoteDetails({ note, isOpen, onClose, onUpdate, categories }: NoteDetailsProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [selectedColor, setSelectedColor] = useState('#000000');
    const [showColorPicker, setShowColorPicker] = useState(false);

    const colors = [
        '#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#33FFF5',
        '#FFB533', '#FF3333', '#33FF33', '#3333FF', '#FF33B5'
    ];

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setSelectedCategories(note.categories);
            setAiAnalysis(null);
        }
    }, [note]);

    const handleSave = async () => {
        if (!note) return;
        setIsSaving(true);

        try {
            await notesService.updateNote({
                id: note.id,
                title,
                content,
                categories: selectedCategories
            });
            if (onUpdate) onUpdate();
            setIsSaving(false);
        } catch (error) {
            console.error('Failed to update note:', error);
            setIsSaving(false);
        }
    };

    const handleCreateCategory = async () => {
        try {
            await categoriesService.createCategory({ name: newCategoryName, color: selectedColor });
            setNewCategoryName('');
            setSelectedColor('#000000');
            setShowAddForm(false);
            setShowColorPicker(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Failed to create category:', error);
        }
    };

    const handleAIAnalysis = async () => {
        if (!content.trim()) return;
        setIsAnalyzing(true);
        setAiAnalysis(null);

        try {
            const result = await aiService.analyzeNote(content, categories);
            setAiAnalysis(result);
            setSelectedCategories(result.suggestedCategories);

            if (note) {
                await notesService.updateNote({
                    id: note.id,
                    title,
                    content,
                    categories: result.suggestedCategories,
                    ai_summary: result.summary
                });
                if (onUpdate) onUpdate();
            }
        } catch (error) {
            console.error('Failed to analyze note:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (!isOpen || !note) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="space-y-6">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="block w-full text-xl font-bold px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Note title"
                    />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={12}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Note content"
                    />

                    {(aiAnalysis || note.ai_summary) && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-sm font-medium text-blue-900">AI Analysis</h3>
                                {note.last_analyzed && (
                                    <span className="text-xs text-blue-600">
                                        Analyzed: {new Date(note.last_analyzed).toLocaleString()}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-blue-800 mb-2">
                                {aiAnalysis?.summary || note.ai_summary}
                            </p>
                            <p className="text-xs text-blue-700">
                                {aiAnalysis ? 'Suggested categories have been automatically selected below.' : ''}
                            </p>
                        </div>
                    )}

                    <div className="mt-8">
                        <div className="text-sm font-medium text-gray-700 mb-2">Categories</div>
                        <div className="flex flex-wrap gap-2">
                            <CategorySelector
                                selectedCategories={selectedCategories}
                                onChange={setSelectedCategories}
                                onCategoryChange={onUpdate}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between space-x-3 mt-6">
                        <button
                            onClick={handleAIAnalysis}
                            disabled={isAnalyzing || !content.trim()}
                            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                        </button>

                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Category Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
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
                                    <div className="absolute mt-2 bg-white p-3 rounded-lg shadow-lg z-[70]">
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
        </div>
    );
} 