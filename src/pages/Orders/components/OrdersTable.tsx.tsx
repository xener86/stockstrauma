// src/pages/Orders/components/OrdersTable.tsx
import React from 'react';
import { Order } from '../../../types';

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  onViewOrder: (orderId: string) => void;
  onReceiveOrder: (orderId: string) => void;
  onCancelOrder: (orderId: string) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  isLoading,
  onViewOrder,
  onReceiveOrder,
  onCancelOrder
}) => {
  if (isLoading && orders.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Chargement des commandes...</p>
      </div>
    );
  }
  
  if (orders.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <p className="text-gray-500">Aucune commande trouvée avec les filtres actuels.</p>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'draft':
        return 'badge-gray';
      case 'pending':
        return 'badge-yellow';
      case 'ordered':
        return 'badge-blue';
      case 'partially_received':
        return 'badge-yellow';
      case 'received':
        return 'badge-green';
      case 'cancelled':
        return 'badge-red';
      default:
        return 'badge-gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'pending':
        return 'En attente';
      case 'ordered':
        return 'Commandé';
      case 'partially_received':
        return 'Partiellement reçu';
      case 'received':
        return 'Reçu';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  // Déterminer si une commande peut être reçue
  const canReceiveOrder = (order: Order) => {
    return order.status === 'ordered' || order.status === 'partially_received';
  };

  // Déterminer si une commande peut être annulée
  const canCancelOrder = (order: Order) => {
    return order.status === 'draft' || order.status === 'pending' || order.status === 'ordered';
  };

  return (
    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Référence
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fournisseur
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Livraison prévue
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600 hover:text-primary-900 cursor-pointer" onClick={() => onViewOrder(order.id)}>
                {order.referenceNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.createdAt.toLocaleDateString('fr-FR')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {order.supplier.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.expectedDeliveryDate
                  ? order.expectedDeliveryDate.toLocaleDateString('fr-FR')
                  : 'Non définie'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onViewOrder(order.id)}
                  className="text-primary-600 hover:text-primary-900 mr-4"
                >
                  Voir
                </button>
                
                {canReceiveOrder(order) && (
                  <button
                    onClick={() => onReceiveOrder(order.id)}
                    className="text-green-600 hover:text-green-900 mr-4"
                  >
                    Réceptionner
                  </button>
                )}
                
                {canCancelOrder(order) && (
                  <button
                    onClick={() => onCancelOrder(order.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Annuler
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};