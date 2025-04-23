// src/pages/Orders/NewOrder.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { AlertBanner } from '../../components/common/AlertBanner';
import { SupplierSelector } from './components/SupplierSelector';
import { OrderItemsTable } from './components/OrderItemsTable';
import { AddOrderItemModal } from './components/AddOrderItemModal';
import { Product, Location, Supplier, OrderItem } from '../../types';

interface LocationState {
  productId?: string;
}

const NewOrder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  // États pour les données principales
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // États pour la commande
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>(`CMD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
  const [notes, setNotes] = useState<string>('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  
  // État pour le modal d'ajout d'article
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [productToAdd, setProductToAdd] = useState<string | undefined>(state?.productId);

  // Charger les données nécessaires à la création d'une commande
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Charger les fournisseurs actifs
        const { data: suppliersData, error: suppliersError } = await supabase
          .from('suppliers')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (suppliersError) throw suppliersError;
        
        setSuppliers(suppliersData.map(supplier => ({
          id: supplier.id,
          name: supplier.name,
          contactName: supplier.contact_name || undefined,
          email: supplier.email || undefined,
          phone: supplier.phone || undefined,
          isActive: supplier.is_active
        })));
        
        // Charger les produits
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            sku,
            unit_of_measure,
            categories (
              id,
              name
            )
          `)
          .order('name');
        
        if (productsError) throw productsError;
        
        setProducts(productsData.map(product => ({
          id: product.id,
          name: product.name,
          sku: product.sku || '',
          unitOfMeasure: product.unit_of_measure,
          category: product.categories ? {
            id: product.categories.id,
            name: product.categories.name
          } : null,
          minStockLevel: 0, // Non utilisé ici
          warningStockLevel: 0, // Non utilisé ici
          hasExpiry: false // Non utilisé ici
        })));
        
        // Charger les lieux actifs
        const { data: locationsData, error: locationsError } = await supabase
          .from('locations')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (locationsError) throw locationsError;
        
        setLocations(locationsData.map(location => ({
          id: location.id,
          name: location.name,
          description: location.description || undefined,
          address: location.address || undefined,
          isActive: location.is_active
        })));
        
        // Si un productId est passé dans l'état de la location, pré-sélectionner ce produit
        if (state?.productId) {
          setProductToAdd(state.productId);
          setIsAddItemModalOpen(true);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [state]);

  const handleSupplierChange = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
  };

  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReferenceNumber(e.target.value);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const handleExpectedDeliveryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpectedDeliveryDate(e.target.value);
  };

  const handleAddItemClick = () => {
    setProductToAdd(undefined);
    setIsAddItemModalOpen(true);
  };

  const handleAddItem = (newItem: Omit<OrderItem, 'id' | 'order'>) => {
    // Générer un ID temporaire pour l'article
    const id = uuidv4();
    
    // Récupérer les informations du produit
    const product = products.find(p => p.id === newItem.productId);
    
    // Récupérer les informations du lieu de destination
    const destination = locations.find(l => l.id === newItem.destinationLocationId);
    
    if (product && destination) {
      const orderItem: OrderItem = {
        id,
        orderId: '',  // Sera défini lors de la création de la commande
        productId: newItem.productId,
        variantId: newItem.variantId,
        quantity: newItem.quantity,
        receivedQuantity: 0,
        unitPrice: newItem.unitPrice,
        destinationLocationId: newItem.destinationLocationId,
        notes: newItem.notes,
        product: {
          name: product.name,
          sku: product.sku
        },
        destination: {
          name: destination.name
        }
      };
      
      setOrderItems(prev => [...prev, orderItem]);
    }
    
    setIsAddItemModalOpen(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleUpdateItemQuantity = (itemId: string, quantity: number) => {
    setOrderItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const handleSaveAsDraft = async () => {
    await saveOrder('draft');
  };

  const handleCreateOrder = async () => {
    await saveOrder('ordered');
  };

  const saveOrder = async (status: 'draft' | 'ordered') => {
    try {
      // Validation des données
      if (!selectedSupplierId) {
        setError(new Error('Veuillez sélectionner un fournisseur'));
        return;
      }
      
      if (!referenceNumber) {
        setError(new Error('Veuillez saisir un numéro de référence'));
        return;
      }
      
      if (orderItems.length === 0) {
        setError(new Error('Veuillez ajouter au moins un article à la commande'));
        return;
      }
      
      // Récupérer l'ID de l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError(new Error('Utilisateur non connecté'));
        return;
      }
      
      setIsLoading(true);
      
      // Créer la commande
      const orderData = {
        reference_number: referenceNumber,
        supplier_id: selectedSupplierId,
        status,
        ordered_by: user.id,
        ordered_date: status === 'ordered' ? new Date().toISOString() : null,
        expected_delivery_date: expectedDeliveryDate ? new Date(expectedDeliveryDate).toISOString() : null,
        notes: notes || null
      };
      
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      if (!orderResult) {
        throw new Error('Erreur lors de la création de la commande');
      }
      
      // Ajouter les articles à la commande
      const orderItemsToInsert = orderItems.map(item => ({
        order_id: orderResult.id,
        product_id: item.productId,
        variant_id: item.variantId || null,
        quantity: item.quantity,
        received_quantity: 0,
        unit_price: item.unitPrice || null,
        destination_location_id: item.destinationLocationId,
        notes: item.notes || null
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);
      
      if (itemsError) throw itemsError;
      
      // Rediriger vers la page de détail de la commande
      navigate(`/orders/${orderResult.id}`, { 
        state: { 
          success: true, 
          message: status === 'draft' 
            ? 'Brouillon de commande créé avec succès' 
            : 'Commande créée avec succès' 
        } 
      });
      
    } catch (err) {
      console.error('Error saving order:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && (!suppliers.length || !products.length || !locations.length)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const totalPrice = orderItems.reduce((sum, item) => {
    return sum + (item.unitPrice || 0) * item.quantity;
  }, 0);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center">
            <button
              onClick={() => navigate('/orders')}
              className="mr-2 text-gray-500 hover:text-primary-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              Nouvelle commande
            </h1>
          </div>
        </div>
      </div>

      {error && (
        <AlertBanner 
          title="Erreur" 
          message={error.message}
          severity="critical"
          onDismiss={() => setError(null)}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card title="Informations générales" className="md:col-span-2">
          <div className="space-y-4">
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de référence *
              </label>
              <input
                type="text"
                id="reference"
                name="reference"
                value={referenceNumber}
                onChange={handleReferenceChange}
                className="form-input"
                required
              />
            </div>

            <SupplierSelector 
              suppliers={suppliers}
              selectedSupplierId={selectedSupplierId}
              onSupplierChange={handleSupplierChange}
            />

            <div>
              <label htmlFor="expectedDeliveryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date de livraison prévue
              </label>
              <input
                type="date"
                id="expectedDeliveryDate"
                name="expectedDeliveryDate"
                value={expectedDeliveryDate}
                onChange={handleExpectedDeliveryDateChange}
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={notes}
                onChange={handleNotesChange}
                className="form-input"
                placeholder="Informations supplémentaires pour cette commande..."
              />
            </div>
          </div>
        </Card>

        <Card title="Résumé">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Nombre d'articles</h4>
              <p className="mt-1 text-lg font-medium text-gray-900">{orderItems.length}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Total</h4>
              <p className="mt-1 text-lg font-medium text-primary-600">{totalPrice.toFixed(2)} €</p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <Button
                variant="primary"
                fullWidth
                onClick={handleCreateOrder}
                isLoading={isLoading}
                disabled={!selectedSupplierId || orderItems.length === 0}
              >
                Créer la commande
              </Button>
              <Button
                variant="outline"
                fullWidth
                className="mt-2"
                onClick={handleSaveAsDraft}
                isLoading={isLoading}
                disabled={!selectedSupplierId || orderItems.length === 0}
              >
                Enregistrer comme brouillon
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Articles</h2>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleAddItemClick}
          >
            Ajouter un article
          </Button>
        </div>
        
        <OrderItemsTable 
          items={orderItems}
          onRemoveItem={handleRemoveItem}
          onUpdateQuantity={handleUpdateItemQuantity}
        />
      </div>

      {isAddItemModalOpen && (
        <AddOrderItemModal 
          isOpen={isAddItemModalOpen}
          onClose={() => setIsAddItemModalOpen(false)}
          onAddItem={handleAddItem}
          products={products}
          locations={locations}
          selectedSupplierId={selectedSupplierId}
          initialProductId={productToAdd}
        />
      )}
    </div>
  );
};

export default NewOrder;