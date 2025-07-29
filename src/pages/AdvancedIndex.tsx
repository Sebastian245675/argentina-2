import React, { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { TopPromoBar } from "@/components/layout/TopPromoBar";
import { AdvancedHeader } from "@/components/layout/AdvancedHeader";
import { AdvancedHeroSection } from '@/components/home/AdvancedHeroSection';
import { ProductsSection } from '@/components/products/ProductsSection';
import LatestProductsGrid from '@/components/products/LatestProductsGrid';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { FloatingParticles } from '@/components/ui/floating-particles';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCategories } from '@/hooks/use-categories';
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
  MapPin,
  Phone
} from 'lucide-react';

// Colores más neutros y profesionales
const themeColors = {
  primary: {
    light: "from-slate-400 to-gray-600", // Neutro gris
    main: "bg-slate-700",
    text: "text-slate-700",
    accent: "text-slate-900",
    hover: "hover:bg-slate-200",
  },
  secondary: {
    light: "from-blue-400 to-indigo-600", // Azul profesional
    main: "bg-blue-600",
    text: "text-blue-600",
    accent: "text-blue-800",
    hover: "hover:bg-blue-100",
  },
  neutral: {
    background: "bg-gray-50",
    card: "bg-white",
    text: "text-gray-800",
    footer: "bg-gray-900"
  }
};

const carouselImages = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80"
];

