import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { User, Mail, Lock, Phone, MapPin, Building, Shield, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    conjunto: '',
    email: '',
    password: '',
    phone: ''
  });

  const handleQuickAdminLogin = async () => {
    setIsLoading(true);
    try {
      const success = await login('admin@tienda.com', 'admin123');
      if (success) {
        toast({
          title: "¡Acceso de administrador!",
          description: "Bienvenido al panel de administración",
        });
        onClose();
        // Navegar al panel de administración
        setTimeout(() => {
          navigate('/admin');
        }, 500);
      } else {
        toast({
          title: "Error",
          description: "No se pudo acceder como administrador",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al iniciar sesión",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Email o contraseña incorrectos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { email, password, name, conjunto, phone } = registerData;

    try {
      // Registro en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Guarda el usuario con el UID como ID
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name,
        conjunto,
        email,
        phone
      });

      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta ha sido creada correctamente",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al crear tu cuenta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className="gradient-orange h-2"></div>
        
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-center gradient-text-orange">
            Conjunto Residencial Villa Hermosa
          </DialogTitle>
          <p className="text-center text-gray-600 text-sm">Accede a tu tienda del conjunto</p>
        </DialogHeader>

        <div className="p-6 pt-2">
          {/* Panel de Administración - Integrado como parte del login */}
          <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg text-orange-800 mb-2">Panel de Administración</h3>
              <p className="text-sm text-orange-700 mb-4">
                Acceso directo para administradores del conjunto
              </p>
              <Button 
                onClick={handleQuickAdminLogin}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? 'Accediendo...' : 'Ingresar como Administrador'}
              </Button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">O ingresa con tu cuenta</span>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                Iniciar Sesión
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                Registrarse
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pb-4">
                  <CardTitle className="text-xl text-gray-800">Residentes del Conjunto</CardTitle>
                  <CardDescription>
                    Ingresa con tu cuenta de residente
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-orange-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="tu@email.com"
                          className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                          value={loginData.email}
                          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-orange-400" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full gradient-orange hover:opacity-90 transition-opacity"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pb-4">
                  <CardTitle className="text-xl text-gray-800">Registro de Residente</CardTitle>
                  <CardDescription>
                    Completa tus datos como residente del conjunto
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Nombre Completo</Label>
                      <Input
                        id="register-name"
                        placeholder="Juan Pérez"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-conjunto">Nombre del Conjunto</Label>
                      <Input
                        id="register-conjunto"
                        placeholder="Conjunto Residencial"
                        value={registerData.conjunto}
                        onChange={(e) => setRegisterData({ ...registerData, conjunto: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Contraseña</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-phone">Teléfono</Label>
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="Ej: 3001234567"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full gradient-orange hover:opacity-90 transition-opacity"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
