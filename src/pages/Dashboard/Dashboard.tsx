// src/pages/Dashboard/Dashboard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LocationCard } from '../../components/dashboard/LocationCard';
import { AlertBanner } from '../../components/common/AlertBanner';
import { useInventory } from '../../hooks/useInventory';
import { useAlerts } from '../../hooks/useAlerts';
import { useOrders } from '../../hooks/useOrders';
import { useProducts } from '../../hooks/useProducts';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { locations, inventorySummary, isLoading: isInventoryLoading } = useInventory();
  const { criticalAlertsCount, isLoading: isAlertsLoading } = useAlerts();
  const { pendingOrdersCount, isLoading: isOrdersLoading } = useOrders();
  const { expiredProductsCount, isLoading: isProductsLoading } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter locations based on search query
  const filteredLocations = locations?.filter(location => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.products?.some(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddLocation = () => {
    navigate('/locations/new');
  };

  const handleViewAlerts = () => {
    navigate('/alerts');
  };

  if (isInventoryLoading || isAlertsLoading || isOrdersLoading || isProductsLoading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {criticalAlertsCount > 0 && (
        <AlertBanner 
          title={`${criticalAlertsCount} produit${criticalAlertsCount > 1 ? 's' : ''} en alerte`}
          message="Certains produits sont en dessous du seuil critique ou ont une DLUO proche."
          severity="critical"
          onAction={handleViewAlerts}
          actionLabel="Voir"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card title="Total des articles">
          <div className="text-3xl font-semibold text-primary-700">
            {inventorySummary?.totalItems || 0}
          </div>
          <div className="text-sm text-gray-500">
            Répartis sur {locations?.length || 0} lieu{locations?.length !== 1 ? 'x' : ''}
          </div>
        </Card>

        <Card title="Articles à commander">
          <div className="text-3xl font-semibold text-primary-700">
            {inventorySummary?.itemsToOrder || 0}
          </div>
          <div className="text-sm text-gray-500">
            {inventorySummary?.estimatedOrderValue 
              ? `Estimés à ${inventorySummary.estimatedOrderValue.toLocaleString()} €` 
              : 'Aucune estimation disponible'}
          </div>
        </Card>

        <Card title="Commandes en cours">
          <div className="text-3xl font-semibold text-primary-700">
            {pendingOrdersCount || 0}
          </div>
          <div className="text-sm text-gray-500">
            Arrivée prévue cette semaine
          </div>
        </Card>

        <Card title="Articles périmés">
          <div className="text-3xl font-semibold text-primary-700">
            {expiredProductsCount || 0}
          </div>
          <div className="text-sm text-gray-500">
            À retirer du stock
          </div>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Lieux de stockage</h2>
        <Button 
          variant="primary"
          onClick={handleAddLocation}
          leftIcon={
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
          }
        >
          Ajouter un lieu
        </Button>
      </div>

      <div className="relative mb-6">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </span>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Rechercher un produit, un lieu..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations?.map((location) => (
          <LocationCard 
            key={location.id}
            location={location}
            onManageClick={() => navigate(`/locations/${location.id}`)}
          />
        ))}

        {filteredLocations?.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            Aucun lieu de stockage ne correspond à votre recherche.
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;