
import React, { useEffect, useRef } from 'react';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { ShoppingBag, Zap, Star, Sparkles } from 'lucide-react';

export const AdvancedHeroSection: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.fade-in-element');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <FloatingParticles />
      
      {/* Animated Background Blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-orange-500/30 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-red-500/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8 fade-in-element">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-white/90 text-sm font-medium">Nueva Experiencia de Compra</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                <AnimatedGradientText size="3xl">
                  Tienda
                </AnimatedGradientText>
                <br />
                <span className="text-white">Ultra</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  Premium
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
                Descubre una experiencia de compra revolucionaria con productos premium, 
                tecnología avanzada y el mejor servicio al cliente del conjunto residencial.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <MagneticButton variant="primary" className="group">
                <ShoppingBag className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                Explorar Productos
              </MagneticButton>
              
              <MagneticButton variant="ghost">
                <Zap className="h-5 w-5 mr-2" />
                Ver Ofertas Especiales
              </MagneticButton>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <GlassmorphismCard className="p-4 text-center" hover>
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-sm text-gray-300">Productos</div>
              </GlassmorphismCard>
              
              <GlassmorphismCard className="p-4 text-center" hover>
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm text-gray-300">Disponible</div>
              </GlassmorphismCard>
              
              <GlassmorphismCard className="p-4 text-center" hover>
                <div className="text-2xl font-bold text-white flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-400 mr-1" />
                  4.9
                </div>
                <div className="text-sm text-gray-300">Rating</div>
              </GlassmorphismCard>
            </div>
          </div>

          {/* Right Content - Interactive 3D Card */}
          <div className="fade-in-element">
            <GlassmorphismCard className="p-8 transform rotate-3 hover:rotate-0 transition-all duration-700">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <ShoppingBag className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Compra Inteligente
                  </h3>
                  <p className="text-gray-300">
                    Sistema avanzado de recomendaciones y entrega ultrarrápida
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-orange-400 font-semibold">Entrega</div>
                    <div className="text-white text-sm">15 minutos</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="text-red-400 font-semibold">Disponible</div>
                    <div className="text-white text-sm">24/7</div>
                  </div>
                </div>

                <MagneticButton variant="secondary" className="w-full">
                  Comenzar Ahora
                </MagneticButton>
              </div>
            </GlassmorphismCard>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};
