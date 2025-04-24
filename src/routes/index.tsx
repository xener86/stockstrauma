// src/routes/index.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout
import Layout from '../components/layout/Layout';

// Pages d'authentification
import Login from '../pages/Auth/Login';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import ResetPassword from '../pages/Auth/ResetPassword';

// Pages principales
import Dashboard from '../pages/Dashboard/Dashboard';
import Products from '../pages/Products/Products';
import ProductDetail from '../pages/Products/ProductDetail';
import Inventory from '../pages/Inventory/Inventory';
import Locations from '../pages/Locations/Locations';
import LocationDetail from '../pages/Locations/LocationDetail';
import Orders from '../pages/Orders/Orders';
import OrderDetail from '../pages/Orders/OrderDetail';
import Suppliers from '../pages/Suppliers/Suppliers';
import SupplierDetail from '../pages/Suppliers/SupplierDetail';
import Reports from '../pages/Reports/Reports';
import Alerts from '../pages/Alerts/Alerts';
import Users from '../pages/Users/Users';
import UserDetail from '../pages/Users/UserDetail';
import Settings from '../pages/Settings/Settings';
import NotFound from '../pages/NotFound';

// Route sécurisée qui vérifie si l'utilisateur est connecté
  interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'operator';
  }

  const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
    children, 
    requiredRole 
  }) => {
    const { profile, isLoading, session } = useAuth();
    const [timeout, setTimeout] = useState(false);
    
    // Ajouter un timeout pour éviter le chargement infini
    useEffect(() => {
      const timer = window.setTimeout(() => {
        console.log("Timeout de chargement authentification atteint");
        setTimeout(true);
      }, 5000); // 5 secondes de timeout
      
      return () => {
        window.clearTimeout(timer);
      };
    }, []);
    
    // Si on a atteint le timeout, rediriger vers login
    if (timeout && isLoading) {
      console.log("Redirection après timeout");
      return <Navigate to="/login" replace />;
    }
    
    // Si on est en train de charger, mais que le timeout n'est pas atteint
    if (isLoading && !timeout) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          <p className="ml-3 text-gray-600">Chargement...</p>
        </div>
      );
    }
    
    // Si on a une session mais pas de profil, considérer qu'on est connecté
    if (session && !profile) {
      console.log("Session trouvée mais pas de profil - accès autorisé");
      return <>{children}</>;
    }
    
    // Si l'utilisateur n'est pas connecté, rediriger vers login
    if (!profile && !session) {
      console.log("Ni session ni profil - redirection vers login");
      return <Navigate to="/login" replace />;
    }
    
    // Si un rôle spécifique est requis, vérifier que l'utilisateur a ce rôle
    if (requiredRole && profile?.role !== requiredRole) {
      console.log("Rôle incorrect - redirection vers dashboard");
      return <Navigate to="/dashboard" replace />;
    }
    
    // Si tout est OK, afficher le contenu de la route
    console.log("Accès autorisé");
    return <>{children}</>;
  };
// Configuration des routes de l'application
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Routes protégées dans le layout principal */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Redirection de la racine vers le tableau de bord */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Routes accessibles à tous les utilisateurs connectés */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="locations" element={<Locations />} />
        <Route path="locations/:id" element={<LocationDetail />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="suppliers/:id" element={<SupplierDetail />} />
        <Route path="reports" element={<Reports />} />
        <Route path="alerts" element={<Alerts />} />
        
        {/* Routes accessibles uniquement aux administrateurs */}
        <Route 
          path="users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Users />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="users/:id" 
          element={
            <ProtectedRoute requiredRole="admin">
              <UserDetail />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="settings" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Settings />
            </ProtectedRoute>
          } 
        />
      </Route>
      
      {/* Route 404 pour les URLs non reconnues */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;