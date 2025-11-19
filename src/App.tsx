import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Suspense, lazy, useState, useEffect } from "react";
import { CacheProvider } from "@/contexts/CacheContext";
import SimpleSplashScreen from "@/components/ui/SimpleSplashScreen";
import { SimulationNotice } from "@/components/ui/SimulationNotice";

// Lazy loading de las páginas para mejorar el rendimiento
const AdvancedIndex = lazy(() => import("./pages/AdvancedIndex"));
const AdminPanel = lazy(() => import("./pages/AdminPanel").then(module => ({ default: module.AdminPanel })));
const NotFound = lazy(() => import("./pages/NotFound"));
const UserProfile = lazy(() => import("@/components/user/UserProfile").then(module => ({ default: module.UserProfile })));
const ProductDetailPage = lazy(() => import("./pages/ProductDetail"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Retiros = lazy(() => import("./pages/Retiros"));
const SharedEmployeeManager = lazy(() => import("./pages/SharedEmployeeManager"));
const ImageDownloaderPage = lazy(() => import("./pages/ImageDownloaderPage"));
const ImageUrlUpdaterPage = lazy(() => import("./pages/ImageUrlUpdaterPage"));
const AdminImageOrientation = lazy(() => import("./pages/AdminImageOrientation"));
const Testimonios = lazy(() => import("./pages/Testimonios"));
const Envios = lazy(() => import("./pages/Envios"));
const AuthPage = lazy(() => import("./pages/AuthPage").then(module => ({ default: module.AuthPage })));

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Este efecto se ejecutará cuando el componente SplashScreen complete su animación
    const handleSplashComplete = () => {
      setShowSplash(false);
    };

    // Tiempo reducido para mostrar el splash
    const splashTimer = setTimeout(() => {
      handleSplashComplete();
    }, 2500); // Tiempo reducido a la mitad

    // Prevenir traducción automática - soluciona problemas de pantalla blanca
    const preventTranslation = () => {
      // Meta tag para Google Translate
      const metaTranslate = document.querySelector('meta[name="google"]') as HTMLMetaElement;
      if (!metaTranslate) {
        const meta = document.createElement('meta');
        meta.name = 'google';
        meta.content = 'notranslate';
        document.head.appendChild(meta);
      }
      
      // Añadir clases notranslate a elementos críticos
      document.documentElement.classList.add('notranslate');
      document.body.classList.add('notranslate');
      
      // Añadir estilos para prevenir problemas
      const styleEl = document.getElementById('notranslate-styles');
      if (!styleEl) {
        const style = document.createElement('style');
        style.id = 'notranslate-styles';
        style.textContent = `
          .notranslate {
            translate: no !important;
          }
          [translate="no"] {
            translate: no !important;
          }
        `;
        document.head.appendChild(style);
      }
    };
    
    preventTranslation();

    return () => {
      clearTimeout(splashTimer);
    };
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    {/* Agregamos CacheProvider para mejorar el rendimiento */}
    <CacheProvider config={{ maxAge: 24 * 60 * 60 * 1000 }}> {/* 24 horas */}
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            {showSplash && <SimpleSplashScreen />}
            <Toaster />
            <Sonner />
            <SimulationNotice />
            <BrowserRouter>
              <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-950 to-indigo-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
              </div>}>
                <Routes>
                  <Route path="/" element={<AdvancedIndex />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/perfil" element={<UserProfile />} />
                  <Route path="/producto/:productId" element={<ProductDetailPage />} />
                  <Route path="/sobre-nosotros" element={<AboutUs />} />
                  <Route path="/envios" element={<Envios />} />
                  <Route path="/testimonios" element={<Testimonios />} />
                  <Route path="/retiros" element={<Retiros />} />
                  <Route path="/shared/employees" element={<SharedEmployeeManager />} />
                  <Route path="/admin/image-downloader" element={<ImageDownloaderPage />} />
                  <Route path="/admin/update-image-urls" element={<ImageUrlUpdaterPage />} />
                  <Route path="/admin/rotate-image" element={<AdminImageOrientation />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </CacheProvider>
  </QueryClientProvider>
  );
};



export default App;
