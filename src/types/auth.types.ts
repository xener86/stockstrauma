// src/types/auth.types.ts
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: 'admin' | 'operator';
}

export interface AuthContextType {
  user: SupabaseUser | null;
  profile: User | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error: Error | null; }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error: Error | null; }>;
  updateProfile: (updates: Partial<{
    fullName: string;
    avatarUrl: string;
  }>) => Promise<{ success: boolean; error: Error | null; }>;
}