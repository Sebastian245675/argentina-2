import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const handleQuickAdminLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, 'admin@tienda.com', 'admin123');
      toast({
        title: "¡Acceso de administrador!",
        description: "Bienvenido al panel de administración",
      });
      onClose();
      setTimeout(() => {
        navigate('/admin');
      }, 500);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo acceder como administrador",
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

    const { email, password, name, phone } = registerData;

    try {
      // Registro en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Guarda el usuario con el UID como ID
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name,
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
      <DialogContent className="sm:max-w-[400px] w-full max-w-[98vw] p-0 overflow-hidden">
        <div className="gradient-orange h-2"></div>
        <DialogHeader className="p-2 sm:p-6 pb-2">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-center gradient-text-orange">
            Bienvenido a la tienda
          </DialogTitle>
          <p className="text-center text-gray-600 text-xs sm:text-sm">Accede a tu cuenta para comprar</p>
        </DialogHeader>

        {/* Cambia aquí: área scrolleable y más compacta */}
        <div className="p-2 sm:p-4 pt-2" style={{maxHeight: '75vh', overflowY: 'auto'}}>
          {/* Panel de Administración */}
         

          <div className="relative mb-3 sm:mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Accede con tu cuenta</span>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-3 sm:mb-4">
              <TabsTrigger value="login" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-base">
                Iniciar Sesión
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-base">
                Crear Cuenta
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pb-2 sm:pb-3">
                  <CardTitle className="text-base sm:text-lg text-gray-800">Iniciar Sesión</CardTitle>
                  <CardDescription>
                    Ingresa con tu cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <form onSubmit={handleLogin} className="space-y-2 sm:space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-orange-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="tu@email.com"
                          className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400 w-full"
                          value={loginData.email}
                          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="login-password">Contraseña</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-orange-400" />
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400 w-full"
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full gradient-orange hover:opacity-90 transition-opacity text-base py-2"
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
                <CardHeader className="px-0 pb-2 sm:pb-3">
                  <CardTitle className="text-base sm:text-lg text-gray-800">Crear Cuenta</CardTitle>
                  <CardDescription>
                    Completa tus datos para registrarte
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <form onSubmit={handleRegister} className="space-y-2 sm:space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="register-name">Nombre Completo</Label>
                      <Input
                        id="register-name"
                        placeholder="Juan Pérez"
                        className="w-full"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                      />
                    </div>
                    {/* Eliminado campo Nombre del Conjunto */}
                    <div className="space-y-1">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="tu@email.com"
                        className="w-full"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="register-password">Contraseña</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        className="w-full"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="register-phone">Teléfono</Label>
                      <Input
                        id="register-phone"
                        type="tel"
                        placeholder="Ej: 3001234567"
                        className="w-full"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full gradient-orange hover:opacity-90 transition-opacity text-base py-2"
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
