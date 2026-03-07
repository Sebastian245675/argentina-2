import { auth, db, sendWelcomeEmail } from "@/firebase";
import { getDocumentById, createDocumentWithId, updateDocument } from "@/lib/database";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  departmentNumber: string;
  phone: string;
  address: string;
  isAdmin: boolean;
  subCuenta?: string; // Permite identificar subcuentas
  liberta?: string; // "si" = subcuenta puede publicar directo; "no" = enviar a revisión
}

interface AuthContextType {
  user: User | null;
  currentUser: any; // Firebase user object
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'isAdmin'> & { password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Escucha cambios de sesión de Supabase
  useEffect(() => {
    let mounted = true;

    const applySession = async (supabaseUser: any) => {
      if (!mounted) return;
      await handleAuthStateChange(supabaseUser);
    };

    // Obtener sesión actual inmediatamente (evita quedar en Cargando si onAuthStateChange tarda)
    const sessionPromise = auth.getSession()
      .then(({ data: { session } }) => session?.user || null)
      .catch(() => null);
    
    sessionPromise.then((user) => {
      if (mounted) applySession(user);
    });

    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      await applySession(session?.user || null);
    });

    // Fallback: si tras 8 segundos seguimos cargando, forzar fin (evita bloqueo infinito)
    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 8000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription?.unsubscribe();
    };
  }, []);

  const handleAuthStateChange = async (supabaseUser: any) => {
    setCurrentUser(supabaseUser);
    if (supabaseUser) {
      const baseUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || "Usuario",
        departmentNumber: "",
        phone: "",
        address: "",
        isAdmin: supabaseUser.email === "admin@gmail.com" || supabaseUser.email === "admin@tienda.com",
        subCuenta: supabaseUser.user_metadata?.sub_cuenta || undefined,
        liberta: undefined as string | undefined,
      };
      setUser(baseUser);
      setLoading(false);
      if (typeof (db as any)?.from === 'function') {
        (db as any).from('users').select('sub_cuenta, liberta').eq('id', supabaseUser.id).maybeSingle()
          .then(({ data }: any) => {
            if (data) setUser(prev => prev ? { ...prev, subCuenta: prev.subCuenta || data?.sub_cuenta, liberta: data?.liberta } : prev);
          })
          .catch(() => {});
      }
    } else {
      setUser(null);
      setLoading(false);
    }
  };

  // Login con Supabase
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("AuthContext:login:start", { email });
      const { data, error } = await auth.signInWithPassword({
        email,
        password
      });
      
      console.log("AuthContext:login:result", { userId: data?.user?.id, hasSession: !!data?.session, error });
      if (error) throw error;
      return !!data.user;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Registro con Supabase
  const register = async (userData: Omit<User, 'id' | 'isAdmin'> & { password: string }): Promise<boolean> => {
    try {
      const { data, error: signupError } = await auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name
          }
        }
      });
      
      if (signupError) throw signupError;
      if (!data.user) throw new Error('No user returned from signup');
      
      // Send welcome email (no DB insert to avoid RLS issues)
      try {
        await sendWelcomeEmail(
          userData.email,
          userData.name || userData.email.split('@')[0]
        );
        console.log("Welcome email sent to:", userData.email);
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        // Don't interrupt registration if email fails
      }
      
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  // Actualizar datos del usuario
  const updateUser = (userData: Partial<User>) => {
    if (!user || !user.id) return;
    
    // Actualizar en Firestore
    updateDocument("users", user.id, userData);
    
    // Actualizar estado local
    setUser({
      ...user,
      ...userData,
    });
  };

  // Cerrar sesión
  const logout = async () => {
    await auth.signOut();
    setUser(null);
  };

  // No mostramos nada mientras verificamos el estado de autenticación
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Valor que se pasa al contexto
  const value = {
    user,
    currentUser,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
