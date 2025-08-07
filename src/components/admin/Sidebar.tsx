import React from 'react';
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
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const sidebarItems = [
    ...(isSubAdmin ? [] : [
      { id: 'dashboard', icon: <BarChart3 className="h-5 w-5" />, label: 'Dashboard' }
    ]),
    { id: 'products', icon: <Package className="h-5 w-5" />, label: 'Productos' },
    { id: 'orders', icon: <ShoppingCart className="h-5 w-5" />, label: 'Pedidos' },
    ...(isSubAdmin ? [] : [
      { id: 'users', icon: <Users className="h-5 w-5" />, label: 'Usuarios' },
      { id: 'categories', icon: <Tag className="h-5 w-5" />, label: 'Categorías' },
      { id: 'subaccounts', icon: <Users className="h-5 w-5" />, label: 'Subcuentas' },
      { id: 'analytics', icon: <BarChart3 className="h-5 w-5 text-orange-500" />, label: 'Analítica' },
      { id: 'info', icon: <Settings className="h-5 w-5 text-blue-500" />, label: 'Info Secciones' }
    ])
  ];

  return (
    <div className="h-[calc(100vh-80px)] bg-white w-64 border-r shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Panel Admin
            </h2>
            <p className="text-xs text-muted-foreground">Gestión de tienda</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {sidebarItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-all",
                  activeTab === item.id 
                    ? "bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 font-medium shadow-sm" 
                    : "hover:bg-gray-100"
                )}
              >
                <span className={activeTab === item.id ? "text-orange-600" : "text-gray-500"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t">
        <button
          onClick={navigateToHome}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Home className="h-4 w-4" />
          <span>Ir a Tienda</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
