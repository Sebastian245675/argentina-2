import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp,
  Settings,
  BarChart3,
  DollarSign,
  AlertCircle,
  Home,
  Bell,
  Tag,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  isSubAdmin: boolean;
  navigateToHome: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isAdmin, 
  isSubAdmin,
  navigateToHome
}) => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  
  // Cerrar sidebar automáticamente al cambiar de pestaña en móvil
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [activeTab, isMobile]);
  
  // Escuchar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(!isMobile);
    };
    
    // Inicializar estado
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);
  
  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const sidebarItems = [
    ...(isSubAdmin ? [] : [
      { id: 'dashboard', icon: <BarChart3 className="h-5 w-5" />, label: 'Dashboard', description: 'Vista general del sistema' }
    ]),
    { id: 'products', icon: <Package className="h-5 w-5" />, label: 'Productos', description: 'Gestión de inventario' },
    { id: 'orders', icon: <ShoppingCart className="h-5 w-5" />, label: 'Pedidos', description: 'Control de ventas' },
    ...(isSubAdmin ? [] : [
      { id: 'users', icon: <Users className="h-5 w-5" />, label: 'Usuarios', description: 'Administrar clientes' },
      { id: 'categories', icon: <Tag className="h-5 w-5" />, label: 'Categorías', description: 'Organizar productos' },
      { id: 'subaccounts', icon: <Users className="h-5 w-5" />, label: 'Subcuentas', description: 'Gestión de accesos' },
      { id: 'analytics', icon: <TrendingUp className="h-5 w-5" />, label: 'Analítica', description: 'Estadísticas avanzadas' },
      { id: 'info', icon: <Settings className="h-5 w-5" />, label: 'Info Secciones', description: 'Configuración general' }
    ])
  ];

  // Animación para iconos
  const iconAnimation = (isActive: boolean) => {
    return isActive ? "scale-110 transform transition-all duration-300" : "transform transition-all duration-300";
  };

  // Toggle button para móvil con diseño mejorado
  const MobileToggleButton = () => (
    <button 
      onClick={toggleSidebar}
      className="fixed z-50 bottom-6 right-6 w-16 h-16 rounded-2xl bg-gradient-to-r from-sky-400 to-blue-500 flex items-center justify-center shadow-lg text-white lg:hidden transform hover:scale-105 transition-all duration-300"
      aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
      style={{
        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.5), 0 8px 10px -6px rgba(59, 130, 246, 0.3)'
      }}
    >
      <div className="relative">
        {isSidebarOpen ? 
          <X className="h-7 w-7 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-95 duration-300" /> : 
          <Menu className="h-7 w-7 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-95 duration-300" />
        }
      </div>
    </button>
  );

  return (
    <>
      {/* Overlay para móvil cuando el sidebar está abierto con blur mejorado */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar con diseño mejorado */}
      <div 
        className={cn(
          "h-[calc(100vh-80px)] bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/70 shadow-xl flex flex-col z-40",
          isMobile ? "fixed left-0 top-[80px] w-[300px] transition-all duration-500 ease-in-out transform" : "w-72",
          isMobile && !isSidebarOpen ? "-translate-x-full" : "translate-x-0"
        )}
        style={{
          boxShadow: '5px 0 30px -15px rgba(59, 130, 246, 0.15)'
        }}
      >
        {/* Header con glassmorphism */}
        <div className="p-6 border-b border-sky-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-sky-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-md transform rotate-3 hover:rotate-0 transition-all duration-300">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
                Panel Admin
              </h2>
              <div className="flex items-center text-xs text-sky-700 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <p>Sesión activa</p>
              </div>
            </div>
            {isMobile && (
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-sky-100 transition-colors"
              >
                <X className="h-5 w-5 text-sky-500" />
              </button>
            )}
          </div>
        </div>
        
        {/* Navigation Menu con animaciones y colores actualizados */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="mb-4 px-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Menú Principal</h3>
          </div>
          <ul className="space-y-1.5">
            {sidebarItems.map(item => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id);
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center px-4 py-3.5 rounded-xl text-left transition-all duration-300",
                    activeTab === item.id 
                      ? "bg-gradient-to-r from-sky-100/70 to-blue-100/70 shadow-sm" 
                      : "hover:bg-sky-50"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg mr-3",
                    activeTab === item.id 
                      ? "bg-gradient-to-br from-sky-400 to-blue-600 shadow-md shadow-sky-200" 
                      : "bg-slate-100 text-slate-500"
                  )}>
                    <span className={cn(
                      "text-white",
                      activeTab === item.id ? iconAnimation(true) : iconAnimation(false)
                    )}>
                      {item.icon}
                    </span>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className={cn(
                      "font-medium",
                      activeTab === item.id ? "text-sky-700" : "text-slate-600"
                    )}>
                      {item.label}
                    </span>
                    
                    {activeTab === item.id && (
                      <span className="text-xs text-sky-500 mt-0.5">
                        Seleccionado
                      </span>
                    )}
                  </div>
                  
                  {activeTab === item.id && (
                    <div className="ml-auto flex items-center">
                      <div className="w-2 h-2 rounded-full bg-sky-500 mr-2"></div>
                      <ChevronRight className="h-4 w-4 text-sky-500" />
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
          
          <div className="my-6 px-3">
            <div className="h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent"></div>
          </div>
          
          <div className="px-3 py-4 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl mx-3">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-500 mr-3">
                <Bell className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-sky-700">Soporte Técnico</span>
            </div>
            <p className="text-xs text-slate-500 mb-3">¿Necesitas ayuda con el panel? Contáctanos para asistencia.</p>
            <button className="text-xs px-3 py-2 bg-white text-sky-600 border border-sky-200 rounded-lg w-full hover:bg-sky-50 transition-colors">
              Contactar Soporte
            </button>
          </div>
        </nav>
        
        {/* Footer con estilo renovado */}
        <div className="p-5 border-t border-sky-100">
          <button
            onClick={navigateToHome}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-sky-400 to-blue-600 text-white rounded-xl hover:shadow-lg hover:shadow-sky-200/50 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Home className="h-4 w-4" />
            <span className="font-medium">Ir a Tienda</span>
          </button>
        </div>
      </div>
      
      {/* Botón toggle para móvil */}
      {isMobile && <MobileToggleButton />}
    </>
  );
};

export default Sidebar;
