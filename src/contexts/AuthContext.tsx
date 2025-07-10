import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  departmentNumber: string;
  phone: string;
  address: string;
  isAdmin: boolean;
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
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: data.name || "",
            departmentNumber: data.departmentNumber || data.conjunto || "",
            phone: data.phone || "",
            address: data.address || "",
            isAdmin: firebaseUser.email === "admin@gmail.com"
          });
        } else {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: "",
            departmentNumber: "",
            phone: "",
            address: "",
            isAdmin: firebaseUser.email === "admin@gmail.com"
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
      await setDoc(doc(db, "users", result.user.uid), {
        name: userData.name,
        email: userData.email,
        phone: userData.phone || "",
        address: userData.address || "",
        conjunto: userData.departmentNumber || "",
      });
      // El listener de arriba actualizará el usuario automáticamente
      return true;
    } catch (error) {
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
