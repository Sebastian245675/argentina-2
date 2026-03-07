import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, User, HelpCircle, Search, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';
import type { Category } from '@/hooks/use-categories';

interface AdvancedHeaderProps {
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  promoVisible?: boolean;
  mainCategories?: Category[];
  subcategoriesByParent?: Record<string, Category[]>;
  thirdLevelBySubcategory?: Record<string, Category[]>;
  searchTerm?: string;
  onSearch?: (val: string) => void;
}

export const AdvancedHeader: React.FC<AdvancedHeaderProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  promoVisible,
  mainCategories = [],
  subcategoriesByParent = {},
  thirdLevelBySubcategory = {},
  searchTerm = '',
  onSearch,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const itemCount = getItemCount();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState<string | null>(null);
  const [openAyudaDropdown, setOpenAyudaDropdown] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');
  const accountMenuTimer = useRef<NodeJS.Timeout | null>(null);
  const categoryDropdownTimer = useRef<NodeJS.Timeout | null>(null);

  // Sincronizar local con prop cuando esta cambie externamente
  React.useEffect(() => {
    setLocalSearchTerm(searchTerm || '');
  }, [searchTerm]);

  // Solo categorías desde la BD (sin "Todos"). Sin fallback estático.
  const mainCategoriesForNav = categories.filter((c) => c !== "Todos");

  const goToCategory = (name: string) => {
    setIsMenuOpen(false);
    setOpenCategoryDropdown(null);
    setOpenAyudaDropdown(false);
    navigate(`/categoria/${encodeURIComponent(name)}`);
  };

  const getSubsForMain = (mainName: string) =>
    subcategoriesByParent[mainName] ?? [];
  const getThirdsForSub = (subId: string) =>
    thirdLevelBySubcategory[subId] ?? [];

  const handleSearchChange = (val: string) => {
    setLocalSearchTerm(val);
    if (onSearch) {
      onSearch(val);
    }

    // Si no estamos en la home y hay texto, ir a la home
    if (window.location.pathname !== '/' && val.length > 0) {
      navigate(`/?search=${encodeURIComponent(val)}`);
    } else if (window.location.pathname === '/') {
      // Si estamos en la home, actualizamos la URL para que sea persistente
      const params = new URLSearchParams(window.location.search);
      if (val) {
        params.set('search', val);
      } else {
        params.delete('search');
      }
      const newUrl = params.toString() ? `?${params.toString()}` : '/';
      window.history.replaceState({}, '', newUrl);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchTerm) {
      navigate(`/?search=${encodeURIComponent(localSearchTerm)}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="w-full font-sans selection:bg-blue-800 selection:text-white">
      {/* Top Header - Blue Theme */}
      <header className="bg-[hsl(214,100%,38%)] text-white w-full border-b border-[hsl(214,80%,28%)] overflow-visible relative z-[60]">
        <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between overflow-visible">
          {/* Logo */}
          <div
            className="flex-shrink-0 cursor-pointer flex items-center gap-3 overflow-visible"
            onClick={() => navigate('/')}
            role="banner"
            aria-label="Ir a inicio de VISFUM"
          >
            <div className="h-10 md:h-12 flex items-center overflow-visible">
              <img
                src="/logo%20vifum.png"
                alt="VISFUM"
                width="140"
                height="70"
                className="h-[50px] md:h-[70px] w-auto object-contain"
              />
            </div>
          </div>

          {/* Search Bar - Minimal & White */}
          <form
            className="hidden md:flex flex-1 max-w-2xl mx-12 relative group"
            onSubmit={handleSearchSubmit}
            role="search"
          >
            <input
              id="search-input"
              type="text"
              placeholder="¿Qué estás buscando?"
              value={localSearchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full py-2.5 px-5 pr-12 text-sm text-gray-800 bg-white border-2 border-transparent rounded-lg focus:outline-none focus:border-white/50 transition-all placeholder:text-gray-500"
              aria-label="Buscador de productos"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-blue-600 transition-colors p-2"
              aria-label="Ejecutar búsqueda"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Icons - Clean & Minimal */}
          <div className="flex items-center space-x-6">
            {/* Help */}
            <div className="relative group/help hidden sm:block">
              <button
                className="flex flex-col items-center gap-1 group transition-opacity hover:opacity-80 p-1"
                onMouseEnter={() => setShowHelpMenu(true)}
                onMouseLeave={() => setShowHelpMenu(false)}
                aria-label="Menú de Ayuda y Contacto"
              >
                <HelpCircle className="w-6 h-6 stroke-[1.5px]" />
                <span className="text-[10px] uppercase font-bold tracking-wider">Ayuda</span>
              </button>

              {showHelpMenu && (
                <div
                  className="absolute top-full right-0 mt-4 w-56 bg-white text-gray-900 shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-100 z-[70] overflow-hidden rounded-lg"
                  onMouseEnter={() => setShowHelpMenu(true)}
                  onMouseLeave={() => setShowHelpMenu(false)}
                >
                  <a
                    href="https://wa.me/541126711308"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <span className="text-green-500 text-xl">📱</span>
                    <div className="text-left">
                      <div className="text-sm font-bold text-gray-900">WhatsApp</div>
                      <div className="text-[11px] text-gray-700 font-medium">11 2671-1308</div>
                    </div>
                  </a>
                  <a
                    href="mailto:visfumarg@gmail.com"
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xl">📧</span>
                    <div className="text-left">
                      <div className="text-sm font-bold text-gray-900">Email</div>
                      <div className="text-[11px] text-gray-700 font-medium">visfumarg@gmail.com</div>
                    </div>
                  </a>
                </div>
              )}
            </div>

            {/* Account */}
            <div
              className="relative"
              onMouseEnter={() => {
                if (accountMenuTimer.current) clearTimeout(accountMenuTimer.current);
                setShowAccountMenu(true);
              }}
              onMouseLeave={() => {
                if (accountMenuTimer.current) clearTimeout(accountMenuTimer.current);
                accountMenuTimer.current = setTimeout(() => setShowAccountMenu(false), 150);
              }}
            >
              <button
                className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity"
                onClick={() => setShowAccountMenu(prev => !prev)}
                aria-label="Menú de Cuenta"
              >
                <User className="w-6 h-6 stroke-[1.5px]" />
                <span className="text-[10px] uppercase font-bold tracking-wider hidden md:block">Mi cuenta</span>
              </button>

              {showAccountMenu && (
                <div
                  className="absolute top-full right-0 mt-4 w-56 bg-white text-gray-900 shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-100 z-[70] overflow-hidden rounded-lg"
                  onMouseEnter={() => {
                    if (accountMenuTimer.current) clearTimeout(accountMenuTimer.current);
                    setShowAccountMenu(true);
                  }}
                  onMouseLeave={() => {
                    if (accountMenuTimer.current) clearTimeout(accountMenuTimer.current);
                    accountMenuTimer.current = setTimeout(() => setShowAccountMenu(false), 150);
                  }}
                >
                  {user ? (
                    <div className="flex flex-col">
                      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
                        <p className="text-[10px] font-black text-gray-600 uppercase mb-1 tracking-wider">Bienvenido</p>
                        <p className="text-sm font-black truncate text-gray-900">{user.name || user.email}</p>
                      </div>
                      <button onClick={() => { navigate('/perfil'); setShowAccountMenu(false); }} className="w-full text-left px-5 py-3 text-sm hover:bg-gray-50 transition-colors font-medium">Mi perfil</button>
                      {(user.isAdmin || user.subCuenta === "si") && (
                        <button onClick={() => { navigate('/admin'); setShowAccountMenu(false); }} className="w-full text-left px-5 py-3 text-sm hover:bg-gray-50 transition-colors border-t border-gray-100 text-blue-600 font-bold uppercase tracking-wider text-[11px]">Panel Admin</button>
                      )}
                      <button onClick={async () => { await logout(); setShowAccountMenu(false); }} className="w-full text-left px-5 py-3 text-sm hover:bg-gray-100 transition-colors border-t border-gray-100 text-red-500">Cerrar sesión</button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <button onClick={() => { navigate('/login'); setShowAccountMenu(false); }} className="w-full text-left px-5 py-3 text-sm hover:bg-gray-50 transition-colors font-bold uppercase tracking-wider text-[11px]">Entrar</button>
                      <button onClick={() => { navigate('/register'); setShowAccountMenu(false); }} className="w-full text-left px-5 py-3 text-sm hover:bg-gray-50 transition-colors border-t border-gray-100 text-gray-500">Registrarme</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity relative"
              onClick={() => navigate('/cart')}
              aria-label={`Ver carrito de compras, ${itemCount} productos`}
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6 stroke-[1.5px]" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider hidden md:block">Mi carrito</span>
            </button>

            {/* Mobile Toggle */}
            <button
              className="md:hidden text-white p-3 -mr-2 min-w-[48px] min-h-[48px] flex items-center justify-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Cerrar menú principal" : "Abrir menú principal"}
            >
              {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Bar - Blue & Clean */}
      <nav
        className={`relative ${isMenuOpen ? 'block' : 'hidden'} md:block bg-[hsl(214,100%,38%)] border-t border-white/20 border-b border-[hsl(214,80%,28%)] z-50`}
        onMouseLeave={() => {
          categoryDropdownTimer.current = setTimeout(() => setOpenCategoryDropdown(null), 100);
        }}
      >
        <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8">
          <ul className="flex flex-col items-center md:flex-row md:items-center md:justify-center md:space-x-8 text-white md:py-3.5">
            {mainCategoriesForNav.map((category) => {
              const isActive = selectedCategory === category;
              const subs = getSubsForMain(category);
              const hasDropdown = subs.length > 0;
              const isDropdownOpen = openCategoryDropdown === category;

              return (
                <li
                  key={category}
                  className="relative group/nav"
                  onMouseEnter={() => {
                    if (categoryDropdownTimer.current) clearTimeout(categoryDropdownTimer.current);
                    if (hasDropdown) setOpenCategoryDropdown(category);
                  }}
                  onMouseLeave={() => {
                    categoryDropdownTimer.current = setTimeout(() => setOpenCategoryDropdown(null), 150);
                  }}
                >
                  <button
                    type="button"
                    className={`flex items-center justify-center gap-1 w-full md:w-auto text-center py-4 md:py-0 text-[13px] font-medium tracking-wide transition-all ${isActive
                      ? "text-white font-bold opacity-100"
                      : "text-white/80 hover:text-white"
                      }`}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        setOpenCategoryDropdown(isDropdownOpen ? null : category);
                      } else {
                        goToCategory(category);
                      }
                    }}
                  >
                    {category}
                    {hasDropdown && <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />}
                  </button>
                </li>
              );
            })}
            {/* Ayuda rápida */}
            <li className="relative">
              <button
                type="button"
                className="flex items-center justify-center gap-1 w-full md:w-auto text-center py-4 md:py-0 text-[13px] font-medium text-white/80 hover:text-white transition-colors"
                onClick={() => {
                  navigate('/preguntas-frecuentes');
                  setIsMenuOpen(false);
                }}
              >
                Ayuda rápida
              </button>
            </li>
          </ul>
        </div>

        {/* Dropdown Categorías (Mega-Menu) - Blue Minimal Style */}
        {openCategoryDropdown && (() => {
          const subs = getSubsForMain(openCategoryDropdown);
          if (subs.length === 0) return null;

          return (
            <div
              className="absolute left-0 right-0 top-full w-full bg-[hsl(214,100%,38%)] text-white shadow-[0_20px_60px_rgba(0,0,0,0.3)] z-50 border-t border-white/10 border-b border-[hsl(214,80%,28%)]"
              onMouseEnter={() => {
                if (categoryDropdownTimer.current) clearTimeout(categoryDropdownTimer.current);
                setOpenCategoryDropdown(openCategoryDropdown);
              }}
            >
              <div className="w-full max-w-6xl mx-auto flex flex-col items-center px-8 py-10">
                <div className="w-full flex flex-wrap justify-center gap-x-20 gap-y-10">
                  {subs.map((sub) => {
                    const thirds = getThirdsForSub(sub.id ?? '');
                    const hasThirds = thirds.length > 0;
                    return (
                      <div key={sub.id ?? sub.name} className="flex flex-col items-center md:items-start min-w-[140px]">
                        <h3 className="text-white text-base font-black uppercase tracking-[0.15em] mb-4 border-b-2 border-white/20 pb-1 w-fit">
                          {sub.name}
                        </h3>
                        {hasThirds ? (
                          <ul className="space-y-2.5">
                            {thirds.map((item) => (
                              <li key={item.id ?? item.name}>
                                <button
                                  type="button"
                                  className="text-center md:text-left text-white/70 text-[13px] font-medium hover:text-white transition-colors w-full"
                                  onClick={() => goToCategory(item.name)}
                                >
                                  {item.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <button
                            type="button"
                            className="text-center md:text-left text-white/70 text-[13px] font-medium hover:text-white transition-colors"
                            onClick={() => goToCategory(sub.name)}
                          >
                            Ver todo {sub.name}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-12 pt-6 border-t border-white/10 w-full flex justify-center">
                  <button
                    type="button"
                    className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white transition-all underline underline-offset-8"
                    onClick={() => goToCategory(openCategoryDropdown)}
                  >
                    Explorar todo {openCategoryDropdown}
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </nav>

      {/* Mobile Search */}
      {isMenuOpen && (
        <div className="md:hidden bg-white p-4 border-b border-gray-200">
          <form className="relative" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="¿Qué estás buscando?"
              value={localSearchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full py-2 px-4 pr-10 text-sm text-gray-800 bg-gray-50 border border-gray-300 focus:outline-none focus:border-black"
            />
            <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
