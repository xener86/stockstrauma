// src/pages/Orders/components/SupplierSelector.tsx
import React from 'react';
import { Supplier } from '../../../types';

interface SupplierSelectorProps {
  suppliers: Supplier[];
  selectedSupplierId: string;
  onSupplierChange: (supplierId: string) => void;
}

export const SupplierSelector: React.FC<SupplierSelectorProps> = ({
  suppliers,
  selectedSupplierId,
  onSupplierChange
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSupplierChange(e.target.value);
  };

  const selectedSupplier = suppliers.find(supplier => supplier.id === selectedSupplierId);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
          Fournisseur *
        </label>
        <select
          id="supplier"
          name="supplier"
          value={selectedSupplierId}
          onChange={handleChange}
          className="form-select"
          required
        >
          <option value="" disabled>Sélectionner un fournisseur</option>
          {suppliers.map(supplier => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
      </div>

      {selectedSupplier && (
        <div className="bg-gray-50 rounded-md p-3">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Informations du fournisseur</h4>
          <div className="text-sm space-y-1">
            {selectedSupplier.contactName && (
              <p><span className="font-medium">Contact:</span> {selectedSupplier.contactName}</p>
            )}
            {selectedSupplier.email && (
              <p><span className="font-medium">Email:</span> {selectedSupplier.email}</p>
            )}
            {selectedSupplier.phone && (
              <p><span className="font-medium">Téléphone:</span> {selectedSupplier.phone}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

