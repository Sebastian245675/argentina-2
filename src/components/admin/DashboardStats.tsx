import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, ShoppingCart, TrendingUp, DollarSign, Clock } from 'lucide-react';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase";

export const DashboardStats: React.FC = () => {
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [monthSales, setMonthSales] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
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
    });
  }, []);

  const stats = [
    {
      title: 'Total Usuarios',
      value: userCount,
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Productos Activos',
      value: productCount,
      icon: Package,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Pedidos Totales',
      value: orderCount,
      icon: ShoppingCart,
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'Ventas del Mes',
      value: `$${monthSales.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden border-0 shadow-lg">
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-5`}></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actividad Reciente */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 && (
              <div className="text-muted-foreground text-center py-6">Sin actividad reciente</div>
            )}
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {activity.user.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.user}</p>
                    <p className="text-xs text-muted-foreground">{activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                  {activity.amount && (
                    <p className="text-sm font-semibold text-green-600">{activity.amount}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
