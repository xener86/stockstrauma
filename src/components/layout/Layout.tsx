// src/components/layout/Layout.tsx
import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAlerts } from '../../hooks/useAlerts';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, isActive, onClick }) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 rounded-lg mb-1 transition-colors ${
        isActive
          ? 'bg-primary-600 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <span className="mr-3">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export const Layout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const { criticalAlertsCount } = useAlerts();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Routes du menu
  const routes = [
    {
      path: '/dashboard',
      label: 'Tableau de bord',
      icon: '📊',
      roles: ['admin', 'operator']
    },
    {
      path: '/products',
      label: 'Produits',
      icon: '📦',
      roles: ['admin', 'operator']
    },
    {
      path: '/inventory',
      label: 'Stock & Mouvements',
      icon: '📋',
      roles: ['admin', 'operator']
    },
    {
      path: '/locations',
      label: 'Lieux de stockage',
      icon: '🏢',
      roles: ['admin', 'operator']
    },
    {
      path: '/orders',
      label: 'Commandes',
      icon: '🛒',
      roles: ['admin', 'operator']
    },
    {
      path: '/suppliers',
      label: 'Fournisseurs',
      icon: '🏭',
      roles: ['admin', 'operator']
    },
    {
      path: '/reports',
      label: 'Rapports',
      icon: '📈',
      roles: ['admin', 'operator']
    },
    {
      path: '/alerts',
      label: 'Alertes',
      icon: '🔔',
      badge: criticalAlertsCount > 0 ? criticalAlertsCount : undefined,
      roles: ['admin', 'operator']
    },
    {
      path: '/users',
      label: 'Utilisateurs',
      icon: '👥',
      roles: ['admin']
    },
    {
      path: '/settings',
      label: 'Paramètres',
      icon: '⚙️',
      roles: ['admin']
    }
  ];

  // Filtrer les routes en fonction du rôle de l'utilisateur
  const filteredRoutes = routes.filter(route => 
    profile ? route.roles.includes(profile.role) : false
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-600 text-white mr-3">
              📦
            </div>
            <span className="text-xl font-bold text-primary-600">SOSStock</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          {filteredRoutes.map(route => (
            <div key={route.path} className="relative">
              <SidebarLink
                to={route.path}
                icon={route.icon}
                label={route.label}
                isActive={location.pathname === route.path}
              />
              {route.badge && (
                <span className="absolute top-2 right-4 flex items-center justify-center w-5 h-5 bg-danger-500 text-white text-xs rounded-full">
                  {route.badge}
                </span>
              )}
            </div>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
              {profile?.fullName 
                ? profile.fullName.charAt(0).toUpperCase() 
                : profile?.email.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="font-medium text-sm">{profile?.fullName || profile?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Se déconnecter
          </button>
        </div>
      </aside>
      
      {/* Overlay pour mobile */}
      {mobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-800 bg-opacity-50 z-10"
          onClick={closeMobileSidebar}
        ></div>
      )}
      
      {/* Sidebar - mobile */}
      <aside className={`md:hidden fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-20 transform ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-600 text-white mr-3">
              📦
            </div>
            <span className="text-xl font-bold text-primary-600">SOSStock</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          {filteredRoutes.map(route => (
            <div key={route.path} className="relative">
              <SidebarLink
                to={route.path}
                icon={route.icon}
                label={route.label}
                isActive={location.pathname === route.path}
                onClick={closeMobileSidebar}
              />
              {route.badge && (
                <span className="absolute top-2 right-4 flex items-center justify-center w-5 h-5 bg-danger-500 text-white text-xs rounded-full">
                  {route.badge}
                </span>
              )}
            </div>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold">
              {profile?.fullName 
                ? profile.fullName.charAt(0).toUpperCase() 
                : profile?.email.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3">
              <p className="font-medium text-sm">{profile?.fullName || profile?.email}</p>
              <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Se déconnecter
          </button>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={toggleMobileSidebar}
                className="md:hidden text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-4 md:ml-0 text-lg font-semibold text-gray-700">
                {filteredRoutes.find(route => route.path === location.pathname)?.label || 'SOSStock'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/alerts" className="relative text-gray-500 hover:text-gray-700">
                <span className="text-xl">🔔</span>
                {criticalAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-danger-500 text-white text-xs rounded-full">
                    {criticalAlertsCount}
                  </span>
                )}
              </Link>
              
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-semibold md:hidden">
                  {profile?.fullName 
                    ? profile.fullName.charAt(0).toUpperCase() 
                    : profile?.email.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;  