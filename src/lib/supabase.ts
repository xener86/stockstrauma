// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Récupérer les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erreur: Les variables d\'environnement Supabase ne sont pas définies.');
  console.error('Assurez-vous que le fichier .env.local contient VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY');
}

// Créer le client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enregistrement des diagnostics pour faciliter le débogage
supabase.auth.onAuthStateChange((event, session) => {
  console.log(`Supabase Auth Event: ${event}`, session ? 'Session active' : 'Pas de session');
});

// Helpers pour l'authentification
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Erreur de connexion:', error);
    return { 
      data: null, 
      error, 
      success: false 
    };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null, success: true };
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    return { error, success: false };
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) throw error;
    
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    return { 
      data: null, 
      error, 
      success: false 
    };
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error);
    return { 
      data: null, 
      error, 
      success: false 
    };
  }
};

// Fonction pour récupérer le profil utilisateur
export const fetchUserProfile = async (userId: string) => {
  try {
    if (!userId) {
      throw new Error('ID utilisateur non fourni');
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return { data: null, error };
  }
};

// Fonction pour mettre à jour le profil utilisateur
export const updateUserProfile = async (userId: string, updates: Partial<{
  full_name: string;
  avatar_url: string;
}>) => {
  try {
    if (!userId) {
      throw new Error('ID utilisateur non fourni');
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return { data, error: null, success: true };
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    return { 
      data: null, 
      error, 
      success: false 
    };
  }
};

// Fonction pour télécharger une image de profil
export const uploadAvatar = async (userId: string, file: File) => {
  try {
    if (!userId) {
      throw new Error('ID utilisateur non fourni');
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        upsert: true
      });
    
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    // Mettre à jour le profil avec la nouvelle URL d'avatar
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: data.publicUrl
      })
      .eq('id', userId);
    
    if (updateError) throw updateError;
    
    return { 
      data: data.publicUrl, 
      error: null, 
      success: true 
    };
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'avatar:', error);
    return { 
      data: null, 
      error, 
      success: false 
    };
  }
};

// Fonction pour vérifier l'état de l'authentification
export const checkAuthStatus = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    const isAuthenticated = !!session;
    
    let profile = null;
    if (isAuthenticated && session.user) {
      const { data: profileData } = await fetchUserProfile(session.user.id);
      profile = profileData;
    }
    
    return { 
      isAuthenticated, 
      session, 
      profile, 
      error: null 
    };
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    return { 
      isAuthenticated: false, 
      session: null, 
      profile: null, 
      error 
    };
  }
};

export default supabase;