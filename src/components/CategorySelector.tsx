'use client';

import React, { useState, useEffect } from 'react';
import { Category, CreateCategoryInput, DEFAULT_CATEGORIES } from '@/types/notes';
import { categoriesService } from '@/services/categories';
import { HexColorPicker } from 'react-colorful';

interface CategorySelectorProps {
    selectedCategories: string[];
    onChange: (categories: string[]) => void;
    showAddButton?: boolean;
    allowDelete?: boolean;
    onCategoryChange?: () => void;
}

export default function CategorySelector({
    selectedCategories,
    onChange,
    showAddButton = true,
    allowDelete = true,
    onCategoryChange
}: CategorySelectorProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedColor, setSelectedColor] = useState('#FF5733');
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const [showColorPicker, setShowColorPicker] = useState(false);

    const colors = [
        '#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#33FFF5',
        '#FFB533', '#FF3333', '#33FF33', '#3333FF', '#FF33B5'
    ];

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const categories = await categoriesService.getAllCategories();
            setCategories(categories);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const handleCreateCategory = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        try {
            const newCategory: CreateCategoryInput = {
                name: newCategoryName.trim(),
                color: selectedColor
            };
            await categoriesService.createCategory(newCategory);
            setNewCategoryName('');
            setShowAddForm(false);
            await loadCategories();
            if (onCategoryChange) onCategoryChange();
        } catch (error) {
            console.error('Failed to create category:', error);
        }
    };

    const handleDeleteCategory = async (category: Category) => {
        try {
            await categoriesService.deleteCategory(category.id);
            // Remove the category from selected categories if it was selected
            onChange(selectedCategories.filter(id => id !== category.id));
            await loadCategories();
            setCategoryToDelete(null);
            if (onCategoryChange) onCategoryChange();
        } catch (error) {
            console.error('Failed to delete category:', error);
        }
    };

    const toggleCategory = (e: React.MouseEvent, categoryId: string) => {
        e.preventDefault(); // Prevent form submission
        const newSelected = selectedCategories.includes(categoryId)
            ? selectedCategories.filter(id => id !== categoryId)
            : [...selectedCategories, categoryId];
        onChange(newSelected);
    };

    const isDefaultCategory = (categoryName: string) => {
        return DEFAULT_CATEGORIES.some(cat => cat.name === categoryName);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                    <div key={category.id} className="relative group">
                        <button
                            type="button"
                            onClick={(e) => toggleCategory(e, category.id)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-all
                                ${selectedCategories.includes(category.id)
                                    ? 'ring-2 ring-offset-2 ring-opacity-60'
                                    : 'opacity-70 hover:opacity-100'}`}
                            style={{
                                backgroundColor: category.color,
                                color: isLightColor(category.color) ? '#000000' : '#FFFFFF'
                            }}
                        >
                            {category.name}
                        </button>
                        {allowDelete && !isDefaultCategory(category.name) && (
                            <button
                                type="button"
                                onClick={() => setCategoryToDelete(category)}
                                className="absolute -top-2 -right-2 hidden group-hover:block bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
                {showAddButton && (
                    <button
                        type="button"
                        onClick={() => setShowAddForm(true)}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 hover:bg-gray-200 transition-colors text-gray-700 border-2 border-dashed border-gray-300 hover:border-gray-400 flex items-center space-x-1"
                    >
                        <span>+</span>
                        <span>Add Category</span>
                    </button>
                )}
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

            {/* Delete Confirmation Modal */}
            {categoryToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Category</h2>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete "{categoryToDelete.name}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setCategoryToDelete(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteCategory(categoryToDelete)}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
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