// src/pages/NotFound.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Revenir à la page précédente
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* Illustration ou icône */}
        <div className="mb-6">
          <div className="flex justify-center">
            <svg className="w-32 h-32 text-primary-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Texte d'erreur */}
        <h1 className="text-9xl font-extrabold text-primary-600">404</h1>
        <h2 className="mt-2 text-3xl font-bold text-gray-900">Page introuvable</h2>
        <p className="mt-4 text-base text-gray-600 max-w-xs mx-auto">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>

        {/* Actions */}
        <div className="mt-8 space-y-4">
          <Link to="/dashboard">
            <Button variant="primary" fullWidth>
              Retour au tableau de bord
            </Button>
          </Link>
          
          <button
            onClick={handleGoBack}
            className="mt-4 w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Retour à la page précédente
          </button>
        </div>

        {/* Suggestion */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Si le problème persiste, veuillez contacter l'administrateur système.</p>
          <p className="mt-2">
            <Link to="/dashboard" className="text-primary-600 hover:text-primary-500">
              Accueil
            </Link>
            {' · '}
            <Link to="/products" className="text-primary-600 hover:text-primary-500">
              Produits
            </Link>
            {' · '}
            <Link to="/inventory" className="text-primary-600 hover:text-primary-500">
              Inventaire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;