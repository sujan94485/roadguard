import { UserRole } from './database.types';

export interface UserSession {
  id: string; // Supabase auth.users UUID or demo ID
  email: string;
  full_name: string;
  role: UserRole; // Database-backed role from public.profiles
  department?: string | null;
  phone?: string | null;
}

export interface AuthContextType {
  user: UserSession | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCitizen: boolean;
  isDemoAuth: boolean;
  isSupabaseConnected: boolean;
  loadingAuth: boolean;
  authError: string | null;
  profileError: string | null;
  isPasswordRecovery: boolean;
  
  // Real Supabase Auth Methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  clearAuthError: () => void;
  
  // Isolated Demo Mode Switch (strictly for offline/hackathon presentation)
  loginAsDemo: (role: UserRole) => void;
  toggleDemoMode: (forceDemo: boolean) => void;
}
