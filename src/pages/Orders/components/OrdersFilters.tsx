// src/pages/Orders/components/OrdersFilters.tsx
import React, { useState, useEffect } from 'react';
import { Supplier } from '../../../types';

interface OrdersFiltersProps {
  suppliers: Supplier[];
  selectedStatus: string | null;
  selectedSupplierId: string | null;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  onFilterChange: (
    status: string | null,
    supplierId: string | null,
    dateRange: {
      start: Date | null;
      end: Date | null;
    }
  ) => void;
}

export const OrdersFilters: React.FC<OrdersFiltersProps> = ({
  suppliers,
  selectedStatus,
  selectedSupplierId,
  dateRange,
  onFilterChange
}) => {
  const [status, setStatus] = useState<string>(selectedStatus || '');
  const [supplierId, setSupplierId] = useState<string>(selectedSupplierId || '');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Initialiser les dates si un intervalle est sélectionné
  useEffect(() => {
    if (dateRange.start) {
      setStartDate(dateRange.start.toISOString().split('T')[0]); // Format YYYY-MM-DD
    }
    
    if (dateRange.end) {
      setEndDate(dateRange.end.toISOString().split('T')[0]); // Format YYYY-MM-DD
    }
  }, [dateRange]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSupplierId(e.target.value);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const handleApplyFilters = () => {
    const newStatus = status === '' ? null : status;
    const newSupplierId = supplierId === '' ? null : supplierId;
    
    let newDateRange = {
      start: null as Date | null,
      end: null as Date | null
    };
    
    if (startDate && endDate) {
      newDateRange.start = new Date(`${startDate}T00:00:00`);
      newDateRange.end = new Date(`${endDate}T23:59:59`);
    }
    
    onFilterChange(newStatus, newSupplierId, newDateRange);
  };

  const handleResetFilters = () => {
    setStatus('');
    setSupplierId('');
    setStartDate('');
    setEndDate('');
    onFilterChange(null, null, { start: null, end: null });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Filtres</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={handleStatusChange}
            className="form-select"
          >
            <option value="">Tous les statuts</option>
            <option value="draft">Brouillon</option>
            <option value="pending">En attente</option>
            <option value="ordered">Commandé</option>
            <option value="partially_received">Partiellement reçu</option>
            <option value="received">Reçu</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
            Fournisseur
          </label>
          <select
            id="supplier"
            name="supplier"
            value={supplierId}
            onChange={handleSupplierChange}
            className="form-select"
          >
            <option value="">Tous les fournisseurs</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
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

