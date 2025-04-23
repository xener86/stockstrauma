// src/pages/Products/components/ProductFilters.tsx
import React from 'react';
import { Category } from '../../../types';

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory: string | 'all';
  searchQuery: string;
  onCategoryChange: (categoryId: string) => void;
  onSearchChange: (query: string) => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  selectedCategory,
  searchQuery,
  onCategoryChange,
  onSearchChange
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Catégorie
        </label>
        <select
          id="category"
          name="category"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="form-select"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
          Rechercher
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            name="search"
            id="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="form-input pl-10"
            placeholder="Rechercher un produit..."
          />
        </div>
      </div>
    </div>
  );
};