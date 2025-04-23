// src/hooks/useInventory.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Location, InventorySummary, Product } from '../types';

// Type Alert pour le hook useAlerts
interface Alert {
  id: string;
  type: string;
  message: string;
  severity: string;
  createdAt: Date;
  isRead: boolean;
  product: {
    id: string;
    name: string;
    sku: string;
  } | null;
  variant: {
    id: string;
    name: string;
  } | null;
  location: {
    id: string;
    name: string;
  } | null;
}

// Type Order pour le hook useOrders
interface Order {
  id: string;
  referenceNumber: string;
  status: string;
  supplier: {
    id: string;
    name: string;
  };
  orderedBy: {
    id: string;
    name: string;
    email: string;
  };
  orderedDate: Date | null;
  expectedDeliveryDate: Date | null;
  receivedDate: Date | null;
  notes: string;
  createdAt: Date;
}

export const useInventory = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLocationsWithInventory = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer tous les lieux actifs
        const { data: locationsData, error: locationsError } = await supabase
          .from('locations')
          .select('*')
          .eq('is_active', true);
        
        if (locationsError) throw locationsError;
        
        // Pour chaque lieu, récupérer les produits avec leur stock
        const locationsWithProducts = await Promise.all(
          locationsData.map(async (location) => {
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
                  warning_stock_level,
                  category_id,
                  categories (name)
                ),
                product_variants (
                  id,
                  variant_name,
                  attributes
                )
              `)
              .eq('location_id', location.id)
              .order('quantity', { ascending: false })
              .limit(10);
            
            if (inventoryError) throw inventoryError;
            
            // Transformer les données pour un format plus facile à utiliser
            const products = inventoryData.map(item => ({
              id: item.products.id,
              name: item.products.name,
              sku: item.products.sku,
              description: item.products.description,
              quantity: item.quantity,
              reservedQuantity: item.reserved_quantity,
              unitOfMeasure: item.products.unit_of_measure,
              minStockLevel: item.products.min_stock_level,
              warningStockLevel: item.products.warning_stock_level,
              category: item.products.categories?.name,
              variant: item.product_variants ? {
                id: item.product_variants.id,
                name: item.product_variants.variant_name,
                attributes: item.product_variants.attributes
              } : null,
              details: item.product_variants 
                ? `${item.products.sku} - ${item.product_variants.variant_name}`
                : item.products.sku
            }));
            
            return {
              ...location,
              products
            };
          })
        );
        
        setLocations(locationsWithProducts);
        
        // Calculer les statistiques d'inventaire
        const totalItems = locationsWithProducts.reduce(
          (sum, location) => sum + location.products.reduce(
            (locSum: number, product: any) => locSum + product.quantity, 0
          ), 0
        );
        
        // Items under min stock level (to order)
        const itemsToOrder = locationsWithProducts.reduce(
          (sum, location) => sum + location.products.filter(
            (product: any) => product.quantity <= product.minStockLevel
          ).length, 0
        );
        
        // Estimation de la valeur des commandes à venir (mock - à remplacer par des données réelles)
        const estimatedOrderValue = 1250; // Exemple de valeur
        
        setInventorySummary({
          totalItems,
          itemsToOrder,
          estimatedOrderValue,
          locationsCount: locationsWithProducts.length
        });
        
      } catch (err) {
        console.error('Error fetching inventory:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLocationsWithInventory();
  }, []);
  
  return { locations, inventorySummary, isLoading, error };
};

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [criticalAlertsCount, setCriticalAlertsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer toutes les alertes non lues
        const { data, error: alertsError } = await supabase
          .from('alerts')
          .select(`
            *,
            products (
              id,
              name,
              sku
            ),
            product_variants (
              id,
              variant_name
            ),
            locations (
              id,
              name
            )
          `)
          .eq('is_read', false)
          .order('created_at', { ascending: false });
        
        if (alertsError) throw alertsError;
        
        // Transformer les données
        const formattedAlerts: Alert[] = data.map(alert => ({
          id: alert.id,
          type: alert.alert_type,
          message: alert.message,
          severity: alert.severity,
          createdAt: new Date(alert.created_at),
          isRead: alert.is_read,
          product: alert.products ? {
            id: alert.products.id,
            name: alert.products.name,
            sku: alert.products.sku
          } : null,
          variant: alert.product_variants ? {
            id: alert.product_variants.id,
            name: alert.product_variants.variant_name
          } : null,
          location: alert.locations ? {
            id: alert.locations.id,
            name: alert.locations.name
          } : null
        }));
        
        setAlerts(formattedAlerts);
        
        // Compter les alertes critiques
        const criticalCount = formattedAlerts.filter(alert => alert.severity === 'critical').length;
        setCriticalAlertsCount(criticalCount);
        
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAlerts();
    
    // Mettre en place un listener Supabase pour les nouvelles alertes
    const alertsSubscription = supabase
      .channel('public:alerts')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'alerts' 
      }, () => {
        fetchAlerts(); // Recharger les alertes lors d'une insertion
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(alertsSubscription);
    };
  }, []);
  
  // Fonction pour marquer une alerte comme lue
  const markAlertAsRead = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId);
      
      if (error) throw error;
      
      // Mettre à jour l'état local
      setAlerts(prevAlerts => 
        prevAlerts.filter(alert => alert.id !== alertId)
      );
      
      // Recalculer le nombre d'alertes critiques
      setCriticalAlertsCount(prev => {
        const alertToRemove = alerts.find(a => a.id === alertId);
        if (alertToRemove && alertToRemove.severity === 'critical') {
          return prev - 1;
        }
        return prev;
      });
      
    } catch (err) {
      console.error('Error marking alert as read:', err);
      return false;
    }
    
    return true;
  };
  
  return { 
    alerts, 
    criticalAlertsCount, 
    isLoading, 
    error,
    markAlertAsRead
  };
};

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
              name,
              contact_name,
              email,
              phone
            ),
            profiles!ordered_by (
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
          notes: order.notes,
          supplier: {
            id: order.suppliers.id,
            name: order.suppliers.name
          },
          orderedBy: {
            id: order.profiles.id,
            name: order.profiles.full_name,
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

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [expiredProductsCount, setExpiredProductsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer tous les produits
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              id,
              name
            )
          `);
        
        if (productsError) throw productsError;
        
        // Récupérer les lots expirés
        const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        
        const { data: expiredBatchesData, error: batchesError } = await supabase
          .from('batches')
          .select(`
            id,
            product_id,
            batch_number,
            expiry_date,
            batch_inventory (
              quantity
            )
          `)
          .lt('expiry_date', today)
          .gt('batch_inventory.quantity', 0);
        
        if (batchesError) throw batchesError;
        
        // Compter le nombre de produits avec des lots expirés
        const expiredProductIds = new Set(
          expiredBatchesData
            .filter(batch => 
              batch.batch_inventory && 
              batch.batch_inventory.some((inv: any) => inv.quantity > 0)
            )
            .map(batch => batch.product_id)
        );
        
        setExpiredProductsCount(expiredProductIds.size);
        
        // Transformer les données des produits
        const formattedProducts: Product[] = productsData.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          sku: product.sku,
          barcode: product.barcode,
          unitOfMeasure: product.unit_of_measure,
          minStockLevel: product.min_stock_level,
          warningStockLevel: product.warning_stock_level,
          hasExpiry: product.has_expiry,
          category: product.categories ? {
            id: product.categories.id,
            name: product.categories.name
          } : null
        }));
        
        setProducts(formattedProducts);
        
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  return { products, expiredProductsCount, isLoading, error };
};