// src/context/AuthContext.tsx - Version corrigée
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, fetchUserProfile } from '../lib/supabase';
import { User as AppUser } from '../types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: AppUser | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<{ 
    success: boolean; 
    error: Error | null;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    success: boolean;
    error: Error | null;
  }>;
  updateProfile: (updates: Partial<{
    fullName: string;
    avatarUrl: string;
  }>) => Promise<{
    success: boolean;
    error: Error | null;
  }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);

        // Récupérer la session initiale
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        setSession(initialSession);
        
        if (initialSession?.user) {
          setUser(initialSession.user);
          
          // Récupérer le profil utilisateur
          const { data: profileData, error: profileError } = await fetchUserProfile(initialSession.user.id);
          
          if (profileError) {
            console.warn("Erreur lors de la récupération du profil:", profileError);
          } else if (profileData) {
            setProfile({
              id: profileData.id,
              email: profileData.email,
              fullName: profileData.full_name || undefined,
              avatarUrl: profileData.avatar_url || undefined,
              role: profileData.role as 'admin' | 'operator'
            });
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
        setInitialized(true);
      }
    };

    initAuth();

    // Configure le listener pour les changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);
        setUser(newSession?.user || null);
        
        if (newSession?.user) {
          try {
            const { data, error } = await fetchUserProfile(newSession.user.id);
            
            if (error) {
              throw error;
            }
            
            if (data) {
              setProfile({
                id: data.id,
                email: data.email,
                fullName: data.full_name || undefined,
                avatarUrl: data.avatar_url || undefined,
                role: data.role as 'admin' | 'operator'
              });
            } else {
              setProfile(null);
            }
          } catch (err) {
            console.error('Error fetching user profile:', err);
            setError(err instanceof Error ? err : new Error(String(err)));
          }
        } else {
          setProfile(null);
        }
      }
    );

    // Nettoyer le listener à la désinscription
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fonction de connexion
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      return { success: true, error: null };
    } catch (err) {
      console.error('Error signing in:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setProfile(null);
      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de réinitialisation du mot de passe
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      return { success: true, error: null };
    } catch (err) {
      console.error('Error resetting password:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (updates: Partial<{
    fullName: string;
    avatarUrl: string;
  }>) => {
    if (!user) {
      return { success: false, error: new Error('No user logged in') };
    }

    try {
      setIsLoading(true);
      
      // Convertir les clés en format snake_case pour Supabase
      const supabaseUpdates: Record<string, any> = {};
      if (updates.fullName !== undefined) supabaseUpdates.full_name = updates.fullName;
      if (updates.avatarUrl !== undefined) supabaseUpdates.avatar_url = updates.avatarUrl;
      
      const { error } = await supabase
        .from('profiles')
        .update(supabaseUpdates)
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Mettre à jour le profil local
      if (profile) {
        setProfile({
          ...profile,
          ...updates
        });
      }
      
      return { success: true, error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const authContextValue: AuthContextType = {
    session,
    user,
    profile,
    isLoading,
    error,
    signIn,
    signOut,
    resetPassword,
    updateProfile
  };

  // Ne pas rendre le contenu jusqu'à ce que l'authentification soit initialisée
  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};