import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, ShoppingCart, TrendingUp, TrendingDown, DollarSign, Clock, RefreshCw, Calendar, Filter, ChevronDown, ArrowUpRight, Activity } from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase";
import { cn } from "@/lib/utils";

export const DashboardStats: React.FC = () => {
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [monthSales, setMonthSales] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [trendPercentages, setTrendPercentages] = useState({
    users: 12.5,
    products: -2.4,
    orders: 8.2,
    sales: 15.3
  });
  
  const loadData = () => {
    setIsLoading(true);
    
    // Usuarios
    getDocs(collection(db, "users")).then(snapshot => setUserCount(snapshot.size));
    // Productos
    getDocs(collection(db, "products")).then(snapshot => setProductCount(snapshot.size));
    // Pedidos y ventas del mes
    getDocs(collection(db, "pedidos")).then(snapshot => {
      setOrderCount(snapshot.size);

      // Ventas del mes y actividad reciente
      const now = new Date();
      const thisMonth = now.getMonth();
      let sales = 0;
      const activity: any[] = [];
      snapshot.docs.forEach(docSnap => {
        const data = docSnap.data();
        // Ventas del mes (solo pedidos confirmados)
        if (data.status === "confirmed" && data.createdAt?.toDate) {
          const date = data.createdAt.toDate();
          if (date.getMonth() === thisMonth && date.getFullYear() === now.getFullYear()) {
            sales += Number(data.total || 0);
          }
        }
        // Actividad reciente (últimos 5 pedidos)
        activity.push({
          user: data.userName || "Cliente",
          action: data.status === "confirmed" ? "Pedido confirmado" : "Pedido en espera",
          time: data.createdAt?.toDate
            ? data.createdAt.toDate().toLocaleString("es-CO")
            : "",
          amount: data.total ? `$${Number(data.total).toLocaleString()}` : null,
        });
      });
      setMonthSales(sales);
      setRecentActivity(activity.sort((a, b) => (a.time < b.time ? 1 : -1)).slice(0, 5));
      setIsLoading(false);
    });
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  // Función para renderizar el estado de tendencia
  const renderTrend = (value: number) => {
    const isPositive = value >= 0;
    return (
      <div className={`flex items-center space-x-1 text-sm ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
        {isPositive ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
        <span className="font-medium">{isPositive ? '+' : ''}{value}%</span>
      </div>
    );
  };

  // Componente de filtro de período
  const PeriodFilter = () => (
    <div className="flex items-center space-x-2 p-1 bg-white rounded-xl shadow-sm border border-slate-100">
      {['daily', 'weekly', 'monthly', 'yearly'].map((period) => (
        <button
          key={period}
          onClick={() => setSelectedPeriod(period)}
          className={`px-4 py-2 text-sm rounded-lg transition-all ${
            selectedPeriod === period 
              ? 'bg-gradient-to-r from-sky-400 to-blue-600 text-white shadow-md' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {period.charAt(0).toUpperCase() + period.slice(1)}
        </button>
      ))}
    </div>
  );

  const stats = [
    {
      title: 'Total Usuarios',
      value: userCount,
      icon: Users,
      color: 'from-sky-400 to-blue-600',
      trend: trendPercentages.users
    },
    {
      title: 'Productos Activos',
      value: productCount,
      icon: Package,
      color: 'from-emerald-400 to-teal-600',
      trend: trendPercentages.products
    },
    {
      title: 'Pedidos Totales',
      value: orderCount,
      icon: ShoppingCart,
      color: 'from-indigo-400 to-violet-600',
      trend: trendPercentages.orders
    },
    {
      title: 'Ventas del Mes',
      value: `$${monthSales.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-amber-400 to-orange-600',
      trend: trendPercentages.sales
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500">Bienvenido al panel de control</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadData()}
            className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={cn("h-4 w-4 text-slate-500", isLoading && "animate-spin")} />
            <span className="text-sm text-slate-600">Actualizar</span>
          </button>
          
          <div className="relative">
            <button className="flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">Este mes</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Período de filtro */}
      <div className="flex justify-end">
        <PeriodFilter />
      </div>

      {/* Estadísticas Principales con diseño mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5`}></div>
            <CardContent className="p-6">
              {isLoading ? (
                <div>
                  <div className="h-5 w-1/3 bg-slate-200 rounded mb-3"></div>
                  <div className="h-8 w-1/2 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 w-1/4 bg-slate-200 rounded"></div>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex items-end space-x-2 mb-1">
                    <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    {renderTrend(stat.trend)}
                    <span className="text-xs text-slate-400">vs periodo anterior</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actividad Reciente con diseño mejorado */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100">
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <Clock className="h-5 w-5 text-sky-500" />
                Actividad Reciente
              </CardTitle>
              <p className="text-sm text-slate-500">Últimas transacciones del sistema</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-200"></div>
                        <div>
                          <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
                          <div className="h-3 w-32 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="h-3 w-20 bg-slate-200 rounded mb-2"></div>
                        <div className="h-4 w-16 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : recentActivity.length === 0 ? (
                  <div className="text-slate-500 text-center py-12 bg-sky-50 rounded-xl border border-sky-100">
                    <div className="w-16 h-16 rounded-full bg-sky-100 flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-8 w-8 text-sky-500" />
                    </div>
                    <p className="font-medium">Sin actividad reciente</p>
                    <p className="text-sm text-slate-400 mt-1">Las actividades aparecerán aquí</p>
                  </div>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-sky-50 transition-colors border border-transparent hover:border-sky-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-sky-400 to-blue-600 flex items-center justify-center shadow-md">
                          <span className="text-white text-xs font-bold">
                            {activity.user.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{activity.user}</p>
                          <p className="text-xs text-slate-500">{activity.action}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">{activity.time}</p>
                        {activity.amount && (
                          <p className="text-sm font-semibold text-emerald-600">{activity.amount}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              {recentActivity.length > 0 && !isLoading && (
                <div className="flex justify-center mt-6">
                  <button className="text-sky-600 hover:text-sky-800 text-sm font-medium flex items-center space-x-1 px-4 py-2 rounded-lg hover:bg-sky-50 transition-colors">
                    <span>Ver todas las actividades</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Widget de resumen */}
        <div className="bg-gradient-to-br from-sky-400 to-blue-600 rounded-2xl shadow-lg h-full">
          <div className="p-6 flex flex-col h-full">
            <h3 className="text-lg font-semibold text-white mb-2">Resumen de Desempeño</h3>
            <p className="text-sm text-sky-100 mb-6">Estadísticas clave del período actual</p>
            
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sky-100">Ingresos Mensuales</div>
                    <div className="text-white font-bold">${(monthSales * 1.2).toLocaleString()}</div>
                  </div>
                  <div className="h-2 bg-blue-700/40 rounded-full">
                    <div className="h-full w-3/4 bg-white rounded-full"></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sky-100">Objetivo Mensual</div>
                    <div className="text-white font-bold">${(monthSales * 1.5).toLocaleString()}</div>
                  </div>
                  <div className="h-1 bg-blue-700/40 rounded-full">
                    <div className="h-full w-1/2 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-sm text-white mb-1">Órdenes Pendientes</div>
                    <div className="text-2xl font-bold text-white">{Math.floor(orderCount * 0.3)}</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-sm text-white mb-1">Promedio Diario</div>
                    <div className="text-2xl font-bold text-white">${Math.floor(monthSales / 30).toLocaleString()}</div>
                  </div>
                </div>
                
                <button className="mt-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white py-3 px-4 rounded-xl font-medium transition-colors">
                  Ver Reporte Completo
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Acciones Rápidas */}
      <div className="bg-gradient-to-r from-slate-50 to-sky-50 rounded-2xl p-6 border border-sky-100 shadow-md">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { title: 'Nuevo Producto', icon: <Package className="h-5 w-5" />, color: 'sky' },
            { title: 'Ver Pedidos', icon: <ShoppingCart className="h-5 w-5" />, color: 'emerald' },
            { title: 'Usuarios', icon: <Users className="h-5 w-5" />, color: 'violet' },
            { title: 'Analítica', icon: <Activity className="h-5 w-5" />, color: 'amber' },
            { title: 'Configuración', icon: <Clock className="h-5 w-5" />, color: 'blue' }
          ].map((action, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-4 border border-slate-100 hover:shadow-md transition-all cursor-pointer group hover:border-sky-200"
            >
              <div className={`w-10 h-10 rounded-lg bg-${action.color}-100 flex items-center justify-center text-${action.color}-600 mb-3 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <h3 className="text-sm font-medium text-slate-800">{action.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
