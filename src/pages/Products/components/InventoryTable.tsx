// src/pages/Products/components/InventoryTable.tsx
import React from 'react';
import { InventoryItem } from '../../../types';

interface InventoryTableProps {
  inventory: InventoryItem[];
  productUnit: string;
  minStockLevel: number;
  warningStockLevel: number;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  inventory,
  productUnit,
  minStockLevel,
  warningStockLevel
}) => {
  if (inventory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">Aucun stock disponible pour ce produit.</p>
      </div>
    );
  }

  const getStockStatusClasses = (quantity: number) => {
    if (quantity <= minStockLevel) {
      return 'text-danger-600 font-semibold';
    } else if (quantity <= warningStockLevel) {
      return 'text-warning-600 font-semibold';
    } else {
      return 'text-positive-600 font-semibold';
    }
  };

  return (
    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lieu
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Variante
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantité disponible
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantité réservée
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dernier inventaire
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {inventory.map((item) => (
            <tr key={`${item.locationId}-${item.variantId || 'default'}`} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {item.location?.name || 'Inconnu'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {item.variant ? item.variant.name : 'Standard'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`text-sm ${getStockStatusClasses(item.quantity)}`}>
                  {item.quantity} {productUnit}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.reservedQuantity} {productUnit}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.lastCountedAt 
                  ? new Date(item.lastCountedAt).toLocaleDateString() 
                  : 'Jamais'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;