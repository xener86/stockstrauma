// src/components/dashboard/LocationCard.tsx
import React from 'react';
import { Button } from '../common/Button';
import { Location, Product } from '../../types';

interface LocationCardProps {
  location: Location;
  onManageClick: () => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location, onManageClick }) => {
  // Déterminer l'état du stock pour le style de la carte
  const getStockStatus = () => {
    if (!location.products || location.products.length === 0) return 'neutral';
    
    // Vérifie si au moins un produit est en état critique
    const hasCritical = location.products.some(product => 
      product.quantity !== undefined && 
      product.minStockLevel !== undefined && 
      product.quantity <= product.minStockLevel
    );
    
    if (hasCritical) return 'critical';
    
    // Vérifie si au moins un produit est en état d'alerte
    const hasWarning = location.products.some(product => 
      product.quantity !== undefined && 
      product.warningStockLevel !== undefined &&
      product.minStockLevel !== undefined &&
      product.quantity <= product.warningStockLevel && 
      product.quantity > product.minStockLevel
    );
    
    if (hasWarning) return 'warning';
    
    // Si tous les produits ont un stock suffisant
    return 'positive';
  };

  const getStockStatusClasses = () => {
    const status = getStockStatus();
    switch (status) {
      case 'positive':
        return 'border-l-4 border-positive-500';
      case 'warning':
        return 'border-l-4 border-warning-500';
      case 'critical':
        return 'border-l-4 border-danger-500';
      default:
        return 'border-l-4 border-gray-300';
    }
  };

  const getStockTextColor = (product: Product) => {
    if (product.quantity !== undefined && 
        product.minStockLevel !== undefined && 
        product.quantity <= product.minStockLevel) {
      return 'text-danger-500 font-semibold';
    } else if (product.quantity !== undefined && 
              product.warningStockLevel !== undefined && 
              product.quantity <= product.warningStockLevel) {
      return 'text-warning-500 font-semibold';
    } else {
      return 'text-positive-500 font-semibold';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${getStockStatusClasses()}`}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{location.name}</h3>
          <Button variant="outline" size="sm" onClick={onManageClick}>
            Gérer
          </Button>
        </div>
        
        {location.products && location.products.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {location.products.slice(0, 5).map(product => (
              <li key={product.id} className="py-3 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium">{product.name}</div>
                  <div className="text-xs text-gray-500">
                    {product.details || product.sku || 'No details'}
                  </div>
                </div>
                <div className={getStockTextColor(product)}>
                  {product.quantity !== undefined ? product.quantity : 0} {product.unitOfMeasure || 'unités'}
                </div>
              </li>
            ))}
            
            {location.products.length > 5 && (
              <li className="py-2 text-center text-sm text-primary-600">
                + {location.products.length - 5} autres produits
              </li>
            )}
          </ul>
        ) : (
          <div className="py-8 text-center text-gray-500">
            Aucun produit dans ce lieu
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationCard;