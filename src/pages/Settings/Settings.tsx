// src/pages/Settings/Settings.tsx
import React from 'react';
import { Card } from '../../components/common/Card';

const Settings: React.FC = () => {
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Paramètres</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configuration de l'application SOSStock
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card title="Configuration générale">
          <div className="p-4 text-center">
            <p className="text-gray-700 mb-4">
              La page de paramètres est en cours de développement.
            </p>
            <p className="text-gray-500">
              Cette fonctionnalité sera disponible dans une prochaine version.
            </p>
          </div>
        </Card>
        
        <Card title="Fonctionnalités à venir">
          <div className="space-y-3 p-2">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-gray-700">Configuration des alertes</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-gray-700">Personnalisation de l'interface</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-gray-700">Configuration des emails</span>
            </div>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span className="text-gray-700">Intégrations externes</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
