import React, { useEffect, useState } from 'react';
import { auth } from '@/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
import { ProductForm } from '@/components/admin/ProductForm';
import { UsersList } from '@/components/admin/UsersList';
import { OrdersList } from '@/components/admin/OrdersList';
import { DashboardStats } from '@/components/admin/DashboardStats';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

export const AdminPanel: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState<any[]>([]);

  console.log('AdminPanel rendered, user:', user);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser && firebaseUser.email === "admin@gmail.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      const querySnapshot = await getDocs(collection(db, "pedidos"));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Pedidos desde Firestore:", docs); // <-- AGREGA ESTO
      setOrders(docs);
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <Card className="w-96 shadow-2xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-red-600">Acceso Denegado</h2>
            <p className="text-muted-foreground mb-6">
              No tienes permisos para acceder al panel de administración.
            </p>
            <Button 
              onClick={() => navigate('/')}
              className="gradient-orange hover:opacity-90 transition-all"
            >
              <Home className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Advanced Header */}
      <div className="bg-white border-b shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Panel de Administración
                </h1>
                <p className="text-muted-foreground mt-1">Gestiona tu tienda del conjunto de manera profesional</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
            
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 text-sm font-medium">
                👑 Administrador: {user.name}
              </Badge>
              <Button 
                onClick={() => navigate('/')}
                variant="outline"
                size="sm"
              >
                <Home className="h-4 w-4 mr-2" />
                Ir a la Tienda
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          {/* Enhanced Tab Navigation */}
          <div className="bg-white rounded-xl shadow-lg p-2">
            <TabsList className="grid w-full grid-cols-5 gap-2 mb-8">
              <TabsTrigger 
                value="dashboard" 
                className="flex flex-col items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
              >
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs font-medium">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger 
                value="products" 
                className="flex flex-col items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
              >
                <Package className="h-5 w-5" />
                <span className="text-xs font-medium">Productos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="flex flex-col items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
              >
                <Users className="h-5 w-5" />
                <span className="text-xs font-medium">Usuarios</span>
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="flex flex-col items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="text-xs font-medium">Pedidos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="categories" 
                className="flex flex-col items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
              >
                <Tag className="h-5 w-5" />
                <span className="text-xs font-medium">Categorías</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Contents */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Estado del Sistema</p>
                      <p className="text-2xl font-bold">🟢 Activo</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Ventas de Hoy</p>
                      <p className="text-2xl font-bold">$45,230</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Pedidos Pendientes</p>
                      <p className="text-2xl font-bold">
                        {
                          orders.filter(order =>
                            ["pending", "en espera", "espera"].includes(
                              String(order.status).toLowerCase().trim()
                            )
                          ).length
                        }
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <DashboardStats />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <ProductForm />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UsersList />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrdersList />
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <CategoryManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
