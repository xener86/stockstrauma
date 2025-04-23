// src/pages/Locations/LocationDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Location, Product } from '../../types';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { AlertBanner } from '../../components/common/AlertBanner';

interface LocationWithInventory extends Location {
  products: Product[];
  totalItems: number;
  criticalItems: number;
  warningItems: number;
}

const LocationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [location, setLocation] = useState<LocationWithInventory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch location details
        const { data: locationData, error: locationError } = await supabase
          .from('locations')
          .select('*')
          .eq('id', id)
          .single();
        
        if (locationError) throw locationError;
        
        if (!locationData) {
          throw new Error('Lieu de stockage non trouvé');
        }
        
        // Fetch inventory for this location
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select(`
            quantity,
            reserved_quantity,
            products (
              id,
              name,
              description,
              sku,
              unit_of_measure,
              min_stock_level,
              warning_stock_level
            ),
            product_variants (
              id,
              variant_name
            )
          `)
          .eq('location_id', id)
          .order('quantity', { ascending: false });
        
        if (inventoryError) throw inventoryError;
        
        // Format products data
        const products = inventoryData.map(item => ({
          id: item.products.id,
          name: item.products.name,
          sku: item.products.sku || '',
          description: item.products.description || '',
          quantity: item.quantity,
          reservedQuantity: item.reserved_quantity,
          unitOfMeasure: item.products.unit_of_measure,
          minStockLevel: item.products.min_stock_level,
          warningStockLevel: item.products.warning_stock_level,
          hasExpiry: false,
          variant: item.product_variants ? {
            id: item.product_variants.id,
            name: item.product_variants.variant_name
          } : undefined
        }));
        
        // Calculate summary statistics
        const totalItems = products.reduce((sum, product) => sum + product.quantity, 0);
        const criticalItems = products.filter(product => product.quantity <= product.minStockLevel).length;
        const warningItems = products.filter(product => 
          product.quantity > product.minStockLevel && 
          product.quantity <= product.warningStockLevel
        ).length;
        
        // Create the location object with inventory
        const locationWithInventory: LocationWithInventory = {
          id: locationData.id,
          name: locationData.name,
          description: locationData.description || undefined,
          address: locationData.address || undefined,
          isActive: locationData.is_active,
          products,
          totalItems,
          criticalItems,
          warningItems
        };
        
        setLocation(locationWithInventory);
        
      } catch (err) {
        console.error('Error fetching location details:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLocationDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <AlertBanner 
          title="Erreur" 
          message={`Impossible de charger les détails du lieu: ${error.message}`}
          severity="critical"
          onAction={() => navigate('/locations')}
          actionLabel="Retour aux lieux"
        />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <AlertBanner 
          title="Lieu non trouvé" 
          message="Le lieu demandé n'existe pas ou a été supprimé."
          severity="warning"
          onAction={() => navigate('/locations')}
          actionLabel="Retour aux lieux"
        />
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center">
            <button
              onClick={() => navigate('/locations')}
              className="mr-2 text-gray-500 hover:text-primary-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              {location.name}
            </h1>
          </div>
          {location.address && (
            <p className="mt-1 text-sm text-gray-500">
              {location.address}
            </p>
          )}
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => navigate(`/locations/${id}/edit`)}
          >
            Modifier
          </Button>
          <Button 
            variant="primary"
            onClick={() => navigate('/inventory/add', { state: { locationId: id } })}
          >
            Ajouter un mouvement
          </Button>
        </div>
      </div>

      {(location.criticalItems > 0 || location.warningItems > 0) && (
        <AlertBanner 
          title={location.criticalItems > 0 ? "Produits en seuil critique" : "Produits en alerte"} 
          message={location.criticalItems > 0 
            ? `${location.criticalItems} produit(s) sont en dessous du seuil critique.` 
            : `${location.warningItems} produit(s) sont en dessous du seuil d'alerte.`
          }
          severity={location.criticalItems > 0 ? "critical" : "warning"}
          onAction={() => navigate('/orders/new', { state: { locationId: id } })}
          actionLabel="Commander"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card title="Informations générales" className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Description</h4>
              <p className="mt-1 text-sm text-gray-900">{location.description || 'Aucune description'}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Statut</h4>
              <p className="mt-1 text-sm">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  location.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {location.isActive ? 'Actif' : 'Inactif'}
                </span>
              </p>
            </div>
          </div>
        </Card>

        <Card title="Statistiques">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Total des articles</h4>
              <p className="mt-1 text-2xl font-medium text-primary-600">{location.totalItems}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Produits en alerte</h4>
              <p className="mt-1 text-lg font-medium text-warning-600">{location.warningItems}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Produits en seuil critique</h4>
              <p className="mt-1 text-lg font-medium text-danger-600">{location.criticalItems}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Produits dans ce lieu</h2>
        
        {location.products.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">Aucun produit dans ce lieu de stockage.</p>
            <Button 
              variant="primary"
              className="mt-4"
              onClick={() => navigate('/inventory/add', { state: { locationId: id } })}
            >
              Ajouter des produits
            </Button>
          </div>
        ) : (
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
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
                    Seuils
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {location.products.map((product) => (
                  <tr key={`${product.id}-${product.variant?.id || 'default'}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.sku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.variant ? product.variant.name : 'Standard'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
  (product.quantity !== undefined && product.quantity <= product.minStockLevel)
    ? 'text-danger-600'
    : (product.quantity !== undefined && product.quantity <= product.warningStockLevel)
    ? 'text-warning-600'
    : 'text-positive-600'
}`}>

                        {product.quantity} {product.unitOfMeasure}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.reservedQuantity} {product.unitOfMeasure}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs">
                        <span className="text-gray-500">Critique:</span>{' '}
                        <span className="text-danger-600 font-medium">{product.minStockLevel}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Alerte:</span>{' '}
                        <span className="text-warning-600 font-medium">{product.warningStockLevel}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationDetail;