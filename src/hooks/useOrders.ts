// src/hooks/useOrders.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Order } from '../types';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer les commandes en cours
        const { data, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            suppliers (
              id,
              name
            ),
            profiles (
              id,
              full_name,
              email
            )
          `)
          .in('status', ['pending', 'ordered', 'partially_received'])
          .order('created_at', { ascending: false });
        
        if (ordersError) throw ordersError;
        
        // Formatter les données
        const formattedOrders: Order[] = data.map(order => ({
          id: order.id,
          referenceNumber: order.reference_number,
          status: order.status,
          createdAt: new Date(order.created_at),
          orderedDate: order.ordered_date ? new Date(order.ordered_date) : null,
          expectedDeliveryDate: order.expected_delivery_date ? new Date(order.expected_delivery_date) : null,
          receivedDate: order.received_date ? new Date(order.received_date) : null,
          notes: order.notes || undefined,
          supplier: {
            id: order.suppliers.id,
            name: order.suppliers.name
          },
          orderedBy: {
            id: order.profiles.id,
            name: order.profiles.full_name || order.profiles.email,
            email: order.profiles.email
          }
        }));
        
        setOrders(formattedOrders);
        setPendingOrdersCount(formattedOrders.length);
        
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  return { orders, pendingOrdersCount, isLoading, error };
};