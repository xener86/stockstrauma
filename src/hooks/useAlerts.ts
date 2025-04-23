// src/hooks/useAlerts

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Alert } from '../types';

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
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'alerts' 
        },
        () => {
          fetchAlerts(); // Recharger les alertes lors d'une insertion
        }
      )
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