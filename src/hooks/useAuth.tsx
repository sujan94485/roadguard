import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole } from '../types/database.types';
import { AuthContextType, UserSession } from '../types/auth.types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_CITIZEN: UserSession = {
  id: 'usr-cit-101',
  email: 'citizen@roadguard.demo',
  full_name: 'Sample Citizen Reporter',
  role: 'citizen',
  department: 'Civic Contributor'
};

const DEMO_ADMIN: UserSession = {
  id: 'usr-adm-202',
  email: 'authority@roadguard.demo',
  full_name: 'Demo Authority User',
  role: 'admin',
  department: 'Municipal Road Maintenance Team'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if user forced demo mode in localStorage or if Supabase is unconfigured
  const [forceDemoMode, setForceDemoMode] = useState<boolean>(() => {
    if (!isSupabaseConfigured) return true;
    return localStorage.getItem('roadguard_force_demo') === 'true';
  });

  const [user, setUser] = useState<UserSession | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem('roadguard_recovery_active') === 'true';
    } catch {
      return false;
    }
  });

  // Authoritatively fetch profile from Supabase public.profiles table
  const fetchUserProfile = useCallback(
    async (userId: string, email: string): Promise<{ profile: UserSession | null; error: string | null }> => {
      if (!supabase) return { profile: null, error: 'Supabase client is not configured' };
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (error) {
          console.error('[Auth] Error fetching profile from public.profiles:', error);
          return { profile: null, error: `Database error fetching profile: ${error.message}` };
        }

        if (!data) {
          console.warn('[Auth] No matching record in public.profiles for auth user UUID:', userId);
          return { profile: null, error: 'User profile row does not exist in public.profiles.' };
        }

        const dbRole = data.role as UserRole;
        console.log('[Auth] Profile loaded authoritatively from public.profiles:', {
          authenticatedUserUuid: userId,
          loadedProfileUuid: data.id,
          loadedRole: dbRole,
          fullName: data.full_name,
          department: data.department
        });

        return {
          profile: {
            id: data.id,
            email,
            full_name: data.full_name || 'Citizen Reporter',
            role: dbRole,
            department: data.department || null,
            phone: data.phone || null
          },
          error: null
        };
      } catch (err: any) {
        console.error('[Auth] Unexpected exception loading profile:', err);
        return { profile: null, error: err?.message || 'Failed to load user profile.' };
      }
    },
    []
  );

  // Initialize and synchronize auth lifecycle
  useEffect(() => {
    let mounted = true;

    // Requirement 7: Purge any stale legacy localStorage keys
    try {
      localStorage.removeItem('roadguard_auth_role');
      if (!forceDemoMode) {
        localStorage.removeItem('roadguard_demo_auth_role');
      }
    } catch {
      // Storage access error handling
    }

    if (forceDemoMode || !isSupabaseConfigured || !supabase) {
      // Isolated Demo Mode
      const savedDemoRole = localStorage.getItem('roadguard_demo_auth_role');
      if (mounted) {
        setUser(savedDemoRole === 'admin' ? DEMO_ADMIN : DEMO_CITIZEN);
        setProfileError(null);
        setLoadingAuth(false);
      }
      return;
    }

    // Connected Mode: Supabase session is the single source of truth
    setLoadingAuth(true);

    const syncSession = async (session: any, eventSource: string) => {
      console.log(`[Auth] Syncing session (${eventSource}):`, {
        hasSession: !!session,
        authenticatedUserUuid: session?.user?.id || null,
        email: session?.user?.email || null
      });

      if (!session?.user) {
        if (mounted) {
          setUser(null);
          setProfileError(null);
          setLoadingAuth(false);
        }
        return;
      }

      const { profile, error: pError } = await fetchUserProfile(
        session.user.id,
        session.user.email || ''
      );

      if (mounted) {
        if (profile) {
          setUser(profile);
          setProfileError(null);
        } else {
          setUser(null);
          setProfileError(pError || 'Failed to load profile from database.');
        }
        setLoadingAuth(false);
      }
    };

    // 1. Initial Session Check on Startup (Requirement 2 & 3)
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return;
        console.log('[Auth] Initial getSession check on startup:', {
          hasSession: !!session,
          authenticatedUserUuid: session?.user?.id || null,
          error: error ? error.message : null
        });

        // Check if URL has error fragment from Supabase recovery redirect (e.g. expired link)
        if (window.location.hash.startsWith('#error=')) {
          console.warn('[Auth] Detected Supabase error fragment in URL:', window.location.hash);
          setIsPasswordRecovery(false);
          try {
            sessionStorage.removeItem('roadguard_recovery_active');
          } catch {}
          window.location.hash = '/reset-password';
          setLoadingAuth(false);
          return;
        }

        if (error) {
          console.warn('[Auth] getSession warning on startup:', error);
          setUser(null);
          setProfileError(null);
          setLoadingAuth(false);
          return;
        }

        syncSession(session, 'INITIAL_GET_SESSION');
      })
      .catch(err => {
        console.error('[Auth] getSession exception on startup:', err);
        if (mounted) {
          setUser(null);
          setProfileError(null);
          setLoadingAuth(false);
        }
      });

    // 2. Auth State Change Listener (Requirement 3 & 5)
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] onAuthStateChange event fired:', event, {
        authenticatedUserUuid: session?.user?.id || null
      });

      if (!mounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        console.log('[Auth] onAuthStateChange PASSWORD_RECOVERY event received! Session established for user:', session?.user?.id);
        setIsPasswordRecovery(true);
        try {
          sessionStorage.setItem('roadguard_recovery_active', 'true');
        } catch {}

        if (session?.user) {
          fetchUserProfile(session.user.id, session.user.email || '').then(({ profile }) => {
            if (profile && mounted) {
              setUser(profile);
            }
          });
        }

        // Programmatically navigate to #/reset-password after session is established
        window.location.hash = '/reset-password';
        setLoadingAuth(false);
        return;
      }

      if (event === 'USER_UPDATED') {
        console.log('[Auth] onAuthStateChange USER_UPDATED event received! Password changed.');
        setIsPasswordRecovery(false);
        try {
          sessionStorage.removeItem('roadguard_recovery_active');
        } catch {}

        if (session?.user) {
          const { profile, error: pError } = await fetchUserProfile(
            session.user.id,
            session.user.email || ''
          );
          if (mounted) {
            if (profile) {
              setUser(profile);
              setProfileError(null);
              console.log('[Auth] Authoritative profile reloaded after password update:', {
                id: profile.id,
                role: profile.role,
                fullName: profile.full_name
              });
            } else {
              setProfileError(pError);
            }
          }
        }

        // Redirect to home
        window.location.hash = '/';
        return;
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfileError(null);
        setIsPasswordRecovery(false);
        try {
          sessionStorage.removeItem('roadguard_recovery_active');
        } catch {}
        setLoadingAuth(false);
        return;
      }

      await syncSession(session, `EVENT_${event}`);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [forceDemoMode, fetchUserProfile]);

  // Real Supabase Sign In (Requirement 5)
  const signIn = async (email: string, password: string): Promise<void> => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please use Demo Mode.');
    }

    try {
      setLoadingAuth(true);
      setAuthError(null);
      setProfileError(null);

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (!data.session || !data.user) {
        setUser(null);
        throw new Error('Authentication succeeded but no active session was established. Please retry.');
      }

      console.log('[Auth] Signed in via Supabase Auth:', {
        authenticatedUserUuid: data.session.user.id,
        email: data.session.user.email
      });

      const { profile, error: pError } = await fetchUserProfile(
        data.session.user.id,
        data.session.user.email || email
      );

      if (profile) {
        setUser(profile);
        setProfileError(null);
      } else {
        setUser(null);
        const errMsg = pError || 'Profile could not be loaded from database.';
        setProfileError(errMsg);
        throw new Error(errMsg);
      }
    } catch (err: any) {
      const msg = err?.message || 'Sign in failed. Please verify credentials.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoadingAuth(false);
    }
  };

  // Real Supabase Sign Up
  const signUp = async (email: string, password: string, fullName: string, phone?: string): Promise<void> => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please use Demo Mode.');
    }

    try {
      setLoadingAuth(true);
      setAuthError(null);
      setProfileError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone?.trim() || null
          }
        }
      });
      if (error) throw error;

      if (data.session && data.user) {
        const { profile } = await fetchUserProfile(data.user.id, data.user.email || email);
        setUser(profile);
      } else if (data.user) {
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (!signInError && signInData.session && signInData.user) {
            const { profile } = await fetchUserProfile(signInData.user.id, signInData.user.email || email);
            setUser(profile);
            return;
          }
        } catch {
          // Fall through to notice
        }

        setUser(null);
        throw new Error(
          'Registration successful! Please check your email inbox to confirm your account before signing in.'
        );
      }
    } catch (err: any) {
      const msg = err?.message || 'Sign up failed. Please try again.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoadingAuth(false);
    }
  };

  // Real Supabase Sign Out (Requirement 4)
  const signOut = async (): Promise<void> => {
    console.log('[Auth] Initiating sign out...');
    try {
      setLoadingAuth(true);
      if (isSupabaseConfigured && supabase && !forceDemoMode) {
        const { error } = await supabase.auth.signOut();
        console.log('[Auth] supabase.auth.signOut result:', {
          success: !error,
          error: error ? error.message : null
        });
        if (error) {
          console.warn('[Auth] supabase.auth.signOut warning:', error);
        }
      }
    } catch (err: any) {
      console.warn('[Auth] Exception during sign out:', err);
    } finally {
      // Clear user and profile state immediately
      setUser(null);
      setProfileError(null);
      setAuthError(null);
      setIsPasswordRecovery(false);
      try {
        sessionStorage.removeItem('roadguard_recovery_active');
      } catch {}
      setLoadingAuth(false);

      // Requirement 7: Clear any legacy role keys from localStorage
      try {
        localStorage.removeItem('roadguard_auth_role');
        localStorage.removeItem('roadguard_demo_auth_role');
      } catch {}

      console.log('[Auth] Sign-out completed. Cleared auth state.');

      // Requirement 4: Navigate to the normal citizen/home page
      window.location.hash = '/';
    }
  };

  // Real Supabase Request Password Reset (Requirements 2, 3, 11)
  const resetPassword = async (email: string): Promise<void> => {
    if (!isSupabaseConfigured || !supabase || forceDemoMode) {
      if (forceDemoMode) {
        console.log('[Auth] Demo mode: Simulated password reset email for:', email);
        return;
      }
      throw new Error('Supabase client is not configured.');
    }

    try {
      setLoadingAuth(true);
      setAuthError(null);

      // Requirement 1: Supabase redirectTo MUST be the application root (NOT a hash route)
      const redirectUrl = `${window.location.origin}/`;
      console.log('[Auth] Requesting resetPasswordForEmail with root redirect:', { email, redirectTo: redirectUrl });

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        console.warn('[Auth] resetPasswordForEmail warning:', error.message);
        // Requirement 11: Do not reveal whether a particular email address exists in the system
        if (error.message.toLowerCase().includes('rate limit') || (error as any).status === 429) {
          throw new Error('Too many requests. Please wait a moment before trying again.');
        }
      } else {
        console.log('[Auth] resetPasswordForEmail successfully dispatched.');
      }
    } catch (err: any) {
      if (err.message?.includes('Too many requests')) {
        setAuthError(err.message);
        throw err;
      }
      console.warn('[Auth] Exception during password reset (suppressed user enumeration):', err);
      // Suppress enumeration errors so user sees generic success message
    } finally {
      setLoadingAuth(false);
    }
  };

  // Set New Password using Active Recovery Session (Requirements 6, 8, 9, 10)
  const updatePassword = async (newPassword: string): Promise<void> => {
    if (!isSupabaseConfigured || !supabase) {
      if (forceDemoMode) {
        console.log('[Auth] Demo mode: Simulated password update.');
        return;
      }
      throw new Error('Supabase client is not configured.');
    }

    try {
      setLoadingAuth(true);
      setAuthError(null);
      console.log('[Auth] Updating user password via supabase.auth.updateUser...');

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('[Auth] updateUser password error:', error);
        throw error;
      }

      console.log('[Auth] Password updated successfully for user UUID:', data.user?.id);
      setIsPasswordRecovery(false);
      try {
        sessionStorage.removeItem('roadguard_recovery_active');
      } catch {}

      // Reload authoritative profile to preserve role
      if (data.user) {
        const { profile } = await fetchUserProfile(data.user.id, data.user.email || '');
        if (profile) {
          setUser(profile);
          setProfileError(null);
        }
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to update password. Please try again.';
      setAuthError(msg);
      throw new Error(msg);
    } finally {
      setLoadingAuth(false);
    }
  };

  // Isolated Demo Role Switch (only for Demo Mode - Requirement 8)
  const loginAsDemo = (targetRole: UserRole) => {
    if (targetRole === 'admin') {
      setUser(DEMO_ADMIN);
      localStorage.setItem('roadguard_demo_auth_role', 'admin');
    } else {
      setUser(DEMO_CITIZEN);
      localStorage.setItem('roadguard_demo_auth_role', 'citizen');
    }
    setProfileError(null);
  };

  // Toggle between Connected Mode and Demo Mode
  const toggleDemoMode = (force: boolean) => {
    setForceDemoMode(force);
    localStorage.setItem('roadguard_force_demo', String(force));
    if (force) {
      setUser(DEMO_CITIZEN);
      setProfileError(null);
    } else {
      setUser(null);
      setProfileError(null);
      try {
        localStorage.removeItem('roadguard_demo_auth_role');
        localStorage.removeItem('roadguard_auth_role');
      } catch {}
    }
  };

  const clearAuthError = () => setAuthError(null);

  const isDemoAuth = forceDemoMode || !isSupabaseConfigured;
  const isSupabaseConnected = !isDemoAuth;

  // Authoritative role evaluation: in Connected Mode without a loaded user, role is strictly null
  const role: UserRole | null = user ? user.role : isDemoAuth ? 'citizen' : null;
  const isAdmin = role === 'admin';
  const isCitizen = role === 'citizen';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isAdmin,
        isCitizen,
        isDemoAuth,
        isSupabaseConnected,
        loadingAuth,
        authError,
        profileError,
        isPasswordRecovery,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        clearAuthError,
        loginAsDemo,
        toggleDemoMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
