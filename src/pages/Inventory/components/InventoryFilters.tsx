// src/pages/Inventory/components/InventoryFilters.tsx
import React, { useState, useEffect } from 'react';
import { Product, Location } from '../../../types';

interface DateRange {
  start: Date;
  end: Date;
}

interface InventoryFiltersProps {
  products: Product[];
  locations: Location[];
  selectedProductId: string | null;
  selectedLocationId: string | null;
  selectedDateRange: DateRange | null;
  selectedMovementType: string | null;
  onFilterChange: (
    productId: string | null,
    locationId: string | null,
    dateRange: DateRange | null,
    movementType: string | null
  ) => void;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  products,
  locations,
  selectedProductId,
  selectedLocationId,
  selectedDateRange,
  selectedMovementType,
  onFilterChange
}) => {
  const [productId, setProductId] = useState<string | null>(selectedProductId);
  const [locationId, setLocationId] = useState<string | null>(selectedLocationId);
  const [movementType, setMovementType] = useState<string | null>(selectedMovementType);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Initialiser les dates si un intervalle est sélectionné
  useEffect(() => {
    if (selectedDateRange) {
      setStartDate(selectedDateRange.start.toISOString().split('T')[0]); // Format YYYY-MM-DD
      setEndDate(selectedDateRange.end.toISOString().split('T')[0]); // Format YYYY-MM-DD
    } else {
      setStartDate('');
      setEndDate('');
    }
  }, [selectedDateRange]);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === '' ? null : e.target.value;
    setProductId(value);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === '' ? null : e.target.value;
    setLocationId(value);
  };

  const handleMovementTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === '' ? null : e.target.value;
    setMovementType(value);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const handleApplyFilters = () => {
    let dateRange: DateRange | null = null;
    
    if (startDate && endDate) {
      dateRange = {
        start: new Date(`${startDate}T00:00:00`),
        end: new Date(`${endDate}T23:59:59`)
      };
    }
    
    onFilterChange(productId, locationId, dateRange, movementType);
  };

  const handleResetFilters = () => {
    setProductId(null);
    setLocationId(null);
    setMovementType(null);
    setStartDate('');
    setEndDate('');
    onFilterChange(null, null, null, null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Filtres</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
            Produit
          </label>
          <select
            id="product"
            name="product"
            value={productId || ''}
            onChange={handleProductChange}
            className="form-select"
          >
            <option value="">Tous les produits</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name}{product.sku ? ` (${product.sku})` : ''}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Lieu
          </label>
          <select
            id="location"
            name="location"
            value={locationId || ''}
            onChange={handleLocationChange}
            className="form-select"
          >
            <option value="">Tous les lieux</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="movementType" className="block text-sm font-medium text-gray-700 mb-1">
            Type de mouvement
          </label>
          <select
            id="movementType"
            name="movementType"
            value={movementType || ''}
            onChange={handleMovementTypeChange}
            className="form-select"
          >
            <option value="">Tous les types</option>
            <option value="in">Entrée</option>
            <option value="out">Sortie</option>
            <option value="transfer">Transfert</option>
            <option value="adjustment">Ajustement</option>
            <option value="consumption">Consommation</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
            Période
          </label>
          <div className="flex space-x-2">
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={startDate}
              onChange={handleStartDateChange}
              className="form-input w-1/2"
            />
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={endDate}
              onChange={handleEndDateChange}
              className="form-input w-1/2"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={handleResetFilters}
          className="btn btn-secondary"
        >
          Réinitialiser
        </button>
        <button
          type="button"
          onClick={handleApplyFilters}
          className="btn btn-primary"
        >
          Appliquer
        </button>
      </div>
    </div>
  );
};

