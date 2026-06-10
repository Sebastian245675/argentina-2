import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/firebase';
import { getAuthErrorMessage, isEmailConfirmationPendingError } from '@/lib/auth-email';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirigir si ya está logueado
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const [resetEmail, setResetEmail] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors = {
      email: '',
      password: '',
    };

    if (!loginData.email || !validateEmail(loginData.email)) {
      nextErrors.email = 'Email invalido';
    }

    if (!loginData.password || loginData.password.length < 6) {
      nextErrors.password = 'Contrasena debe tener al menos 6 caracteres';
    }

    if (nextErrors.email || nextErrors.password) {
      setErrors(nextErrors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(loginData.email, loginData.password);

      if (!result.success) {
        throw result.error;
      }

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', loginData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      toast({
        title: 'Bienvenido',
        description: 'Sesion iniciada correctamente.',
      });

      navigate('/');
    } catch (error) {
      if (isEmailConfirmationPendingError(error)) {
        toast({
          title: 'Confirma tu correo',
          description: 'Tu cuenta existe, pero falta confirmar el email antes de iniciar sesion.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error de login',
          description: getAuthErrorMessage(error) || 'No se pudo iniciar sesion',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail || !validateEmail(resetEmail)) {
      toast({
        title: 'Email invalido',
        description: 'Por favor ingresa un email valido',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;

      toast({
        title: 'Email enviado',
        description: 'Revisa tu email para restablecer tu contrasena.',
      });
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      toast({
        title: 'Error',
        description: getAuthErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[hsl(214,100%,38%)] flex-col items-center justify-center p-8">
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

      <div className="w-full lg:w-1/2 bg-white flex flex-col">
        <div className="lg:hidden bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center">
            <img src="/logo%20vifum.png" alt="Logo" className="h-10 w-auto object-contain" />
          </div>
          <div className="w-10"></div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            {!showForgotPassword ? (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-black mb-2">Entrar</h1>
                  <p className="text-gray-600">Accede a tu cuenta para continuar</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold text-black mb-2 block">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={loginData.email}
                        onChange={(e) => {
                          setLoginData({ ...loginData, email: e.target.value });
                          setErrors({ ...errors, email: '' });
                        }}
                        className="pl-10 py-2.5 border-gray-300 rounded-none focus:border-black focus:ring-0"
                      />
                    </div>
                    {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="password" className="text-sm font-semibold text-black block">
                        Contrasena
                      </Label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-xs text-gray-500 hover:text-black transition-colors"
                      >
                        Olvidaste tu contrasena?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="........"
                        value={loginData.password}
                        onChange={(e) => {
                          setLoginData({ ...loginData, password: e.target.value });
                          setErrors({ ...errors, password: '' });
                        }}
                        className="pl-10 pr-10 py-2.5 border-gray-300 rounded-none focus:border-black focus:ring-0"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
                  </div>

                  <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer pt-2">
                    <Checkbox checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked === true)} />
                    Recordarme
                  </label>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5 rounded-none mt-6"
                  >
                    {isLoading ? 'Ingresando...' : 'Ingresar'}
                  </Button>
                </form>

                <div className="mt-6 text-center border-t border-gray-200 pt-6">
                  <p className="text-gray-600 text-sm">
                    No tienes cuenta?{' '}
                    <button
                      onClick={() => navigate('/register')}
                      className="text-black font-semibold hover:underline"
                    >
                      Registrate aqui
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="mb-8">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors mb-4"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver
                  </button>
                  <h1 className="text-3xl font-bold text-black mb-2">Recuperar acceso</h1>
                  <p className="text-gray-600">Ingresa tu email para recibir instrucciones</p>
                </div>

                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-email" className="text-sm font-semibold text-black mb-2 block">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="pl-10 py-2.5 border-gray-300 rounded-none focus:border-black focus:ring-0"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5 rounded-none mt-6"
                  >
                    {isLoading ? 'Enviando...' : 'Enviar email'}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
