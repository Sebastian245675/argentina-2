import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
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
}

interface AuthContextType {
  user: User | null;
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
  const [loading, setLoading] = useState(true);

  // Escucha cambios de sesión de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Usar nuestro helper que maneja errores y fallbacks
          const userData = await getDocumentById("users", firebaseUser.uid);
          
          if (userData) {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: userData.name || "",
              departmentNumber: userData.departmentNumber || userData.conjunto || "",
              phone: userData.phone || "",
              address: userData.address || "",
              isAdmin: firebaseUser.email === "admin@tienda.com",
              subCuenta: userData.subCuenta || undefined
            });
          } else {
            // Si el usuario no existe en Firestore, crear un documento nuevo
          const newUserData = {
            name: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            phone: "",
            address: "",
            departmentNumber: "",
            conjunto: "",
            createdAt: new Date()
          };
          
          // Solo para usuarios que no son el primer inicio como admin
          if (firebaseUser.email !== "admin@tienda.com") {
            // Usar nuestro helper que maneja errores y fallbacks
            await createDocumentWithId("users", firebaseUser.uid, newUserData);
            console.log("Documento de usuario creado automáticamente:", firebaseUser.uid);
          }
          
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "",
            departmentNumber: "",
            phone: "",
            address: "",
            isAdmin: firebaseUser.email === "admin@tienda.com"
          });
        }
        } catch (error) {
          console.error("Error al acceder a Firestore:", error);
          // En caso de error de permisos, aún permitimos el acceso con datos básicos
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "",
            departmentNumber: "",
            phone: "",
            address: "",
            isAdmin: firebaseUser.email === "admin@tienda.com"
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Login con Firebase
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // El listener de arriba actualizará el usuario automáticamente
      return !!result.user;
    } catch (error) {
      return false;
    }
  };

  // Registro con Firebase
  const register = async (userData: Omit<User, 'id' | 'isAdmin'> & { password: string }): Promise<boolean> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      
      // Usar nuestro helper para guardar datos
      const userDocData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone || "",
        address: userData.address || "",
        departmentNumber: userData.departmentNumber || "",
        conjunto: userData.departmentNumber || "", // Para mantener compatibilidad con código anterior
        createdAt: new Date()
      };
      
      await createDocumentWithId("users", result.user.uid, userDocData);
      console.log("Usuario registrado con éxito");
      
      // El listener de arriba actualizará el usuario automáticamente
      return true;
    } catch (error: any) {
      console.error("Error al registrar usuario:", error.message || error);
      return false;
    }
  };

  // Logout con Firebase
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Actualizar usuario en memoria (opcional)
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
