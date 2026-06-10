import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { auth } from '@/firebase';
import { getAuthErrorMessage } from '@/lib/auth-email';
import { useAuth } from '@/contexts/AuthContext';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        title: 'Contraseña muy corta',
        description: 'La contraseña debe tener al menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Las contraseñas no coinciden',
        description: 'Por favor, asegúrate de ingresar la misma contraseña en ambos campos.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Supabase actualizará la contraseña del usuario actual de la sesión (establecida por el link de recuperación)
      const { error } = await auth.updateUser({ password });
      if (error) throw error;

      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido restablecida correctamente. Iniciando sesión...',
      });
      
      // Redirigir al inicio
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error al actualizar',
        description: getAuthErrorMessage(error) || 'No se pudo actualizar la contraseña. El enlace podría haber expirado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Si no hay sesión activa (no se ha ingresado con el enlace de recuperación y no está logueado)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white border border-gray-200 p-8 text-center rounded-none shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-2">Enlace inválido o expirado</h2>
          <p className="text-gray-600 mb-6">
            El enlace de recuperación de contraseña es inválido, ha caducado o ya fue utilizado. Por favor, solicita uno nuevo desde la página de inicio de sesión.
          </p>
          <Button
            onClick={() => navigate('/login')}
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5 rounded-none"
          >
            Ir a Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Lado izquierdo - Diseño Vifum */}
      <div className="hidden lg:flex lg:w-1/2 bg-[hsl(214,100%,38%)] flex-col items-center justify-center p-8 relative">
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 text-white hover:text-white/80 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center justify-center">
          <img src="/logo%20vifum.png" alt="Logo" className="h-24 md:h-32 w-auto object-contain" />
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center p-8 lg:p-12 border-l border-gray-200">
        <div className="w-full max-w-md mx-auto">
          {/* Botón de volver para móvil */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">Nueva Contraseña</h1>
            <p className="text-gray-600">Ingresa y confirma tu nueva contraseña para acceder a tu cuenta.</p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-sm font-semibold text-black mb-2 block">
                Nueva Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 py-2.5 border-gray-300 rounded-none focus:border-black focus:ring-0"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-black mb-2 block">
                Confirmar Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 pr-10 py-2.5 border-gray-300 rounded-none focus:border-black focus:ring-0"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5 rounded-none mt-6"
            >
              {isLoading ? 'Actualizando...' : 'Restablecer Contraseña'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
