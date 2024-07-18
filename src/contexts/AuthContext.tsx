import { ReactNode, createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { auth } from '@/src/services/firebaseConection';

interface AuthProviderProps {
  children: ReactNode;
}

type AuthContextData = {
  signed: boolean;
  loadingAuth: boolean;
  initialLoading: boolean;
  user: UserProps | null;
  handleLogin: (email: string, password: string) => Promise<void>;
};

interface UserProps {
  uid: string;
  name: string | null;
  email: string | null;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProps | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
        });
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
      setInitialLoading(false);
    });

    return () => {
      unsub();
    };
  }, []);

  const handleLogin = async (email: string, password: string) => {

    setError(null);
    setLoadingAuth(true);

    if (!email) {
      toast.error('Por favor, insira seu email.');
      setLoadingAuth(false);
      return;
    }

    if (!password) {
      toast.error('Por favor, insira sua senha.');
      setLoadingAuth(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Por favor, insira um email válido.');
      setLoadingAuth(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      const errorMessage = err.message || 'Falha ao fazer login. Verifique suas credenciais e tente novamente.';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoadingAuth(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        loadingAuth,
        initialLoading,
        user,
        handleLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
