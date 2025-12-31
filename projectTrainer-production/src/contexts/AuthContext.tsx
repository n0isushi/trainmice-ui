import { createContext, useContext, useEffect, useState } from 'react';
import { auth, User as BackendUser } from '../lib/auth';
import { AuthUser } from '../types/database';

interface AuthContextType {
  user: AuthUser | null;
  session: { access_token: string } | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: 'trainer' | 'admin' | 'client',
    contactNumber?: string
  ) => Promise<{ error: Error | null; requiresVerification?: boolean; message?: string }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const { user, session } = await auth.getSession();
        if (!isMounted) return;

        if (user && session) {
          const mappedUser: AuthUser = {
            id: user.id,
            email: user.email,
            full_name: user.fullName || user.email,
            role: (user.role.toLowerCase() as 'trainer' | 'admin' | 'client') || 'trainer',
          };
          setUser(mappedUser);
          setSession(session);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    init();

    const unsubscribe = auth.onAuthStateChange((backendUser) => {
      if (!isMounted) return;
      if (backendUser) {
        const mappedUser: AuthUser = {
          id: backendUser.id,
          email: backendUser.email,
          full_name: backendUser.fullName || backendUser.email,
          role: (backendUser.role.toLowerCase() as 'trainer' | 'admin' | 'client') || 'trainer',
        };
        setUser(mappedUser);
        setSession({ access_token: auth['getSessionToken' as any] ?? '' } as any);
      } else {
        setUser(null);
        setSession(null);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: 'trainer' | 'admin' | 'client', contactNumber?: string) => {
    try {
      if (role === 'trainer') {
        // Use trainer signup endpoint
        const response = await apiClient.trainerSignup({
          email,
          password,
          fullName,
        });
        
        // Trainer signup requires verification - no token yet
        return { 
          error: null,
          requiresVerification: true,
          message: response.message || 'Verification email sent. Please verify your email to activate your account.',
        };
      } else {
        // Use legacy register for other roles
        const { error } = await auth.signUp({
          email,
          password,
          fullName,
          role: role.toUpperCase() as BackendUser['role'],
        });

        if (error) throw new Error(error.message);
        return { error: null };
      }
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await auth.signIn(email, password);
      if (error) throw new Error(error.message);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await auth.signOut();
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
