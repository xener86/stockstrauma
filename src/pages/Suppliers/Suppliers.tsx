// src/pages/Suppliers/Suppliers.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';

const Suppliers: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Fournisseurs</h1>
        <div className="mt-4 md:mt-0">
          <Button 
            variant="primary"
            onClick={() => navigate('/suppliers/new')}
          >
            Ajouter un fournisseur
          </Button>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-8 text-center">
        <p className="text-gray-500 mb-4">Cette page est en cours de développement.</p>
        <p className="text-gray-700">La gestion des fournisseurs sera disponible dans une prochaine version.</p>
      </div>
    </div>
  );
};

export default Suppliers;
