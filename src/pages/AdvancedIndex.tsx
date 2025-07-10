import React, { useState } from 'react';
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { AdvancedHeader } from '@/components/layout/AdvancedHeader';
import { AdvancedHeroSection } from '@/components/home/AdvancedHeroSection';
import { ProductsSection } from '@/components/products/ProductsSection';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { FloatingParticles } from '@/components/ui/floating-particles';

import { 
  Shield, 
  Zap, 
  Heart, 
  Star, 
  Clock, 
  Award,
  Smartphone,
  MessageCircle,
  Mail,
  MapPin
} from 'lucide-react';

const AdvancedIndex = () => {
  // Estados para el formulario
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [conjunto, setConjunto] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Registro
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Guarda datos adicionales en Firestore
      await addDoc(collection(db, "users"), {
        uid: userCredential.user.uid,
        email,
        conjunto
      });
      setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
      setIsLogin(true);
      setEmail('');
      setPassword('');
      setConjunto('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess('¡Bienvenido!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden">
      <FloatingParticles />
      <AdvancedHeader
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />


      <main className="relative z-10">
        {/* Products Section with Advanced Styling */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-3xl"></div>
          <div className="relative z-10">
            <ProductsSection
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </div>
        </section>

        <AdvancedHeroSection />

        {/* Advanced Features Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-6xl font-black mb-6">
                <AnimatedGradientText size="3xl">
                  Experiencia Premium
                </AnimatedGradientText>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Descubre por qué somos la tienda más avanzada del conjunto residencial
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {[
                {
                  icon: Zap,
                  title: "Entrega Ultra Rápida",
                  description: "15 minutos máximo a tu puerta",
                  color: "from-yellow-400 to-orange-500"
                },
                {
                  icon: Shield,
                  title: "Garantía Total",
                  description: "100% satisfacción garantizada",
                  color: "from-green-400 to-blue-500"
                },
                {
                  icon: Heart,
                  title: "Atención Premium",
                  description: "Servicio personalizado 24/7",
                  color: "from-pink-400 to-red-500"
                },
                {
                  icon: Star,
                  title: "Productos Premium",
                  description: "Solo las mejores marcas",
                  color: "from-purple-400 to-pink-500"
                },
                {
                  icon: Clock,
                  title: "Disponible 24/7",
                  description: "Compra cuando quieras",
                  color: "from-blue-400 to-purple-500"
                },
                {
                  icon: Award,
                  title: "Mejor Calificación",
                  description: "4.9/5 estrellas de satisfacción",
                  color: "from-orange-400 to-red-500"
                }
              ].map((feature, index) => (
                <GlassmorphismCard key={index} className="p-8 text-center group" hover>
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </GlassmorphismCard>
              ))}
            </div>
          </div>
        </section>

        {/* Advanced Footer */}
        <footer className="relative py-20 mt-20">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-bold text-lg">T</span>
                  </div>
                  <AnimatedGradientText size="lg">TiendaUltra</AnimatedGradientText>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  La experiencia de compra más avanzada y premium del conjunto residencial. 
                  Tecnología de vanguardia al servicio de tu comodidad.
                </p>
                <div className="flex space-x-4">
                  <MagneticButton variant="ghost" className="p-3">
                    <Smartphone className="h-5 w-5" />
                  </MagneticButton>
                  <MagneticButton variant="ghost" className="p-3">
                    <MessageCircle className="h-5 w-5" />
                  </MagneticButton>
                  <MagneticButton variant="ghost" className="p-3">
                    <Mail className="h-5 w-5" />
                  </MagneticButton>
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-6 text-lg">Productos Premium</h4>
                <ul className="space-y-4 text-gray-300">
                  {['Bebidas Gourmet', 'Snacks Premium', 'Dulces Artesanales', 'Lácteos Orgánicos'].map((item) => (
                    <li key={item} className="hover:text-orange-400 transition-colors cursor-pointer">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-6 text-lg">Soporte 24/7</h4>
                <ul className="space-y-4 text-gray-300">
                  {['Centro de Ayuda', 'Garantía Premium', 'Devoluciones Express', 'Chat en Vivo'].map((item) => (
                    <li key={item} className="hover:text-orange-400 transition-colors cursor-pointer">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-6 text-lg">Contacto Ultra</h4>
                <div className="space-y-4 text-gray-300">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="h-5 w-5 text-orange-400" />
                    <span>WhatsApp: +57 300 123 4567</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-orange-400" />
                    <span>premium@tiendaultra.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-orange-400" />
                    <span>Conjunto Residencial</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-orange-400" />
                    <span>24/7 - Siempre Disponible</span>
                  </div>
                </div>
              </div>
            </div>
            
            <GlassmorphismCard className="p-6">
              <div className="text-center">
                <p className="text-gray-300">
                  &copy; 2024 TiendaUltra Premium. Todos los derechos reservados. 
                  <span className="text-orange-400 font-semibold"> Powered by Advanced Technology</span>
                </p>
              </div>
            </GlassmorphismCard>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AdvancedIndex;
