// Legacy auth service - redirects to supabaseService
import { supabase } from '../lib/supabase';
import { User } from '../types';

export const getCurrentUser = (): User | null => {
  // This is a placeholder - in a real app, you'd get from session
  return null;
};

export const login = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  
  // Return user data - this would normally come from your users table
  return {
    id: data.user?.id || '',
    name: data.user?.user_metadata?.name || 'User',
    email: data.user?.email || '',
    age: 25,
    phone: '',
    role: 'user'
  };
};

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const register = async (userData: Partial<User> & { password: string }): Promise<User> => {
  const { data, error } = await supabase.auth.signUp({
    email: userData.email!,
    password: userData.password,
    options: {
      data: {
        name: userData.name,
        age: userData.age,
        phone: userData.phone,
      }
    }
  });

  if (error) throw error;

  return {
    id: data.user?.id || '',
    name: userData.name || 'User',
    email: userData.email || '',
    age: userData.age || 25,
    phone: userData.phone || '',
    role: 'user'
  };
};