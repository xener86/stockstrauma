// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Récupérer les variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérifier que les variables d'environnement sont définies
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Les variables d\'environnement Supabase ne sont pas définies.');
}

// Créer le client Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helpers pour l'authentification
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  return { data, error };
};

export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  return { data, error };
};

// Fonction pour récupérer le profil utilisateur
export const fetchUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
};

// Fonction pour mettre à jour le profil utilisateur
export const updateUserProfile = async (userId: string, updates: Partial<{
  full_name: string;
  avatar_url: string;
}>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  
  return { data, error };
};

// Fonction pour télécharger une image de profil
export const uploadAvatar = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}.${fileExt}`;
  const filePath = `avatars/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      upsert: true
    });
  
  if (uploadError) {
    return { error: uploadError };
  }
  
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
  
  return { data: data.publicUrl, error: updateError };
};