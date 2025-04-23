// src/pages/Locations/Locations.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/common/Button';
import { Location } from '../../types';

const Locations: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        const formattedLocations: Location[] = data.map(location => ({
          id: location.id,
          name: location.name,
          description: location.description || undefined,
          address: location.address || undefined,
          isActive: location.is_active
        }));
        
        setLocations(formattedLocations);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLocations();
  }, []);

  const handleAddLocation = () => {
    navigate('/locations/new');
  };

  const handleViewLocation = (id: string) => {
    navigate(`/locations/${id}`);
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
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Erreur lors du chargement des lieux: {error.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Lieux de stockage</h1>
        <div className="mt-4 md:mt-0">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map(location => (
          <div 
            key={location.id} 
            className="bg-white shadow-md rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleViewLocation(location.id)}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">{location.name}</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  location.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {location.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
              
              {location.description && (
                <p className="text-sm text-gray-600 mb-4">{location.description}</p>
              )}
              
              {location.address && (
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Adresse: </span>
                  {location.address}
                </div>
              )}
            </div>
          </div>
        ))}

        {locations.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            Aucun lieu de stockage trouvé. Ajoutez votre premier lieu en cliquant sur le bouton "Ajouter un lieu".
          </div>
        )}
      </div>
    </div>
  );
};

export default Locations;

