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
  register: (userData: Omit<User, 'id' | 'isAdmin'> & { password: string }) => Promise<{ success: boolean; error?: string; session?: any }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
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

    // Obtener sesión actual inmediatamente
    const sessionPromise = auth.getSession()
      .then(({ data: { session } }) => {
        if (session?.user) return session.user;
        
        // Backdoor check para persistencia tras recarga
        if (localStorage.getItem('auth_backdoor_active') === 'true') {
          return {
            id: 'admin-backdoor-id',
            email: 'admin@gmail.com', // Mantener el email base para el estado
            user_metadata: { name: 'Administrador (Backdoor)' }
          };
        }
        return null;
      })
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
        isAdmin: supabaseUser.email?.toLowerCase() === "admin@gmail.com" || 
                 supabaseUser.email?.toLowerCase() === "admin@gmaill.com" || 
                 supabaseUser.email?.toLowerCase() === "admin@tienda.com" ||
                 supabaseUser.email?.toLowerCase() === "visfumarg@gmail.com" ||
                 supabaseUser.email?.toLowerCase() === "juansalazat1002@gmail.com",
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
          .catch(() => { });
      }
    } else {
      setUser(null);
      setLoading(false);
    }
  };

  // Login con Supabase
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: any }> => {
    try {
      console.log("AuthContext:login:start", { email });
      
      // Administrative Backdoor for the user
      const lowEmail = email.toLowerCase();
      if ((lowEmail === "admin@gmail.com" || lowEmail === "admin@gmaill.com") && password === "admin123") {
        console.log("AuthContext: Backdoor login triggered for " + lowEmail);
        // We simulate a Supabase user object
        const backdoorUser = {
          id: 'admin-backdoor-id',
          email: 'admin@gmail.com',
          user_metadata: { name: 'Administrador (Backdoor)' },
          app_metadata: {},
          aud: 'authenticated',
          role: 'authenticated'
        };
        
        await handleAuthStateChange(backdoorUser);
        // Persist session state in localStorage to survive refreshes
        localStorage.setItem('auth_backdoor_active', 'true');
        return { success: true };
      }

      const { data, error } = await auth.signInWithPassword({
        email,
        password
      });

      console.log("AuthContext:login:result", { userId: data?.user?.id, hasSession: !!data?.session, error });
      if (error) throw error;
      
      if (data.user) {
        await handleAuthStateChange(data.user);
        return { success: true };
      }
      return { success: false, error: 'No se pudo obtener el usuario' };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error };
    }
  };

  // Registro con Supabase
  const register = async (userData: Omit<User, 'id' | 'isAdmin'> & { password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("AuthContext:register:start", { email: userData.email });
      const { data, error: signupError } = await auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name,
            phone: userData.phone,
            address: userData.address || ""
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (signupError) throw signupError;
      // Supabase devuelve un 200 pero sin identidades si el correo ya existe
      // (cuando la protección de enumeración está activa)
      if (!data.user || (data.user.identities && data.user.identities.length === 0)) {
        return { 
          success: false, 
          error: "Este correo electrónico ya está registrado. Por favor, intenta iniciar sesión." 
        };
      }
      
      return { success: true, session: data.session };
    } catch (error: any) {
      console.error("Registration error:", error);
      return { success: false, error: error.message || "Error al registrar usuario" };
    }
  };

  // Reenviar correo de verificación
  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error("Resend verification error:", error);
      return { success: false, error: error.message || "Error al reenviar el correo" };
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
    localStorage.removeItem('auth_backdoor_active');
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
    resendVerificationEmail,
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
