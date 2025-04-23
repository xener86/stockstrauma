// src/pages/Alerts/Alerts.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Alert } from '../../types';
import { Button } from '../../components/common/Button';

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setIsLoading(true);
        
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
          .order('created_at', { ascending: false });
        
        if (alertsError) throw alertsError;
        
        // Transformer les données avec le bon typage
        const formattedAlerts: Alert[] = data.map(alert => ({
          id: alert.id,
          type: alert.alert_type as "low_stock" | "expiry" | "order_update" | "system",
          message: alert.message,
          severity: alert.severity,
          createdAt: new Date(alert.created_at),
          isRead: alert.is_read,
          product: alert.products ? {
            id: alert.products.id,
            name: alert.products.name,
            sku: alert.products.sku || undefined  // Convertir null en undefined
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
        
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAlerts();
  }, []);

  const markAsRead = async (alertId: string) => {
    try {
      await supabase
        .from('alerts')
        .update({ is_read: true })
        .eq('id', alertId);
      
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, isRead: true } : alert
      ));
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('alerts')
        .update({ is_read: true })
        .in('id', alerts.filter(a => !a.isRead).map(a => a.id));
      
      setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
    } catch (err) {
      console.error('Error marking all alerts as read:', err);
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'low_stock':
        return 'Stock bas';
      case 'expiry':
        return 'DLUO proche';
      case 'order_update':
        return 'Mise à jour commande';
      case 'system':
        return 'Système';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const unreadAlerts = alerts.filter(a => !a.isRead);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Alertes</h1>
          <p className="mt-1 text-sm text-gray-500">
            {unreadAlerts.length} alerte{unreadAlerts.length !== 1 ? 's' : ''} non lue{unreadAlerts.length !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadAlerts.length > 0 && (
          <div className="mt-4 md:mt-0">
            <Button 
              variant="outline"
              onClick={markAllAsRead}
            >
              Marquer tout comme lu
            </Button>
          </div>
        )}
      </div>

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
                Erreur lors du chargement des alertes: {error.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500">Aucune alerte à afficher.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`p-4 rounded-lg border shadow-sm ${getSeverityClass(alert.severity)} ${
                alert.isRead ? 'opacity-60' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                      {getTypeText(alert.type)}
                    </span>
                    <span className="text-sm font-medium">
                      {alert.message}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {alert.createdAt.toLocaleString('fr-FR')}
                  </div>
                  <div className="mt-2">
                    {alert.product && (
                      <div className="text-sm">
                        <span className="font-medium">Produit:</span>{' '}
                        <button 
                          className="text-primary-600 hover:underline"
                          onClick={() => navigate(`/products/${alert.product?.id}`)}
                        >
                          {alert.product.name}
                        </button>
                        {alert.variant && ` (${alert.variant.name})`}
                      </div>
                    )}
                    {alert.location && (
                      <div className="text-sm">
                        <span className="font-medium">Lieu:</span>{' '}
                        <button 
                          className="text-primary-600 hover:underline"
                          onClick={() => navigate(`/locations/${alert.location?.id}`)}
                        >
                          {alert.location.name}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex">
                  {!alert.isRead && (
                    <button
                      className="text-sm text-gray-500 hover:text-gray-700"
                      onClick={() => markAsRead(alert.id)}
                    >
                      Marquer comme lu
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Alerts;