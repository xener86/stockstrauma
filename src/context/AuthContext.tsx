// src/context/AuthContext.tsx
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

  useEffect(() => {
    // Récupérer la session initiale
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setError(error);
      } else {
        setSession(session);
        setUser(session?.user || null);
        
        // Si un utilisateur est connecté, récupérer son profil
        if (session?.user) {
          fetchUserProfile(session.user.id)
            .then(({ data, error }) => {
              if (error) {
                setError(error);
              } else if (data) {
                setProfile({
                  id: data.id,
                  email: data.email,
                  fullName: data.full_name || undefined,
                  avatarUrl: data.avatar_url || undefined,
                  role: data.role as 'admin' | 'operator'
                });
              }
            })
            .finally(() => {
              setIsLoading(false);
            });
        } else {
          setIsLoading(false);
        }
      }
    }).catch((error) => {
      setError(error);
      setIsLoading(false);
    });

    // Configurer le listener pour les changements d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        
        // Mettre à jour le profil si l'utilisateur change
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
      const { error } = await supabase.auth.signInWithPassword({
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

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};