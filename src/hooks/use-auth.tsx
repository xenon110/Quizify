
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut,
  User,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => void;
  hasUsedFreeTrial: boolean;
  useFreeTrial: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  // Give unlimited access by always setting hasUsedFreeTrial to false
  const [hasUsedFreeTrial, setHasUsedFreeTrial] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const checkFreeTrialStatus = useCallback((uid: string) => {
    // Always allow unlimited access
    setHasUsedFreeTrial(false);
  }, []);

  const useFreeTrial = () => {
    // Do nothing, access is unlimited.
  };

  const refreshAuth = useCallback(() => {
    const unsubscribe = onAuthStateChanged(auth, (refreshedUser) => {
        if (refreshedUser) {
            const storedPhoto = localStorage.getItem(`photoURL-${refreshedUser.uid}`);
            const finalUser = {
                ...refreshedUser,
                photoURL: storedPhoto || refreshedUser.photoURL,
            } as User;
            setUser(finalUser);
            checkFreeTrialStatus(refreshedUser.uid);
        } else {
            setUser(null);
        }
      unsubscribe();
    });
  }, [checkFreeTrialStatus]);

  useEffect(() => {
    const handleAuth = async () => {
      setLoading(true);
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          toast({
            title: 'Signed In',
            description: `Welcome back, ${result.user.displayName || result.user.email}!`,
          });
          checkFreeTrialStatus(result.user.uid);
          router.push('/');
        }
      } catch (error: any) {
        console.error('Firebase sign-in error:', error);
        toast({
          variant: 'destructive',
          title: 'Sign In Failed',
          description: error.message || 'Could not complete sign in. Please try again.',
        });
      }
    };
    
    handleAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
            const storedPhoto = localStorage.getItem(`photoURL-${currentUser.uid}`);
            const finalUser = {
                ...currentUser,
                photoURL: storedPhoto || currentUser.photoURL,
            } as User;
            setUser(finalUser);
            checkFreeTrialStatus(currentUser.uid);
        } else {
            setUser(null);
        }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [router, toast, checkFreeTrialStatus]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    await signInWithRedirect(auth, provider);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Free trial is now unlimited, so no need to set status
      setHasUsedFreeTrial(false);

      setUser({ ...userCredential.user, displayName: name });
      router.push('/');
    } catch (error: any)
       {
      console.error('Error signing up with email: ', error);
      toast({
        variant: 'destructive',
        title: 'Sign Up Error',
        description: error.message || 'Could not create an account. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const signInWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      router.push('/');
    } catch (error: any) {
      console.error('Error signing in with email: ', error);
      toast({
        variant: 'destructive',
        title: 'Sign In Error',
        description: error.message || 'Could not sign in. Please check your credentials.',
      });
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    if (user) {
        localStorage.removeItem(`photoURL-${user.uid}`);
    }
    setLoading(true);
    setUser(null); // Clear user state immediately
    await signOut(auth);
    router.push('/welcome');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, signOut: signOutUser, refreshAuth, hasUsedFreeTrial, useFreeTrial }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
