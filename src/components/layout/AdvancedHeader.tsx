import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { MagneticButton } from '@/components/ui/magnetic-button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { CartSidebar } from '@/components/cart/CartSidebar';
import { UserMenu } from '@/components/user/UserMenu';
import { ShoppingCart, LogIn, Search, Sparkles, Bell, User, MessageCircle, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";

interface AdvancedHeaderProps {
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
}

export const AdvancedHeader: React.FC<AdvancedHeaderProps> = ({ selectedCategory, setSelectedCategory }) => {
  const { user, isAuthenticated, login } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [apto, setApto] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  const itemCount = getItemCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Buscar:', searchQuery);
  };

  const handleWhatsAppContact = () => {
    const phoneNumber = '573001234567'; // Número de WhatsApp del conjunto
    const message = encodeURIComponent('¡Hola! Me gustaría hacer un pedido desde TiendaUltra del conjunto.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const scrollToProducts = () => {
    const productsSection = document.getElementById('productos');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Busca el usuario en Firestore por su UID
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name || '');
          setApto(userDoc.data().departmentNumber || '');
        } else {
          setUserName(firebaseUser.email || '');
          setApto('');
        }
      } else {
        setUserName('');
        setApto('');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "categories"));
      setCategories(["Todos", ...querySnapshot.docs.map(doc => doc.data().name)]);
    };
    fetchCategories();
  }, []);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    // Aquí puedes agregar la lógica para filtrar los productos por categoría
  };

  return (
    <>
      <header className="fixed top-0 z-50 w-full bg-white border-b border-orange-200 shadow-lg">
        <div className="container mx-auto px-4">
          {/* Main header */}
          <div className="flex h-20 items-center justify-between">
            {/* Logo y Info del Conjunto */}
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                  TiendaUltra
                </span>
           
              </div>
            </div>

            {/* Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
           
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* WhatsApp Contact Button */}
            

              {/* Cart Button */}
              <div className="relative">
                <MagneticButton
                  variant="ghost"
                  onClick={() => setShowCart(true)}
                  className="relative p-3 border-orange-300 hover:bg-orange-50"
                >
                  <ShoppingCart className="h-5 w-5 text-orange-600" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold animate-pulse">
                      {itemCount}
                    </Badge>
                  )}
                </MagneticButton>
              </div>

              {/* User Actions - Login/Admin Panel integrado */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                    <Bell className="h-4 w-4" />
                  </Button>
                  <div className="px-4 py-2 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-3">
                      <div className="hidden lg:block text-right">
                        <div className="text-sm font-semibold text-orange-800">
                          {userName ? userName.split(' ')[0] : ''}
                        </div>
                        <div className="text-xs text-orange-600">
                          {apto ? `Apto ${apto}` : ''}
                        </div>
                      </div>
                      <UserMenu user={user} />
                    </div>
                  </div>
                </div>
              ) : (
                <MagneticButton 
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </MagneticButton>
              )}
            </div>
          </div>

          {/* Navigation - Productos arriba */}
          <nav className="flex items-center justify-center space-x-8 py-4 text-sm font-medium border-t border-orange-100 bg-orange-50/50">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`text-gray-600 hover:text-orange-600 transition-colors flex items-center space-x-2 ${
                  selectedCategory === category ? "font-bold text-orange-700 underline" : ""
                }`}
              >
                <span>{category}</span>
              </button>
            ))}
          </nav>

          {/* Mobile Search */}
       
            </div>
          
      
      </header>

      {/* Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} />
    </>
  );
};
