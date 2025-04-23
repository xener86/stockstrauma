// src/pages/Inventory/Inventory.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/common/Button';
import { InventoryFilters } from './components/InventoryFilters';
import { MovementsTable } from './components/MovementsTable';
import { AddMovementModal } from './components/AddMovementModal';
import { Product, Location, InventoryMovement } from '../../types';

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filterProductId = searchParams.get('product');
  const filterLocationId = searchParams.get('location');

  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(filterProductId);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(filterLocationId);
  const [selectedDateRange, setSelectedDateRange] = useState<{start: Date, end: Date} | null>(null);
  const [selectedMovementType, setSelectedMovementType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAddMovementModalOpen, setIsAddMovementModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Charger les produits
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            sku,
            unit_of_measure
          `)
          .order('name');
        
        if (productsError) throw productsError;
        
        setProducts(productsData.map(product => ({
          id: product.id,
          name: product.name,
          sku: product.sku || '',
          unitOfMeasure: product.unit_of_measure,
          minStockLevel: 0, // Non utilisé ici
          warningStockLevel: 0, // Non utilisé ici
          hasExpiry: false // Non utilisé ici
        })));
        
        // Charger les lieux
        const { data: locationsData, error: locationsError } = await supabase
          .from('locations')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (locationsError) throw locationsError;
        
        setLocations(locationsData.map(location => ({
          id: location.id,
          name: location.name,
          description: location.description || '',
          address: location.address || '',
          isActive: location.is_active
        })));
        
        // Charger les mouvements de stock
        await fetchMovements();
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const fetchMovements = async () => {
    try {
      // Construire la requête de base
      let query = supabase
        .from('inventory_movements')
        .select(`
          *,
          products (
            id,
            name,
            sku,
            unit_of_measure
          ),
          product_variants (
            id,
            variant_name
          ),
          source_location:locations!source_location_id (
            id,
            name
          ),
          destination_location:locations!destination_location_id (
            id,
            name
          ),
          moved_by_user:profiles!moved_by (
            id,
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      // Appliquer les filtres
      if (selectedProductId) {
        query = query.eq('product_id', selectedProductId);
      }
      
      if (selectedLocationId) {
        query = query.or(`source_location_id.eq.${selectedLocationId},destination_location_id.eq.${selectedLocationId}`);
      }
      
      if (selectedMovementType) {
        query = query.eq('movement_type', selectedMovementType);
      }
      
      if (selectedDateRange) {
        const startDate = selectedDateRange.start.toISOString();
        const endDate = selectedDateRange.end.toISOString();
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }
      
      // Limiter le nombre de résultats pour les performances
      query = query.limit(100);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transformer les données
      const formattedMovements: InventoryMovement[] = data.map(item => ({
        id: item.id,
        type: item.movement_type as "in" | "out" | "transfer" | "adjustment" | "consumption", // Forcer le type correct
        productId: item.product_id,
        variantId: item.variant_id || undefined,
        batchId: item.batch_id || undefined,
        sourceLocationId: item.source_location_id || undefined,
        destinationLocationId: item.destination_location_id || undefined,
        quantity: item.quantity,
        movedBy: item.moved_by,
        referenceNumber: item.reference_number || undefined,
        notes: item.notes || undefined,
        createdAt: new Date(item.created_at),
        product: {
          id: item.products.id,
          name: item.products.name,
          sku: item.products.sku || '',
          unitOfMeasure: item.products.unit_of_measure
        },
        variant: item.product_variants ? {
          id: item.product_variants.id,
          name: item.product_variants.variant_name
        } : undefined,
        sourceLocation: item.source_location ? {
          id: item.source_location.id,
          name: item.source_location.name,
          isActive: true // Assumé actif
        } : undefined,
        destinationLocation: item.destination_location ? {
          id: item.destination_location.id,
          name: item.destination_location.name,
          isActive: true // Assumé actif
        } : undefined,
        movedByUser: {
          id: item.moved_by_user.id,
          name: item.moved_by_user.full_name || item.moved_by_user.email,
          email: item.moved_by_user.email
        }
      }));
      
      
      setMovements(formattedMovements);
      
    } catch (err) {
      console.error('Error fetching movements:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const handleFilterChange = async (
    productId: string | null,
    locationId: string | null,
    dateRange: {start: Date, end: Date} | null,
    movementType: string | null
  ) => {
    setSelectedProductId(productId);
    setSelectedLocationId(locationId);
    setSelectedDateRange(dateRange);
    setSelectedMovementType(movementType);
    
    // Mettre à jour l'URL avec les filtres
    const params = new URLSearchParams();
    if (productId) params.set('product', productId);
    if (locationId) params.set('location', locationId);
    navigate({ search: params.toString() });
    
    try {
      setIsLoading(true);
      await fetchMovements();
    } catch (err) {
      console.error('Error applying filters:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMovement = async (
    newMovement: Omit<InventoryMovement, 'id' | 'createdAt' | 'movedByUser'>
  ) => {
    try {
      // Récupérer l'ID de l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }
      
      // Préparer les données pour l'insertion
      const movementToInsert = {
        movement_type: newMovement.type,
        product_id: newMovement.productId,
        variant_id: newMovement.variantId || null,
        batch_id: newMovement.batchId || null,
        source_location_id: newMovement.sourceLocationId || null,
        destination_location_id: newMovement.destinationLocationId || null,
        quantity: newMovement.quantity,
        moved_by: user.id,
        reference_number: newMovement.referenceNumber || null,
        notes: newMovement.notes || null
      };
      
      // Insérer le mouvement
      const { error: movementError } = await supabase
        .from('inventory_movements')
        .insert(movementToInsert);
      
      if (movementError) throw movementError;
      
      // Actualiser la liste des mouvements
      await fetchMovements();
      
      setIsAddMovementModalOpen(false);
      
    } catch (err) {
      console.error('Error adding movement:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  if (isLoading && movements.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Mouvements de stock</h1>
        <div className="mt-4 md:mt-0">
          <Button 
            variant="primary"
            onClick={() => setIsAddMovementModalOpen(true)}
            leftIcon={
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
            }
          >
            Ajouter un mouvement
          </Button>
        </div>
      </div>

      <InventoryFilters 
        products={products}
        locations={locations}
        selectedProductId={selectedProductId}
        selectedLocationId={selectedLocationId}
        selectedDateRange={selectedDateRange}
        selectedMovementType={selectedMovementType}
        onFilterChange={handleFilterChange}
      />

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Erreur: {error.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <MovementsTable movements={movements} isLoading={isLoading} />
      </div>

      {isAddMovementModalOpen && (
        <AddMovementModal 
          isOpen={isAddMovementModalOpen}
          onClose={() => setIsAddMovementModalOpen(false)}
          onAddMovement={handleAddMovement}
          products={products}
          locations={locations}
          initialProductId={selectedProductId}
          initialLocationId={selectedLocationId}
        />
      )}
    </div>
  );
};

export default Inventory;