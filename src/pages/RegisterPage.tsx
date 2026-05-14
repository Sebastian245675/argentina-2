import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import {
  getAuthErrorMessage,
  isAlreadyRegisteredError,
  isEmailRateLimitError,
  registerUserWithEmail,
  resendSignupConfirmationEmail,
} from '@/lib/auth-email';

type RegisterStep = 'personal' | 'account' | 'verification';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);
  const [requiresEmailConfirmation, setRequiresEmailConfirmation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registerStep, setRegisterStep] = useState<RegisterStep>('personal');

  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: '',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => password.length >= 6;

  const validatePhoneNumber = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 8 && digits.length <= 15;
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: '',
    };

    if (registerStep === 'personal') {
      if (!registerData.name.trim()) {
        newErrors.name = 'El nombre es requerido';
      }

      if (!registerData.email || !validateEmail(registerData.email)) {
        newErrors.email = 'Email invalido';
      }

      if (!registerData.phone || !validatePhoneNumber(registerData.phone)) {
        newErrors.phone = 'Telefono debe tener entre 8 y 15 digitos';
      }

      if (newErrors.name || newErrors.email || newErrors.phone) {
        setErrors(newErrors);
        return;
      }

      setRegisterStep('account');
      return;
    }

    if (!registerData.password || !validatePassword(registerData.password)) {
      newErrors.password = 'Contrasena debe tener al menos 6 caracteres';
    }

    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Las contrasenas no coinciden';
    }

    if (newErrors.password || newErrors.confirmPassword) {
      setErrors(newErrors);
      return;
    }

    setRegisterStep('verification');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerData.acceptTerms) {
      setErrors(prev => ({
        ...prev,
        acceptTerms: 'Debes aceptar los terminos y condiciones',
      }));
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUserWithEmail({
        email: registerData.email,
        password: registerData.password,
        name: registerData.name,
        phone: registerData.phone,
        address: registerData.address,
      });

      setRequiresEmailConfirmation(result.requiresEmailConfirmation);
      setRegistrationCompleted(true);

      toast({
        title: result.requiresEmailConfirmation ? 'Cuenta creada' : 'Registro exitoso',
        description: result.requiresEmailConfirmation
          ? 'Revisa tu correo para confirmar la cuenta.'
          : 'Tu cuenta ya esta activa.',
      });
    } catch (error) {
      if (isAlreadyRegisteredError(error)) {
        setErrors(prev => ({
          ...prev,
          email: 'Este email ya esta registrado',
        }));
        setRegisterStep('personal');
      } else {
        toast({
          title: 'Error en el registro',
          description: getAuthErrorMessage(error) || 'No se pudo completar el registro',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setIsResendingConfirmation(true);

    try {
      await resendSignupConfirmationEmail(registerData.email);
      toast({
        title: 'Correo reenviado',
        description: 'Te enviamos un nuevo enlace de confirmacion.',
      });
    } catch (error) {
      toast({
        title: isEmailRateLimitError(error) ? 'Espera un momento' : 'No se pudo reenviar',
        description: isEmailRateLimitError(error)
          ? 'Supabase limito temporalmente el envio. Intenta de nuevo en unos minutos.'
          : getAuthErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setIsResendingConfirmation(false);
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

        <div className="flex-1 flex items-center justify-center p-8 lg:p-12 overflow-y-auto">
          <div className="w-full max-w-md">
            {!registrationCompleted && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      registerStep === 'personal' || registerStep === 'account' || registerStep === 'verification'
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    1
                  </div>
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      registerStep === 'account' || registerStep === 'verification'
                        ? 'bg-black'
                        : 'bg-gray-300'
                    }`}
                  ></div>
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      registerStep === 'account' || registerStep === 'verification'
                        ? 'bg-black text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    2
                  </div>
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      registerStep === 'verification' ? 'bg-black' : 'bg-gray-300'
                    }`}
                  ></div>
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      registerStep === 'verification' ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    3
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">
                {registrationCompleted ? 'Cuenta creada' : 'Registrarse'}
              </h1>
              <p className="text-gray-600">
                {registrationCompleted
                  ? requiresEmailConfirmation
                    ? 'Te dejamos el siguiente paso para activar tu acceso'
                    : 'Tu acceso ya esta listo'
                  : registerStep === 'personal'
                    ? 'Informacion personal'
                    : registerStep === 'account'
                      ? 'Crear cuenta'
                      : 'Terminos y condiciones'}
              </p>
            </div>

            {registrationCompleted ? (
              <div className="space-y-6">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-7 w-7 text-green-600" />
                  </div>
                  <h2 className="mb-2 text-xl font-semibold text-black">
                    {requiresEmailConfirmation ? 'Revisa tu correo' : 'Ya puedes entrar'}
                  </h2>
                  <p className="text-sm leading-6 text-gray-600">
                    {requiresEmailConfirmation ? (
                      <>
                        Enviamos un correo de confirmacion a <strong>{registerData.email}</strong>. Revisa tambien
                        spam o promociones antes de reenviarlo.
                      </>
                    ) : (
                      <>
                        La cuenta de <strong>{registerData.email}</strong> ya quedo activa.
                      </>
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  {requiresEmailConfirmation && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResendConfirmation}
                      disabled={isResendingConfirmation}
                      className="w-full border-gray-300 hover:bg-gray-100 py-2.5 rounded-none"
                    >
                      {isResendingConfirmation ? 'Reenviando...' : 'Reenviar correo'}
                    </Button>
                  )}
                  <Button
                    type="button"
                    onClick={() => navigate(requiresEmailConfirmation ? '/login' : '/')}
                    className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5 rounded-none"
                  >
                    {requiresEmailConfirmation ? 'Ir a iniciar sesion' : 'Ir al inicio'}
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <form
                  onSubmit={registerStep === 'verification' ? handleRegister : handleNextStep}
                  className="space-y-4"
                >
                  {registerStep === 'personal' && (
                    <>
                      <div>
                        <Label htmlFor="name" className="text-sm font-semibold text-black mb-2 block">
                          Nombre completo
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="Tu nombre"
                            value={registerData.name}
                            onChange={(e) => {
                              setRegisterData({ ...registerData, name: e.target.value });
                              setErrors({ ...errors, name: '' });
                            }}
                            className="pl-10 py-2.5 border-gray-300 rounded-none focus:border-black focus:ring-0"
                          />
                        </div>
                        {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                      </div>

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
                            value={registerData.email}
                            onChange={(e) => {
                              setRegisterData({ ...registerData, email: e.target.value });
                              setErrors({ ...errors, email: '' });
                            }}
                            className="pl-10 py-2.5 border-gray-300 rounded-none focus:border-black focus:ring-0"
                          />
                        </div>
                        {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-sm font-semibold text-black mb-2 block">
                          Telefono
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="1234567890"
                            value={registerData.phone}
                            onChange={(e) => {
                              setRegisterData({ ...registerData, phone: e.target.value });
                              setErrors({ ...errors, phone: '' });
                            }}
                            className="pl-10 py-2.5 border-gray-300 rounded-none focus:border-black focus:ring-0"
                          />
                        </div>
                        {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-2.5 rounded-none mt-6 flex items-center justify-center gap-2"
                      >
                        Siguiente <ArrowRight className="w-4 h-4" />
                      </Button>
                    </>
                  )}

                  {registerStep === 'account' && (
                    <>
                      <div>
                        <Label htmlFor="password" className="text-sm font-semibold text-black mb-2 block">
                          Contrasena
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="........"
                            value={registerData.password}
                            onChange={(e) => {
                              setRegisterData({ ...registerData, password: e.target.value });
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

                      <div>
                        <Label htmlFor="confirm-password" className="text-sm font-semibold text-black mb-2 block">
                          Confirmar contrasena
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <Input
                            id="confirm-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="........"
                            value={registerData.confirmPassword}
                            onChange={(e) => {
                              setRegisterData({ ...registerData, confirmPassword: e.target.value });
                              setErrors({ ...errors, confirmPassword: '' });
                            }}
                            className="pl-10 pr-10 py-2.5 border-gray-300 rounded-none focus:border-black focus:ring-0"
                          />
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="address" className="text-sm font-semibold text-black mb-2 block">
                          Direccion (opcional)
                        </Label>
                        <Input
                          id="address"
                          type="text"
                          placeholder="Tu direccion"
                          value={registerData.address}
                          onChange={(e) => setRegisterData({ ...registerData, address: e.target.value })}
                          className="py-2.5 border-gray-300 rounded-none focus:border-black focus:ring-0"
                        />
                      </div>

                      <div className="flex gap-2 mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setRegisterStep('personal')}
                          className="flex-1 border-gray-300 hover:bg-gray-100 py-2.5 rounded-none"
                        >
                          Atras
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 bg-black hover:bg-gray-800 text-white font-semibold py-2.5 rounded-none flex items-center justify-center gap-2"
                        >
                          Siguiente <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}

                  {registerStep === 'verification' && (
                    <>
                      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                        <div className="flex gap-4">
                          <CheckCircle2 className="w-6 h-6 text-black flex-shrink-0" />
                          <div>
                            <h3 className="font-semibold text-black mb-2">Resumen de registro</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><strong>Nombre:</strong> {registerData.name}</p>
                              <p><strong>Email:</strong> {registerData.email}</p>
                              <p><strong>Telefono:</strong> {registerData.phone}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <label className="flex items-start gap-3 cursor-pointer mb-6">
                        <Checkbox
                          checked={registerData.acceptTerms}
                          onCheckedChange={(checked) => {
                            setRegisterData({ ...registerData, acceptTerms: checked === true });
                            setErrors({ ...errors, acceptTerms: '' });
                          }}
                          className="mt-1"
                        />
                        <span className="text-sm text-gray-600">
                          Acepto los terminos y condiciones y la politica de privacidad
                        </span>
                      </label>
                      {errors.acceptTerms && (
                        <p className="text-red-600 text-xs -mt-4 mb-4">{errors.acceptTerms}</p>
                      )}

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setRegisterStep('account')}
                          className="flex-1 border-gray-300 hover:bg-gray-100 py-2.5 rounded-none"
                        >
                          Atras
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 bg-black hover:bg-gray-800 text-white font-semibold py-2.5 rounded-none"
                        >
                          {isLoading ? 'Registrando...' : 'Completar registro'}
                        </Button>
                      </div>
                    </>
                  )}
                </form>

                {registerStep === 'personal' && (
                  <div className="mt-6 text-center border-t border-gray-200 pt-6">
                    <p className="text-gray-600 text-sm">
                      Ya tienes cuenta?{' '}
                      <button
                        onClick={() => navigate('/login')}
                        className="text-black font-semibold hover:underline"
                      >
                        Ingresa aqui
                      </button>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