function Carousel() {
  const [current, setCurrent] = useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % carouselImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-screen h-[100vh] min-h-[500px] max-h-[1200px] relative overflow-hidden rounded-none shadow-2xl mb-12">
      {/* Overlay con gradiente para dar profundidad y mejor legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent z-20 pointer-events-none"></div>
      
      {carouselImages.map((img, idx) => (
        <div
          key={img}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${current === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <img
            src={img}
            alt={`Banner ${idx + 1}`}
            className="w-full h-full object-cover"
            draggable={false}
          />
          
          {/* Contenido para cada slide */}
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <div className="text-center px-6 max-w-4xl">
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-6 drop-shadow-lg">
                {idx === 0 ? "Productos de Alta Calidad" : 
                 idx === 1 ? "Entrega Rápida y Segura" : 
                 "Precios Competitivos"}
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-8 drop-shadow-md max-w-2xl mx-auto">
                {idx === 0 ? "Ofrecemos los mejores productos para su comodidad y bienestar." : 
                 idx === 1 ? "Reciba sus productos directamente en la puerta de su casa." : 
                 "Los mejores precios del mercado con promociones exclusivas."}
              </p>
              <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition-all transform hover:scale-105">
                Ver Catálogo
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {/* Indicadores de slide */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-40">
        {carouselImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-3 h-3 rounded-full border-2 ${current === idx ? "bg-blue-500 border-blue-500" : "bg-white/70 border-white/70"} transition-all`}
            aria-label={`Ir a la imagen ${idx + 1}`}
          />
        ))}
      </div>
      
      {/* Flechas de navegación */}
      <button 
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center z-40 hover:bg-white/40 transition-all"
        onClick={() => setCurrent((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1))}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center z-40 hover:bg-white/40 transition-all"
        onClick={() => setCurrent((prev) => (prev + 1) % carouselImages.length)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

const AdvancedIndex = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [promoVisible, setPromoVisible] = useState(true);
  // Estados para el formulario
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [conjunto, setConjunto] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { categories, setCategories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  
  // Manejar la categoría y subcategoría desde la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const subcategoryParam = params.get('subcategory');
    
    if (categoryParam) {
      // Esperamos a que las categorías se carguen
      if (categories.length > 1 && categories.includes(categoryParam)) {
        setSelectedCategory(categoryParam);
        
        // Desplazar a la sección de productos
        setTimeout(() => {
          const productosSection = document.getElementById('productos');
          if (productosSection) {
            productosSection.scrollIntoView({ behavior: 'smooth' });
            
            // Si hay subcategoría, seleccionarla después de cargar la categoría principal
            if (subcategoryParam) {
              // Esperar a que la interfaz se actualice con la categoría principal
              setTimeout(() => {
                // Buscar y hacer clic en la subcategoría en la interfaz
                const subcategoryButtons = document.querySelectorAll('.subcategory-button');
                subcategoryButtons.forEach((button) => {
                  const buttonElement = button as HTMLElement;
                  if (buttonElement.innerText.trim() === subcategoryParam) {
                    buttonElement.click();
                  }
                });
              }, 500);
            }
          }
        }, 300);
      }
    }
  }, [location.search, categories]);

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

  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeSuccess, setSubscribeSuccess] = useState("");
  const [subscribeError, setSubscribeError] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribeSuccess("");
    setSubscribeError("");
    if (!subscribeEmail || !subscribeEmail.includes("@")) {
      setSubscribeError("Por favor ingresa un email válido.");
      return;
    }
    try {
      await addDoc(collection(db, "suscripciones"), {
        email: subscribeEmail,
        createdAt: serverTimestamp(),
      });
      setSubscribeSuccess("¡Te suscribiste correctamente! Pronto recibirás nuestras ofertas.");
      setSubscribeEmail("");
    } catch {
      setSubscribeError("Hubo un error. Intenta de nuevo.");
    }
  };

  // Botón flotante de WhatsApp
  const whatsappNumber = '+5493873439775';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`;

  return (
    <div className="min-h-screen bg-white text-neutral-900 overflow-x-hidden">
      {/* Botón flotante WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all"
        title="Contactar por WhatsApp"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
          <path d="M21.67 20.29l-1.2-4.28A8.94 8.94 0 0 0 12 3a9 9 0 0 0-9 9c0 2.39.93 4.58 2.62 6.29l-1.2 4.28a1 1 0 0 0 1.28 1.28l4.28-1.2A8.94 8.94 0 0 0 21 21a1 1 0 0 0 .67-1.71z"></path>
          <path d="M16.24 11.06a4 4 0 0 1-4.24 4.24"></path>
        </svg>
      </a>

      <div className="w-full">
        <TopPromoBar setPromoVisible={setPromoVisible} />
      </div>
      <AdvancedHeader
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        promoVisible={promoVisible}
      />

      {/* Carrusel de imágenes a pantalla completa */}
      <div className="relative z-10">
        <Carousel />
      </div>

      <main className="relative z-10 w-full">

        {/* Products Section with Advanced Styling */}
        <section id="productos" className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-500/5 to-blue-500/10 backdrop-blur-3xl"></div>
          <div className="relative z-10">
            <div className="w-[95%] mx-auto">
              <ProductsSection
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                setCategories={setCategories}
              />
            </div>
          </div>
        </section>


        {/* Sección avanzada: Productos Destacados - Rediseño para móvil y desktop */}
        <section className="py-16 md:py-20 relative overflow-hidden">
          {/* Fondo con efecto mejorado */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-500/10 to-blue-500/15 backdrop-blur-3xl"></div>
          
          {/* Elementos decorativos para móvil y desktop */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl -mr-20 -mt-20 md:hidden"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-slate-500/10 rounded-full blur-3xl -ml-20 -mb-20 md:hidden"></div>
          <div className="hidden md:block absolute top-40 left-1/4 w-56 h-56 bg-blue-300/10 rounded-full blur-2xl"></div>
          <div className="hidden lg:block absolute bottom-20 right-1/4 w-48 h-48 bg-slate-300/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col items-center">
              {/* Título con insignia para móvil y desktop */}
              <div className="flex flex-col items-center mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-2 rounded-full text-sm font-semibold mb-3 shadow-md">
                  Lo Nuevo
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gradient bg-gradient-to-r from-slate-700 via-blue-600 to-gray-800 bg-clip-text text-transparent text-center">
                  Últimos productos agregados
                </h2>
                <div className="h-1.5 w-24 md:w-32 bg-gradient-to-r from-blue-500 to-slate-700 mx-auto mt-4 rounded-full"></div>
                <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mt-5 text-center">
                  Descubre lo más nuevo que hemos agregado a la tienda. ¡No te lo pierdas!
                </p>
              </div>
              
              {/* Contenedor con sombras y bordes mejorados */}
              <div className="w-[95%] md:w-[90%] lg:w-[85%] max-w-7xl mx-auto bg-white/30 backdrop-blur-sm rounded-2xl p-3 md:p-6 shadow-lg border border-white/20">
                {/* Mostrar solo los 3 últimos productos agregados */}
                <LatestProductsGrid maxItems={3} sortBy="createdAt" sortOrder="desc" />
              </div>
              
              {/* Botón "Ver más" - solo visible en móvil */}
              <div className="mt-6 md:hidden">
                <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-slate-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all">
                  Ver más productos
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* <AdvancedHeroSection /> */} {/* Elimina o comenta esta línea */}

        {/* Sección de Innovación y Experiencia Premium */}
        <section className="py-16 md:py-24 relative bg-gradient-to-b from-white to-blue-50/50 overflow-hidden">
          {/* Elementos decorativos de fondo mejorados */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 -left-20 w-72 h-72 bg-slate-200/30 rounded-full blur-3xl"></div>
            <div className="hidden md:block absolute top-40 right-1/4 w-32 h-32 bg-blue-400/10 rounded-full blur-xl"></div>
            <div className="hidden lg:block absolute top-20 left-1/4 w-48 h-48 bg-slate-300/10 rounded-full blur-2xl"></div>
            <div className="hidden lg:block absolute bottom-40 right-1/3 w-36 h-36 bg-blue-300/10 rounded-full blur-2xl"></div>
          </div>

          <div className="w-11/12 md:w-[85%] lg:w-[80%] max-w-6xl mx-auto relative z-10">
            {/* Encabezado renovado con diseño moderno */}
            <div className="relative mb-16 md:mb-20 bg-white/80 backdrop-blur-md py-8 md:py-10 px-4 rounded-2xl shadow-lg border border-slate-100">
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm font-semibold px-6 py-2 rounded-full shadow-md">
                  Innovación y Experiencia Premium
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mt-4 mb-6 text-center bg-gradient-to-r from-slate-800 via-blue-700 to-slate-700 bg-clip-text text-transparent">
                Por qué elegir REGALA ALGO
              </h2>
              <div className="h-1.5 w-24 md:w-32 bg-gradient-to-r from-blue-500 to-slate-700 mx-auto mb-6 rounded-full"></div>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto text-center leading-relaxed">
                Combinamos tecnología, servicio personalizado y productos exclusivos para brindarte
                <span className="font-bold text-blue-700"> la mejor experiencia de compra</span>.
                Entregas rápidas y atención 24/7.
              </p>
            </div>

            {/* Tarjetas de características con diseño mejorado para desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 xl:gap-8 mb-16 max-w-[1400px] mx-auto">
              {[
                {
                  icon: Zap,
                  title: "Entrega Ultra Rápida",
                  description: "15 minutos máximo a tu puerta",
                  color: "from-blue-500 to-blue-700",
                  highlight: true
                },
                {
                  icon: Shield,
                  title: "Garantía Total",
                  description: "100% satisfacción garantizada",
                  color: "from-slate-600 to-slate-800"
                },
                {
                  icon: Heart,
                  title: "Atención Premium",
                  description: "Servicio personalizado 24/7",
                  color: "from-blue-600 to-blue-800",
                  highlight: true
                },
                {
                  icon: Star,
                  title: "Productos Premium",
                  description: "Solo las mejores marcas",
                  color: "from-slate-700 to-slate-900"
                },
                {
                  icon: Clock,
                  title: "Disponible 24/7",
                  description: "Compra cuando quieras",
                  color: "from-blue-500 to-blue-700"
                },
                {
                  icon: Award,
                  title: "Mejor Calificación",
                  description: "4.9/5 estrellas de satisfacción",
                  color: "from-slate-600 to-slate-800",
                  highlight: true
                }
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className={`relative group bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${feature.highlight ? 'ring-2 ring-blue-300/50' : ''}`}
                >
                  {/* Fondo superior con gradiente mejorado */}
                  <div className={`h-28 bg-gradient-to-r ${feature.color} w-full`}></div>
                  
                  {/* Contenido con icono superpuesto */}
                  <div className="px-6 pb-8 pt-16 relative text-center">
                    {/* Icono flotante */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                      <div className={`w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="h-12 w-12 text-blue-600" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-bold mb-3 mt-2 text-slate-800">{feature.title}</h3>
                    <p className="text-slate-600 text-base md:text-lg">{feature.description}</p>
                  </div>
                  
                  {/* Decoración inferior mejorada */}
                  <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              ))}
            </div>
            
            {/* Banner informativo mejorado */}
            <div className="max-w-5xl mx-auto bg-gradient-to-r from-slate-800 via-blue-800 to-slate-900 text-white rounded-2xl p-6 md:p-8 lg:p-10 shadow-xl flex flex-col md:flex-row items-center gap-6 md:gap-10 border border-white/10">
              <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl hidden md:flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 lg:h-20 lg:w-20 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3">¿Quieres más beneficios exclusivos?</h3>
                <p className="text-blue-100 text-base lg:text-lg mb-5 max-w-2xl">Registra tu cuenta ahora y accede a descuentos especiales y promociones personalizadas diseñadas específicamente para ti.</p>
                <button className="bg-white text-blue-900 hover:bg-blue-50 transition-all transform hover:scale-105 font-medium px-6 py-3 rounded-lg shadow-md inline-flex items-center space-x-2">
                  <span>Crear cuenta</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonios de clientes */}
        <section className="w-[95%] mx-auto py-16 px-4">
          <h3 className="text-3xl font-extrabold text-center mb-10 tracking-tight text-neutral-900">
            Lo que dicen nuestros clientes
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Cliente 1" className="w-16 h-16 rounded-full mb-4 shadow" />
              <p className="text-lg text-neutral-700 font-medium mb-2 text-center">
                "¡Entrega ultra rápida y productos de calidad premium! Recomiendo totalmente REGALA ALGO."
              </p>
              <span className="text-sm text-blue-600 font-bold">Carlos G.</span>
              <span className="text-xs text-neutral-400">Conjunto Mirador</span>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center">
              <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Cliente 2" className="w-16 h-16 rounded-full mb-4 shadow" />
              <p className="text-lg text-neutral-700 font-medium mb-2 text-center">
                "El mejor servicio del conjunto. Atención personalizada y precios justos."
              </p>
              <span className="text-sm text-blue-600 font-bold">María P.</span>
              <span className="text-xs text-neutral-400">Conjunto Cedros</span>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center">
              <img src="https://randomuser.me/api/portraits/men/65.jpg" alt="Cliente 3" className="w-16 h-16 rounded-full mb-4 shadow" />
              <p className="text-lg text-neutral-700 font-medium mb-2 text-center">
                "Gran variedad de productos y entregas siempre a tiempo. ¡5 estrellas!"
              </p>
              <span className="text-sm text-blue-600 font-bold">Andrés L.</span>
              <span className="text-xs text-neutral-400">Conjunto Bosques</span>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center">
              <img src="https://randomuser.me/api/portraits/women/68.jpg" alt="Cliente 4" className="w-16 h-16 rounded-full mb-4 shadow" />
              <p className="text-lg text-neutral-700 font-medium mb-2 text-center">
                "Me encanta la facilidad de compra y la atención rápida por WhatsApp."
              </p>
              <span className="text-sm text-blue-600 font-bold">Laura M.</span>
              <span className="text-xs text-neutral-400">Conjunto Jardines</span>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center">
              <img src="https://randomuser.me/api/portraits/men/42.jpg" alt="Cliente 5" className="w-16 h-16 rounded-full mb-4 shadow" />
              <p className="text-lg text-neutral-700 font-medium mb-2 text-center">
                "Siempre encuentro lo que necesito a precios muy competitivos."
              </p>
              <span className="text-sm text-blue-600 font-bold">Roberto S.</span>
              <span className="text-xs text-neutral-400">Conjunto Pinos</span>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center">
              <img src="https://randomuser.me/api/portraits/women/33.jpg" alt="Cliente 6" className="w-16 h-16 rounded-full mb-4 shadow" />
              <p className="text-lg text-neutral-700 font-medium mb-2 text-center">
                "Excelentes promociones y productos siempre frescos. ¡Son los mejores!"
              </p>
              <span className="text-sm text-blue-600 font-bold">Carolina T.</span>
              <span className="text-xs text-neutral-400">Conjunto Palmas</span>
            </div>
          </div>
        </section>

        {/* Sección de Redes Sociales */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl lg:text-4xl font-black mb-4 text-gradient bg-gradient-to-r from-slate-700 via-blue-600 to-gray-800 bg-clip-text text-transparent">
                Síguenos en Redes Sociales
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Mantente al día con nuestras últimas promociones, productos nuevos y contenido exclusivo.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8">
              {/* Instagram */}
              <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center w-full md:w-64 transition-transform hover:scale-105">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Instagram</h3>
                <p className="text-gray-600 mb-4 text-center">Síguenos y descubre nuestros productos</p>
                <a href="https://www.instagram.com/Regalo.Algo" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline text-lg">
                  @Regalo.Algo
                </a>
              </div>
              
              {/* Facebook */}
              <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center w-full md:w-64 transition-transform hover:scale-105">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-blue-800 flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Facebook</h3>
                <p className="text-gray-600 mb-4 text-center">Conéctate con nuestra comunidad</p>
                <a href="https://www.facebook.com/RegalaAlgo" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline text-lg">
                  Regala Algo
                </a>
              </div>
              
              {/* WhatsApp */}
              <div className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center w-full md:w-64 transition-transform hover:scale-105">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-green-500 to-green-700 flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">WhatsApp</h3>
                <p className="text-gray-600 mb-4 text-center">Contáctanos directamente</p>
                <a href="https://wa.me/573001234567" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline text-lg">
                  +57 300 123 4567
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Suscripción */}
        <div className="w-[80%] mx-auto mt-20 rounded-2xl p-10 shadow-2xl border border-neutral-200 text-center relative overflow-hidden"
     style={{ background: "rgba(30,30,30,0.06)", backdropFilter: "blur(2px)" }}>
          <h3 className="text-2xl md:text-3xl font-extrabold text-neutral-900 mb-3 mt-2 tracking-wide uppercase">
            Recibí las ofertas antes que nadie
          </h3>
          <p className="mb-8 text-neutral-700 text-base md:text-lg font-medium">
            Déjanos tu email para enviarte promociones y lanzamientos personalizados.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 items-center justify-center max-w-3xl mx-auto">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              value={subscribeEmail}
              onChange={e => setSubscribeEmail(e.target.value)}
              className="flex-1 p-4 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg bg-white/90 placeholder:text-neutral-400 text-neutral-900"
              required
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-slate-800 via-blue-600 to-slate-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition-all text-lg"
            >
              Suscribirme
            </button>
          </form>
          {subscribeSuccess && <div className="text-green-700 mt-6 font-semibold">{subscribeSuccess}</div>}
          {subscribeError && <div className="text-red-600 mt-6 font-semibold">{subscribeError}</div>}
          <div className="absolute -bottom-8 right-8 text-5xl opacity-10 pointer-events-none select-none">
    <Mail className="w-16 h-16 text-neutral-900" />
  </div>
        </div>


        {/* Advanced Footer */}
        <footer className="relative py-20 mt-20 bg-neutral-800">
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          <div className="w-[95%] mx-auto px-4 relative z-10">
            <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-12 mb-12">
              <div className="space-y-6 lg:col-span-2">
                <div className="flex items-center space-x-3">
                  <img src="/logo-nuevo.png" alt="REGALA ALGO Logo" className="h-16 w-auto" />
                  <AnimatedGradientText size="lg">REGALA ALGO</AnimatedGradientText>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Lo que trta la tienda. La mejor experiencia de compra para encontrar el regalo perfecto.
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
                <h4 className="font-bold text-white mb-6 text-lg">Soporte 24/7</h4>
                <ul className="space-y-4 text-gray-300">
                  {['Centro de Ayuda', 'Garantía Premium'].map((item) => (
                    <li key={item} className="hover:text-blue-400 transition-colors cursor-pointer">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-6 text-lg">Contacto</h4>
                <div className="space-y-4 text-gray-300">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="h-5 w-5 text-blue-400" />
                    <span>WhatsApp: +57 300 123 4567</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-400" />
                    <span>contacto@regalaalgo.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>Instagram: <a href="https://www.instagram.com/Regalo.Algo" target="_blank" className="text-blue-400 hover:underline">@Regalo.Algo</a></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                    </svg>
                    <span>Facebook: <a href="https://www.facebook.com/RegalaAlgo" target="_blank" className="text-blue-400 hover:underline">Regala Algo</a></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <span>24/7 - Siempre Disponible</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-6 text-lg">Enlaces Rápidos</h4>
                <ul className="space-y-4 text-gray-300">
                  {['Catálogo Completo', 'Ofertas Especiales', 'Mi Cuenta', 'Mis Pedidos'].map((item) => (
                    <li key={item} className="hover:text-blue-400 transition-colors cursor-pointer">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <GlassmorphismCard className="p-6 bg-neutral-700/80 border-none">
              <div className="text-center">
                <p className="text-gray-200">
                  &copy; 2025 REGALA ALGO Premium. Todos los derechos reservados. 
                  <span className="text-blue-400 font-semibold"> sebastian</span>
                </p>
              </div>
            </GlassmorphismCard>
          </div>
        </footer>
      </main>
      
      {/* Botón flotante de WhatsApp */}
      <a 
        href="https://wa.me/573001234567" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-xl hover:bg-green-600 transition-all hover:scale-110 z-50"
        aria-label="Contáctanos por WhatsApp"
      >
        <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </a>
    </div>
  );
};

export default AdvancedIndex;
