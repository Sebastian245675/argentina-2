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
 
  };

  return (
    <>
      <header className="fixed top-0 z-50 w-full bg-white border-b border-orange-200 shadow-lg">
        <div className="container mx-auto px-2 md:px-4">
          {/* Main header */}
          <div className="flex h-16 md:h-20 items-center justify-between">
            {/* Logo y Info del Conjunto */}
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                  <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                TiendaUltra
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 md:space-x-3">
              {/* Cart Button */}
              <div className="relative">
                <MagneticButton
                  variant="ghost"
                  onClick={() => setShowCart(true)}
                  className="relative p-2 md:p-3 border-orange-300 hover:bg-orange-50"
                >
                  <ShoppingCart className="h-5 w-5 text-orange-600" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 md:h-6 md:w-6 flex items-center justify-center p-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold animate-pulse">
                      {itemCount}
                    </Badge>
                  )}
                </MagneticButton>
              </div>

              {/* User Actions */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 md:space-x-3">
                
                  <div className="px-2 py-1 md:px-4 md:py-2 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="hidden lg:block text-right">
                        <div className="text-xs md:text-sm font-semibold text-orange-800">
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
                  className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2 rounded-md bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-md transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-400 w-full md:w-auto justify-center text-base md:text-base"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Iniciar Sesión
                </MagneticButton>
              )}
            </div>
          </div>

          {/* Navigation - Categorías */}
          <nav className="flex items-center justify-start md:justify-center gap-2 md:gap-8 overflow-x-auto py-3 text-sm font-medium border-t border-orange-100 bg-orange-50/50 scrollbar-thin scrollbar-thumb-orange-200">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryFilter(category)}
                className={`whitespace-nowrap px-3 py-1 rounded-full transition-colors ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold shadow"
                    : "text-gray-600 hover:text-orange-600 hover:bg-orange-100"
                }`}
              >
                {category}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} />
    </>
  );
};
