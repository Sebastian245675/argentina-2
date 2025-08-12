import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import AdvancedIndex from "./pages/AdvancedIndex";
import { AdminPanel } from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import { UserProfile } from "@/components/user/UserProfile";
import ProductDetailPage from "./pages/ProductDetail";
import AboutUs from "./pages/AboutUs";
import { useState, useEffect } from "react";
import SplashScreen from "@/components/ui/SplashScreen";
import { SimulationNotice } from "@/components/ui/SimulationNotice";
import Retiros from "./pages/Retiros";
import SharedEmployeeManager from "./pages/SharedEmployeeManager";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Este efecto se ejecutará cuando el componente SplashScreen complete su animación
    const handleSplashComplete = () => {
      setShowSplash(false);
    };

    // Agregar un evento para escuchar la finalización del splash
    const splashTimer = setTimeout(() => {
      handleSplashComplete();
    }, 5000); // Tiempo mínimo para mostrar el splash

    return () => {
      clearTimeout(splashTimer);
    };
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          {showSplash && <SplashScreen />}
          <Toaster />
          <Sonner />
          <SimulationNotice />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AdvancedIndex />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/perfil" element={<UserProfile />} />
              <Route path="/producto/:productId" element={<ProductDetailPage />} />
              <Route path="/sobre-nosotros" element={<AboutUs />} />
              <Route path="/envios" element={<Envios />} />
              <Route path="/testimonios" element={<Testimonios />} />
              <Route path="/retiros" element={<Retiros />} />
              <Route path="/shared/employees" element={<SharedEmployeeManager />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

import Testimonios from "./pages/Testimonios";
import Envios from "./pages/Envios";
export default App;
