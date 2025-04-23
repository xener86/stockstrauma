// src/pages/Orders/components/OrderItemsTable.tsx
import React, { useState } from 'react';
import { OrderItem } from '../../../types';

interface OrderItemsTableProps {
  items: OrderItem[];
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
}

export const OrderItemsTable: React.FC<OrderItemsTableProps> = ({
  items,
  onRemoveItem,
  onUpdateQuantity
}) => {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number>(0);

  const handleEditQuantity = (item: OrderItem) => {
    setEditingItemId(item.id);
    setEditingQuantity(item.quantity);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setEditingQuantity(value);
    }
  };

  const handleSaveQuantity = () => {
    if (editingItemId && editingQuantity > 0) {
      onUpdateQuantity(editingItemId, editingQuantity);
      setEditingItemId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <p className="text-gray-500">Aucun article ajouté à la commande.</p>
      </div>
    );
  }

  return (
    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produit
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Destination
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantité
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Prix unitaire
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {item.product.name}
                </div>
                {item.product.sku && (
                  <div className="text-xs text-gray-500">
                    {item.product.sku}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.destination.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingItemId === item.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={editingQuantity}
                      onChange={handleQuantityChange}
                      min="1"
                      className="form-input w-20"
                    />
                    <button 
                      onClick={handleSaveQuantity}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      ✓
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div 
                    className="text-sm text-gray-900 cursor-pointer hover:text-primary-600"
                    onClick={() => handleEditQuantity(item)}
                  >
                    {item.quantity}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.unitPrice ? `${item.unitPrice.toFixed(2)} €` : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.unitPrice ? `${(item.unitPrice * item.quantity).toFixed(2)} €` : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.notes || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

