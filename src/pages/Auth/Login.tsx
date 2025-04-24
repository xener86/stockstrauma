// src/pages/Auth/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsCheckingAuth(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("Utilisateur déjà connecté, redirection vers le tableau de bord");
          navigate('/dashboard');
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Vérifier si l'utilisateur vient de se connecter
  useEffect(() => {
    if (user) {
      console.log("Utilisateur connecté, redirection vers le tableau de bord");
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation des champs
    if (!email.trim()) {
      setErrorMessage('Veuillez saisir votre email.');
      return;
    }
    
    if (!password) {
      setErrorMessage('Veuillez saisir votre mot de passe.');
      return;
    }
    
    try {
      setErrorMessage(null);
      
      // Tenter la connexion via AuthContext
      const { success, error } = await signIn(email, password);
      
      if (success) {
        // La redirection est gérée par l'useEffect qui surveille user
        console.log("Connexion réussie");
      } else if (error) {
        // Traiter les différents types d'erreurs
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Email ou mot de passe incorrect.');
        } else if (error.message.includes('rate limit')) {
          setErrorMessage('Trop de tentatives. Veuillez réessayer plus tard.');
        } else {
          setErrorMessage(`Erreur de connexion: ${error.message}`);
        }
      }
    } catch (err) {
      console.error('Erreur inattendue lors de la connexion:', err);
      setErrorMessage('Une erreur inattendue est survenue. Veuillez réessayer.');
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary-600 text-white text-2xl">
            📦
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          SOSStock
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connexion à votre espace de gestion de stock
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {errorMessage}
                    </h3>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                  Mot de passe oublié?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Informations de connexion
                </span>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Pour les besoins de démonstration:</p>
              <p className="mt-1">Email: <span className="font-medium">demo@example.com</span></p>
              <p className="mt-1">Mot de passe: <span className="font-medium">password123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;