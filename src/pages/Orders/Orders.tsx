// src/pages/Orders/Orders.tsx (corrigé)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Order, Supplier } from '../../types';
import { Button } from '../../components/common/Button';
import { OrdersFilters } from './components/OrdersFilters';
import { OrdersTable } from './components/OrdersTable';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Filtres
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les fournisseurs pour les filtres
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
      
      // Charger les commandes
      await fetchOrders();
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      // Construire la requête de base
      let query = supabase
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
        .order('created_at', { ascending: false });
      
      // Appliquer les filtres
      if (selectedStatus) {
        query = query.eq('status', selectedStatus);
      }
      
      if (selectedSupplierId) {
        query = query.eq('supplier_id', selectedSupplierId);
      }
      
      if (dateRange.start && dateRange.end) {
        const startDate = dateRange.start.toISOString();
        const endDate = dateRange.end.toISOString();
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transformer les données
      const formattedOrders: Order[] = data.map(order => ({
        id: order.id,
        referenceNumber: order.reference_number,
        status: order.status as Order['status'], // Cast explicite vers le type attendu
        supplier: {
          id: order.suppliers.id,
          name: order.suppliers.name
        },
        orderedBy: {
          id: order.ordered_by_user.id,
          name: order.ordered_by_user.full_name || order.ordered_by_user.email,
          email: order.ordered_by_user.email
        },
        orderedDate: order.ordered_date ? new Date(order.ordered_date) : null,
        expectedDeliveryDate: order.expected_delivery_date ? new Date(order.expected_delivery_date) : null,
        receivedDate: order.received_date ? new Date(order.received_date) : null,
        notes: order.notes || undefined,
        createdAt: new Date(order.created_at)
      }));
      
      setOrders(formattedOrders);
      
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  const handleFilterChange = async (
    status: string | null,
    supplierId: string | null,
    newDateRange: { start: Date | null; end: Date | null }
  ) => {
    setSelectedStatus(status);
    setSelectedSupplierId(supplierId);
    setDateRange(newDateRange);
    
    try {
      setIsLoading(true);
      
      // Construire la requête de base avec les nouveaux filtres
      let query = supabase
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
        .order('created_at', { ascending: false });
      
      // Appliquer les filtres
      if (status) {
        query = query.eq('status', status);
      }
      
      if (supplierId) {
        query = query.eq('supplier_id', supplierId);
      }
      
      if (newDateRange.start && newDateRange.end) {
        const startDate = newDateRange.start.toISOString();
        const endDate = newDateRange.end.toISOString();
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Transformer les données
      const formattedOrders: Order[] = data.map(order => ({
        id: order.id,
        referenceNumber: order.reference_number,
        status: order.status as Order['status'], // Cast explicite vers le type attendu
        supplier: {
          id: order.suppliers.id,
          name: order.suppliers.name
        },
        orderedBy: {
          id: order.ordered_by_user.id,
          name: order.ordered_by_user.full_name || order.ordered_by_user.email,
          email: order.ordered_by_user.email
        },
        orderedDate: order.ordered_date ? new Date(order.ordered_date) : null,
        expectedDeliveryDate: order.expected_delivery_date ? new Date(order.expected_delivery_date) : null,
        receivedDate: order.received_date ? new Date(order.received_date) : null,
        notes: order.notes || undefined,
        createdAt: new Date(order.created_at)
      }));
      
      setOrders(formattedOrders);
      
    } catch (err) {
      console.error('Error applying filters:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handleCreateOrder = () => {
    navigate('/orders/new');
  };

  const handleReceiveOrder = async (orderId: string) => {
    navigate(`/orders/${orderId}/receive`);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      try {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId);
        
        if (error) throw error;
        
        // Mettre à jour la liste des commandes
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status: 'cancelled' as Order['status'] } 
              : order
          )
        );
        
      } catch (err) {
        console.error('Error cancelling order:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Commandes</h1>
        <div className="mt-4 md:mt-0">
          <Button 
            variant="primary"
            onClick={handleCreateOrder}
            leftIcon={
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
            }
          >
            Nouvelle commande
          </Button>
        </div>
      </div>

      <OrdersFilters 
        suppliers={suppliers}
        selectedStatus={selectedStatus}
        selectedSupplierId={selectedSupplierId}
        dateRange={dateRange}
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
        <OrdersTable 
          orders={orders}
          isLoading={isLoading}
          onViewOrder={handleViewOrder}
          onReceiveOrder={handleReceiveOrder}
          onCancelOrder={handleCancelOrder}
        />
      </div>
    </div>
  );
};

export default Orders;