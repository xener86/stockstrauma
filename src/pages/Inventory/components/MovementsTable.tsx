// src/pages/Inventory/components/MovementsTable.tsx
import React from 'react';
import { InventoryMovement } from '../../../types';

interface MovementsTableProps {
  movements: InventoryMovement[];
  isLoading: boolean;
}

// Puisque le type InventoryMovement ne contient pas les propriétés product, variant, etc.,
// nous devons étendre l'interface pour inclure ces propriétés pour le composant
interface ExtendedInventoryMovement extends InventoryMovement {
  product?: {
    id: string;
    name: string;
    sku?: string;
    unitOfMeasure: string;
  };
  variant?: {
    id: string;
    name: string;
  };
  sourceLocation?: {
    id: string;
    name: string;
    isActive: boolean;
  };
  destinationLocation?: {
    id: string;
    name: string;
    isActive: boolean;
  };
  movedByUser?: {
    id: string;
    name: string;
    email: string;
  };
}

export const MovementsTable: React.FC<MovementsTableProps> = ({
  movements,
  isLoading
}) => {
  if (isLoading && movements.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Chargement des mouvements...</p>
      </div>
    );
  }
  
  if (movements.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <p className="text-gray-500">Aucun mouvement trouvé avec les filtres actuels.</p>
      </div>
    );
  }

  // Fonction pour convertir le type de mouvement en texte français
  const getMovementTypeText = (type: string) => {
    switch (type) {
      case 'in':
        return 'Entrée';
      case 'out':
        return 'Sortie';
      case 'transfer':
        return 'Transfert';
      case 'adjustment':
        return 'Ajustement';
      case 'consumption':
        return 'Consommation';
      default:
        return type;
    }
  };

  // Fonction pour déterminer la classe CSS du badge selon le type de mouvement
  const getMovementTypeClass = (type: string) => {
    switch (type) {
      case 'in':
        return 'badge-green';
      case 'out':
        return 'badge-red';
      case 'transfer':
        return 'badge-yellow';
      case 'adjustment':
        return 'badge-gray';
      case 'consumption':
        return 'badge-red';
      default:
        return 'badge-gray';
    }
  };

  // Cast movements to ExtendedInventoryMovement to avoid TypeScript errors
  const extendedMovements = movements as unknown as ExtendedInventoryMovement[];

  return (
    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantité
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Destination
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Référence
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Effectué par
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {extendedMovements.map((movement) => (
              <tr key={movement.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {movement.createdAt.toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`badge ${getMovementTypeClass(movement.type)}`}>
                    {getMovementTypeText(movement.type)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {movement.product?.name || `Produit ID: ${movement.productId}`}
                  </div>
                  {movement.variant && (
                    <div className="text-xs text-gray-500">
                      {movement.variant.name}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {movement.quantity} {movement.product?.unitOfMeasure || 'unité(s)'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {movement.sourceLocation?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {movement.destinationLocation?.name || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {movement.referenceNumber || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {movement.movedByUser?.name || `Utilisateur ID: ${movement.movedBy}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MovementsTable;