// src/pages/Orders/NewOrder.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabase';

// Component imports
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { AlertBanner } from '../../components/common/AlertBanner';
import { SupplierSelector } from './components/SupplierSelector';
import { OrderItemsTable } from './components/OrderItemsTable';
import { AddOrderItemModal } from './components/AddOrderItemModal';

// Type imports
import { Product, Location, Supplier, OrderItem } from '../../types';

// Utility function to generate reference number
const generateReferenceNumber = (): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CMD-${date}-${randomSuffix}`;
};

// Interface for location state
interface LocationState {
  productId?: string;
}

const NewOrder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;

  // State for main data
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Order-related states
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [referenceNumber, setReferenceNumber] = useState(generateReferenceNumber());
  const [notes, setNotes] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  // Modal and product selection states
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [productToAdd, setProductToAdd] = useState<string | undefined>(state?.productId);

  // Data fetching effect
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);

        // Fetch active suppliers
        const { data: suppliersData, error: suppliersError } = await supabase
          .from('suppliers')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (suppliersError) throw suppliersError;

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            sku,
            unit_of_measure,
            categories (id, name)
          `)
          .order('name');

        if (productsError) throw productsError;

        // Fetch active locations
        const { data: locationsData, error: locationsError } = await supabase
          .from('locations')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (locationsError) throw locationsError;

        // Update states
        setSuppliers(suppliersData.map(supplier => ({
          id: supplier.id,
          name: supplier.name,
          contactName: supplier.contact_name || undefined,
          email: supplier.email || undefined,
          phone: supplier.phone || undefined,
          isActive: supplier.is_active
        })));

        setProducts(productsData.map(product => ({
          id: product.id,
          name: product.name,
          sku: product.sku || '',
          unitOfMeasure: product.unit_of_measure,
          category: product.categories ? {
            id: product.categories.id,
            name: product.categories.name
          } : null,
          minStockLevel: 0,
          warningStockLevel: 0,
          hasExpiry: false
        })));

        setLocations(locationsData.map(location => ({
          id: location.id,
          name: location.name,
          description: location.description || undefined,
          address: location.address || undefined,
          isActive: location.is_active
        })));

        // Prepare for adding initial product if passed in state
        if (state?.productId) {
          setProductToAdd(state.productId);
          setIsAddItemModalOpen(true);
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [state]);

  // Event handlers
  const handleSupplierChange = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
  };

  const handleAddItemClick = () => {
    setProductToAdd(undefined);
    setIsAddItemModalOpen(true);
  };

  const handleAddItem = (newItem: Omit<OrderItem, 'id' | 'order'>) => {
    const id = uuidv4();
    
    const product = products.find(p => p.id === newItem.productId);
    const destination = locations.find(l => l.id === newItem.destinationLocationId);
    
    if (product && destination) {
      const orderItem: OrderItem = {
        id,
        orderId: '',
        productId: newItem.productId,
        variantId: newItem.variantId 
          ? newItem.variantId 
          : undefined, // Explicit type conversion
        quantity: newItem.quantity,
        receivedQuantity: 0,
        unitPrice: newItem.unitPrice,
        destinationLocationId: newItem.destinationLocationId,
        notes: newItem.notes && newItem.notes.trim() 
          ? newItem.notes.trim() 
          : undefined, // Explicit handling of notes
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
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  // Order saving logic
  const saveOrder = async (status: 'draft' | 'ordered') => {
    try {
      // Validation
      if (!selectedSupplierId) {
        throw new Error('Veuillez sélectionner un fournisseur');
      }
      
      if (!referenceNumber) {
        throw new Error('Veuillez saisir un numéro de référence');
      }
      
      if (orderItems.length === 0) {
        throw new Error('Veuillez ajouter au moins un article à la commande');
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }
      
      setIsLoading(true);
      
      // Prepare order data
      const orderData = {
        reference_number: referenceNumber,
        supplier_id: selectedSupplierId,
        status,
        ordered_by: user.id,
        ordered_date: status === 'ordered' ? new Date().toISOString() : null,
        expected_delivery_date: expectedDeliveryDate 
          ? new Date(expectedDeliveryDate).toISOString() 
          : null,
        notes: notes.trim() || null
      };
      
      // Insert order
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      if (!orderResult) {
        throw new Error('Erreur lors de la création de la commande');
      }
      
      // Prepare and insert order items
      const orderItemsToInsert = orderItems.map(item => ({
        order_id: orderResult.id,
        product_id: item.productId,
        variant_id: item.variantId ?? null,
        quantity: item.quantity,
        received_quantity: 0,
        unit_price: item.unitPrice ?? null,
        destination_location_id: item.destinationLocationId,
        notes: item.notes ?? null
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);
      
      if (itemsError) throw itemsError;
      
      // Navigate to order details
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

  // Compute total price
  const totalPrice = useMemo(() => 
    orderItems.reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0),
    [orderItems]
  );

  // Render loading state
  if (isLoading && (!suppliers.length || !products.length || !locations.length)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
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

      {/* Error Banner */}
      {error && (
        <AlertBanner 
          title="Erreur" 
          message={error.message}
          severity="critical"
          onDismiss={() => setError(null)}
        />
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Order Details */}
        <Card title="Informations générales" className="md:col-span-2">
          <div className="space-y-4">
            {/* Reference Number */}
            <div>
              <label htmlFor="reference" className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de référence *
              </label>
              <input
                type="text"
                id="reference"
                name="reference"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="form-input"
                required
              />
            </div>

            {/* Supplier Selector */}
            <SupplierSelector 
              suppliers={suppliers}
              selectedSupplierId={selectedSupplierId}
              onSupplierChange={handleSupplierChange}
            />

            {/* Delivery Date */}
            <div>
              <label htmlFor="expectedDeliveryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Date de livraison prévue
              </label>
              <input
                type="date"
                id="expectedDeliveryDate"
                name="expectedDeliveryDate"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input"
                placeholder="Informations supplémentaires pour cette commande..."
              />
            </div>
          </div>
        </Card>

        {/* Order Summary */}
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
                onClick={() => saveOrder('ordered')}
                isLoading={isLoading}
                disabled={!selectedSupplierId || orderItems.length === 0}
              >
                Créer la commande
              </Button>
              <Button
                variant="outline"
                fullWidth
                className="mt-2"
                onClick={() => saveOrder('draft')}
                isLoading={isLoading}
                disabled={!selectedSupplierId || orderItems.length === 0}
              >
                Enregistrer comme brouillon
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Order Items */}
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

      {/* Add Item Modal */}
      {isAddItemModalOpen && (
        <AddOrderItemModal 
          isOpen={isAddItemModalOpen}
          onClose={() => setIsAddItemModalOpen(false)}
          onAddItem={handleAddItem}
          products={products}
          locations={locations}
          selectedSupplierId={selectedSupplierId}
          initialProductId={productToAdd ?? null}
        />
      )}
    </div>
  );
};

export default NewOrder;