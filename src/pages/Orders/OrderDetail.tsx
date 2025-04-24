// src/pages/Orders/OrderDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { AlertBanner } from '../../components/common/AlertBanner';
import { Order, OrderItem } from '../../types';

// Définition explicite du type pour le statut de commande
type OrderStatus = 'draft' | 'ordered' | 'pending' | 'partially_received' | 'received' | 'cancelled';

interface OrderWithItems extends Order {
  items: OrderItem[];
  totalQuantity: number;
  receivedQuantity: number;
  totalPrice: number;
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'ordered':
      return 'bg-blue-100 text-blue-800';
    case 'partially_received':
      return 'bg-yellow-100 text-yellow-800';
    case 'received':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
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

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    location.state?.success ? location.state.message : null
  );

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            suppliers (
              id,
              name,
              contact_name,
              email,
              phone
            ),
            ordered_by_user:profiles!ordered_by (
              id,
              full_name,
              email
            )
          `)
          .eq('id', id)
          .single();
        
        if (orderError) throw orderError;
        
        if (!orderData) {
          throw new Error('Commande non trouvée');
        }
        
        // Fetch order items
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
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
            destination:locations!destination_location_id (
              id,
              name
            )
          `)
          .eq('order_id', id);
        
        if (itemsError) throw itemsError;
        
        // Format order items
        const formattedItems: OrderItem[] = itemsData.map(item => ({
          id: item.id,
          orderId: item.order_id,
          productId: item.product_id,
          variantId: item.variant_id || undefined,
          quantity: item.quantity,
          receivedQuantity: item.received_quantity,
          unitPrice: item.unit_price || undefined,
          destinationLocationId: item.destination_location_id,
          notes: item.notes || undefined,
          product: {
            name: item.products.name,
            sku: item.products.sku || undefined  // Convertir null en undefined
          },
          variant: item.product_variants ? {
            name: item.product_variants.variant_name
          } : undefined,
          destination: {
            name: item.destination.name
          }
        }));
        
        // Calculate summary statistics
        const totalQuantity = formattedItems.reduce((sum, item) => sum + item.quantity, 0);
        const receivedQuantity = formattedItems.reduce((sum, item) => sum + item.receivedQuantity, 0);
        const totalPrice = formattedItems.reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0);
        
        // Format complete order object
        const formattedOrder: OrderWithItems = {
          id: orderData.id,
          referenceNumber: orderData.reference_number,
          status: orderData.status as OrderStatus, // Cast explicite au type OrderStatus
          supplier: {
            id: orderData.suppliers.id,
            name: orderData.suppliers.name
          },
          orderedBy: {
            id: orderData.ordered_by_user.id,
            name: orderData.ordered_by_user.full_name || orderData.ordered_by_user.email,
            email: orderData.ordered_by_user.email
          },
          orderedDate: orderData.ordered_date ? new Date(orderData.ordered_date) : null,
          expectedDeliveryDate: orderData.expected_delivery_date ? new Date(orderData.expected_delivery_date) : null,
          receivedDate: orderData.received_date ? new Date(orderData.received_date) : null,
          notes: orderData.notes || undefined,
          createdAt: new Date(orderData.created_at),
          items: formattedItems,
          totalQuantity,
          receivedQuantity,
          totalPrice
        };
        
        setOrder(formattedOrder);
        
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id, location.state]);

  const handleReceiveOrder = () => {
    navigate(`/orders/${id}/receive`);
  };

  const handleEditOrder = () => {
    navigate(`/orders/${id}/edit`);
  };

  const handleCancelOrder = async () => {
    if (!id || !order) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      try {
        setIsLoading(true);
        
        const { error } = await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', id);
        
        if (error) throw error;
        
        // Update local state
        setOrder({
          ...order,
          status: 'cancelled' as OrderStatus // Cast explicite au type OrderStatus
        });
        
        setSuccessMessage('La commande a été annulée avec succès.');
        
      } catch (err) {
        console.error('Error cancelling order:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const canReceiveOrder = (status: OrderStatus) => {
    return status === 'ordered' || status === 'partially_received';
  };

  const canEditOrder = (status: OrderStatus) => {
    return status === 'draft' || status === 'pending';
  };

  const canCancelOrder = (status: OrderStatus) => {
    return status === 'draft' || status === 'pending' || status === 'ordered';
  };

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
          message={`Impossible de charger les détails de la commande: ${error.message}`}
          severity="critical"
          onAction={() => navigate('/orders')}
          actionLabel="Retour aux commandes"
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <AlertBanner 
          title="Commande non trouvée" 
          message="La commande demandée n'existe pas ou a été supprimée."
          severity="warning"
          onAction={() => navigate('/orders')}
          actionLabel="Retour aux commandes"
        />
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {successMessage && (
        <AlertBanner 
          title="Succès" 
          message={successMessage}
          severity="info"
          onDismiss={() => setSuccessMessage(null)}
        />
      )}
      
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
              Commande {order.referenceNumber}
            </h1>
          </div>
          <div className="mt-1 flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
              {getStatusText(order.status)}
            </span>
            <span className="ml-2 text-sm text-gray-500">
              {order.createdAt.toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          {canEditOrder(order.status) && (
            <Button 
              variant="outline"
              onClick={handleEditOrder}
            >
              Modifier
            </Button>
          )}
          
          {canReceiveOrder(order.status) && (
            <Button 
              variant="primary"
              onClick={handleReceiveOrder}
            >
              Réceptionner
            </Button>
          )}
          
          {canCancelOrder(order.status) && (
            <Button 
              variant="danger"
              onClick={handleCancelOrder}
            >
              Annuler
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card title="Informations générales" className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Fournisseur</h4>
              <p className="mt-1 text-sm text-gray-900">{order.supplier.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Commandé par</h4>
              <p className="mt-1 text-sm text-gray-900">{order.orderedBy.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Date de commande</h4>
              <p className="mt-1 text-sm text-gray-900">
                {order.orderedDate ? order.orderedDate.toLocaleDateString('fr-FR') : 'Non commandé'}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Livraison prévue</h4>
              <p className="mt-1 text-sm text-gray-900">
                {order.expectedDeliveryDate ? order.expectedDeliveryDate.toLocaleDateString('fr-FR') : 'Non définie'}
              </p>
            </div>
            {order.receivedDate && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Date de réception</h4>
                <p className="mt-1 text-sm text-gray-900">{order.receivedDate.toLocaleDateString('fr-FR')}</p>
              </div>
            )}
            {order.notes && (
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                <p className="mt-1 text-sm text-gray-900">{order.notes}</p>
              </div>
            )}
          </div>
        </Card>

        <Card title="Résumé">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Total articles</h4>
              <p className="mt-1 text-lg font-medium text-gray-900">{order.totalQuantity}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Reçus</h4>
              <p className="mt-1 text-lg font-medium text-primary-600">{order.receivedQuantity}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Montant total</h4>
              <p className="mt-1 text-lg font-medium text-gray-900">{order.totalPrice.toFixed(2)} €</p>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    order.status === 'cancelled' 
                      ? 'bg-red-500' 
                      : order.receivedQuantity >= order.totalQuantity 
                        ? 'bg-green-500' 
                        : 'bg-primary-600'
                  }`}
                  style={{ width: `${order.status === 'cancelled' ? 100 : (order.receivedQuantity / order.totalQuantity) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {order.status === 'cancelled' 
                  ? 'Commande annulée' 
                  : `${Math.round((order.receivedQuantity / order.totalQuantity) * 100)}% reçus`
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Articles de la commande</h2>
        
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
                  Destination
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantité
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reçu
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix unitaire
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.product?.name || 'Produit inconnu'}</div>
                    {item.product?.sku && (
                      <div className="text-xs text-gray-500">{item.product.sku}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.variant ? item.variant.name : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.destination?.name || 'Destination inconnue'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${
                      item.receivedQuantity === item.quantity
                        ? 'font-medium text-green-600'
                        : item.receivedQuantity > 0
                        ? 'font-medium text-yellow-600'
                        : 'text-gray-500'
                    }`}>
                      {item.receivedQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.unitPrice ? `${item.unitPrice.toFixed(2)} €` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.unitPrice ? `${(item.unitPrice * item.quantity).toFixed(2)} €` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;