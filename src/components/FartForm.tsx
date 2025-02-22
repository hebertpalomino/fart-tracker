'use client';

import { useState } from 'react';

interface FartFormProps {
  defaultName: string;
  onSubmit: (description: string, name: string) => void;
  onClose: () => void;
}

export default function FartForm({ defaultName, onSubmit, onClose }: FartFormProps) {
  const [description, setDescription] = useState('');
  const [name, setName] = useState(defaultName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(description, name);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-96 max-w-[90vw]">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
          💨 Log a Fart
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this fart... (e.g., 'Silent but deadly' or 'Post-burrito blast')" 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 ease-in-out"
            >
              💨 Save Fart
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 ease-in-out"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
