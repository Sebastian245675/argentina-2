import React, { useState, useEffect, useRef } from 'react';
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
import { 
  ShoppingCart, 
  LogIn, 
  Search, 
  Sparkles, 
  Bell, 
  User, 
  MessageCircle, 
  Package, 
  Menu, 
  X, 
  ChevronDown 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import { useIsMobile } from '@/hooks/use-mobile';
import { useCategories } from '@/hooks/use-categories';

interface AdvancedHeaderProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  promoVisible?: boolean;
  setCategories?: (cats: string[]) => void;
}

export const AdvancedHeader: React.FC<AdvancedHeaderProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  promoVisible,
}) => {
  // Mover el hook useCategories al inicio del componente
  const { mainCategories, subcategoriesByParent } = useCategories();
  const { user, isAuthenticated, login } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [apto, setApto] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const isMobile = useIsMobile();
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);

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
    // Aquí puedes hacer la búsqueda o pasar el valor al componente de productos
  };

  const handleWhatsAppContact = () => {
    const phoneNumber = '573001234567'; // Número de WhatsApp del conjunto
    const message = encodeURIComponent('¡Hola! Me gustaría hacer un pedido desde REGALA ALGO del conjunto.');
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

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
 
  };

  return (
    <>
      <header className={`fixed z-50 w-full bg-white border-b border-slate-200 shadow-lg transition-all duration-300 ${promoVisible ? "top-14" : "top-0"}`}>
        <div className="container mx-auto px-2 md:px-4">
          {/* Main header */}
          <div className="flex h-16 md:h-20 items-center justify-between w-full">
            {/* Mobile Menu Button - Solo visible en móvil */}
            <button 
              className="block sm:hidden p-2" 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Menú"
            >
              {showMobileMenu ? (
                <X className="h-6 w-6 text-neutral-800" />
              ) : (
                <Menu className="h-6 w-6 text-neutral-800" />
              )}
            </button>
            
            {/* Logo */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="relative group">
                <img src="/logo-nuevo.png" alt="Regala Algo" className="h-10 md:h-14 w-auto transform group-hover:scale-105 transition-all duration-300" />
              </div>
            </div>

            {/* Mobile search button - Solo visible en móvil */}
            <button 
              className="block sm:hidden p-2" 
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              aria-label="Buscar"
            >
              <Search className="h-6 w-6 text-neutral-800" />
            </button>

            {/* Centered Search Bar - Oculto en móvil por defecto */}
            <div className={`${showMobileSearch ? 'flex absolute top-16 left-0 right-0 px-2 bg-white z-50 border-b border-slate-200 py-2' : 'hidden'} sm:relative sm:flex-1 sm:flex sm:top-0 sm:border-0 sm:py-0 sm:justify-center`}>
              <form
                onSubmit={handleSearch}
                className="w-full max-w-xl"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar productos, marcas..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-blue-400 transition-all bg-white text-neutral-900 shadow-md text-base sm:text-lg"
                  />
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 sm:h-6 sm:w-6 text-slate-400" />
                </div>
              </form>
              {showMobileSearch && (
                <button className="absolute top-3 right-4" onClick={() => setShowMobileSearch(false)}>
                  <X className="h-5 w-5 text-neutral-500" />
                </button>
              )}
            </div>

            {/* Actions + Argentina Flag */}
            <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
              {/* Argentina Flag */}
              <div className="hidden md:flex items-center mr-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg" alt="Argentina" className="h-6 w-10 object-cover rounded shadow" style={{border: '1px solid #e5e7eb'}} />
              </div>
              {/* Cart Button */}
              <div className="relative">
                <MagneticButton
                  variant="ghost"
                  onClick={() => setShowCart(true)}
                  className="relative p-2 md:p-3 border-slate-300 hover:bg-slate-50"
                >
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 md:h-6 md:w-6 flex items-center justify-center p-0 bg-gradient-to-r from-blue-500 to-slate-700 text-white text-xs font-bold animate-pulse">
                      {itemCount}
                    </Badge>
                  )}
                </MagneticButton>
              </div>

              {/* User Actions */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="px-2 py-1 md:px-4 md:py-2 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="hidden lg:block text-right">
                        <div className="text-xs md:text-sm font-semibold text-slate-800">
                          {userName ? userName.split(' ')[0] : ''}
                        </div>
                        <div className="text-xs text-slate-600">
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
                  className="flex items-center justify-center p-2 md:p-3 rounded-full hover:bg-slate-200 transition-colors"
                  aria-label="Iniciar sesión"
                >
                  <User className="h-6 w-6 text-neutral-900" />
                </MagneticButton>
              )}
            </div>
          </div>

          {/* Navigation - Categorías */}
          {/* Sub barra de navegación - Visible solo en desktop por defecto */}
  <div className={`fixed left-0 right-0 border-b-2 border-slate-200 shadow-sm ${showMobileMenu ? 'block' : 'hidden sm:block'}`} style={{ background: '#1ab8e8', width: '100vw', zIndex: 49 }}>
          <nav className="container mx-auto px-4 py-4 text-base font-bold text-neutral-800 tracking-wide" style={{ fontWeight: 'bold' }}>
          {/* Navegación para móvil - lista vertical */}
          <div className={`sm:hidden ${showMobileMenu ? 'block' : 'hidden'} space-y-4`}>
            {/* Sección de productos en móvil */}
            <div>
              <button
                className="flex w-full justify-between items-center py-2 border-b border-slate-200"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span>Productos</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showDropdown ? 'transform rotate-180' : ''}`} />
              </button>
              {showDropdown && (
                <div className="pl-4 mt-2 space-y-2 max-h-80 overflow-y-auto">
                  {/* Categorías principales */}
                  <div className="mb-3">
                    <h4 className="font-semibold text-sm text-gray-500 mb-1">Categorías principales</h4>
                    {mainCategories.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setShowDropdown(false);
                          setShowMobileMenu(false);
                          // Redirigir a la página principal con la categoría seleccionada
                          navigate(`/?category=${cat.name}`);
                        }}
                        className={`block w-full text-left py-2 ${
                          selectedCategory === cat.name ? "font-bold text-orange-600" : "text-neutral-700"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  {/* Subcategorías agrupadas por categoría principal */}
                  {Object.entries(subcategoriesByParent).map(([parentName, subs]) => (
                    <div key={parentName} className="mb-3">
                      <h4 className="font-semibold text-sm text-gray-500 mt-2 mb-1 border-t pt-2">{parentName}</h4>
                      {subs.map((subcat) => (
                        <button
                          key={subcat.name}
                          onClick={() => {
                            setSelectedCategory(parentName);
                            setShowDropdown(false);
                            setShowMobileMenu(false);
                            // Redirigir con ambos parámetros
                            navigate(`/?category=${parentName}&subcategory=${subcat.name}`);
                          }}
                          className="block w-full text-left py-1.5 pl-3 text-neutral-600 text-sm"
                        >
                          {subcat.name}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
                
                {/* Otros enlaces en móvil */}
                <a href="#novedades" className="block py-2 border-b border-slate-200" onClick={() => setShowMobileMenu(false)}>Novedades</a>
                <button type="button" className="block w-full text-left py-2 border-b border-slate-200" onClick={() => { setShowMobileMenu(false); navigate('/sobre-nosotros'); }}>Sobre nosotros</button>
                    <button type="button" className="block w-full text-left py-2 border-b border-slate-200" onClick={() => { setShowMobileMenu(false); navigate('/envios'); }}>Envíos</button>
                <a href="#costos-envio" className="block py-2 border-b border-slate-200" onClick={() => setShowMobileMenu(false)}>Costos de envío</a>
                <button type="button" className="block w-full text-left py-2" onClick={() => { setShowMobileMenu(false); navigate('/retiros'); }}>Retiros</button>
              </div>

              {/* Navegación para desktop - horizontal */}
              <div className="hidden sm:flex justify-between">
                <div className="flex gap-3 md:gap-8 items-center font-bold">
                  {/* Dropdown Productos */}
                  <div
                    className="relative"
                    onMouseEnter={() => {
                      if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
                      setShowDropdown(true);
                    }}
                    onMouseLeave={() => {
                      dropdownTimeout.current = setTimeout(() => setShowDropdown(false), 250);
                    }}
                  >
                    <button
                      className="hover:text-blue-600 transition-colors flex items-center gap-1"
                      aria-haspopup="true"
                      aria-expanded={showDropdown}
                    >
                      Productos
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                    {showDropdown && (
                      <div className="absolute left-0 mt-2 w-80 bg-white border border-neutral-200 rounded-lg shadow-lg z-50">
                        <div className="py-2">
                          {/* Usar los datos del hook useCategories directamente */}
                          <>
                            {/* Sección de categorías principales */}
                            <div className="mb-2 px-4">
                              <h4 className="font-semibold text-sm text-gray-500 mb-1">Categorías principales</h4>
                              <ul className="grid grid-cols-2 gap-0">
                                {mainCategories.map((cat) => (
                                  <li key={cat.name} className="flex">
                                    <button
                                      onClick={() => {
                                        setSelectedCategory(cat.name);
                                        setShowDropdown(false);
                                        // Redirigir a la página principal con la categoría seleccionada
                                        navigate(`/?category=${cat.name}`);
                                      }}
                                      className={`w-full text-left px-3 py-2 text-base hover:bg-orange-50 hover:text-orange-600 transition-colors rounded-md ${
                                        selectedCategory === cat.name ? "font-bold text-orange-600 bg-orange-50" : "text-neutral-800"
                                      }`}
                                    >
                                      {cat.name}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Mostrar subcategorías agrupadas */}
                            {Object.entries(subcategoriesByParent).map(([parentName, subs]) => (
                              <div key={parentName} className="mb-2 px-4">
                                <h4 className="font-semibold text-sm text-gray-500 mt-2 mb-1 border-t pt-2">
                                  {parentName}
                                </h4>
                                <ul className="grid grid-cols-2 gap-0">
                                  {subs.map((subcat) => (
                                    <li key={subcat.name} className="flex">
                                      <button
                                        onClick={() => {
                                          // Primero seleccionar la categoría padre
                                          setSelectedCategory(parentName);
                                          setShowDropdown(false);
                                          // Redirigir con ambos parámetros
                                          navigate(`/?category=${parentName}&subcategory=${subcat.name}`);
                                        }}
                                        className="w-full text-left px-3 py-1 text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors rounded-md text-neutral-700"
                                      >
                                        {subcat.name}
                                      </button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </>
                        </div>
                      </div>
                    )}
                  </div>
                  <a href="#novedades" className="hover:text-blue-600 transition-colors text-sm md:text-base">Novedades</a>
                  <button type="button" className="hover:text-blue-600 transition-colors text-sm md:text-base bg-transparent" style={{outline: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer'}} onClick={() => navigate('/sobre-nosotros')}>Sobre nosotros</button>
                </div>
                <div className="flex gap-3 md:gap-8 font-bold">
                      <button type="button" className="hover:text-blue-600 transition-colors text-sm md:text-base bg-transparent" style={{outline: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer'}} onClick={() => navigate('/envios')}>Envíos</button>
                  <a href="#costos-envio" className="hover:text-blue-600 transition-colors text-sm md:text-base">Costos de envío</a>
                  <button type="button" className="hover:text-blue-600 transition-colors text-sm md:text-base bg-transparent" style={{outline: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer'}} onClick={() => navigate('/retiros')}>Retiros</button>
                </div>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} />
     
    </>
  );
};
