import React, { useEffect, useState } from 'react';
import { auth, db } from '@/firebase';
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
import { collection, getDocs, getDoc } from "firebase/firestore";
// (ya importado arriba)
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { RevisionList } from "@/components/admin/RevisionList";
import { ProductAnalyticsView } from '@/components/admin/ProductAnalytics';
import InfoManager from '@/components/admin/InfoManager';
import Sidebar from '@/components/admin/Sidebar';
import AdminLayout from '@/components/admin/AdminLayout';

export const AdminPanel: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubAdmin, setIsSubAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [subName, setSubName] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subPassword, setSubPassword] = useState('');
  const [subLoading, setSubLoading] = useState(false);
  const [subAccounts, setSubAccounts] = useState<any[]>([]);
  const [subAccountsLoading, setSubAccountsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCreateSubForm, setShowCreateSubForm] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  console.log('AdminPanel rendered, user:', user);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const userData = userDoc.data();
        if (firebaseUser.email === "admin@gmail.com") {
          setIsAdmin(true);
          setIsSubAdmin(false);
        } else if (userData?.subCuenta === "si") {
          setIsAdmin(false);
          setIsSubAdmin(true);
        } else {
          setIsAdmin(false);
          setIsSubAdmin(false);
        }
      } else {
        setIsAdmin(false);
        setIsSubAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      const querySnapshot = await getDocs(collection(db, "pedidos"));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Pedidos desde Firestore:", docs);
      setOrders(docs);
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(docs);
    };
    fetchProducts();
  }, []);

  const handleCreateSubAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, subEmail, subPassword);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: subName,
        email: subEmail,
        subCuenta: "si"
      });
      toast({
        title: "Subcuenta creada",
        description: "El sub-administrador fue creado exitosamente.",
      });
      setSubName('');
      setSubEmail('');
      setSubPassword('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la subcuenta",
        variant: "destructive"
      });
    } finally {
      setSubLoading(false);
    }
  };

  const fetchSubAccounts = async () => {
    setSubAccountsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const subs = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as { id: string; subCuenta?: string; name?: string; email?: string }))
        .filter(u => u.subCuenta === "si");
      setSubAccounts(subs);
    } catch (e) {
      toast({ title: "Error", description: "No se pudieron cargar las subcuentas", variant: "destructive" });
    }
    setSubAccountsLoading(false);
  };

  const handleDeleteSubAccount = async (uid: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta subcuenta? Esta acción no se puede deshacer.")) return;
    setDeletingId(uid);
    try {
      await setDoc(doc(db, "users", uid), {}, { merge: false });
      setSubAccounts(subAccounts.filter(u => u.id !== uid));
      toast({ title: "Subcuenta eliminada", description: "La subcuenta fue eliminada correctamente." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "No se pudo eliminar", variant: "destructive" });
    }
    setDeletingId(null);
  };

  const handleDarLiberta = async (uid: string) => {
    try {
      await setDoc(doc(db, "users", uid), { liberta: "si" }, { merge: true });
      toast({
        title: "Liberta otorgada",
        description: "La subcuenta ahora tiene liberta.",
      });
      setSubAccounts(subAccounts.map(u =>
        u.id === uid ? { ...u, liberta: "si" } : u
      ));
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "No se pudo dar liberta",
        variant: "destructive"
      });
    }
  };

  const handleToggleLiberta = async (uid: string, current: string) => {
    const newValue = current === "si" ? "no" : "si";
    try {
      await setDoc(doc(db, "users", uid), { liberta: newValue }, { merge: true });
      toast({
        title: newValue === "si" ? "Liberta otorgada" : "Liberta retirada",
        description: newValue === "si"
          ? "La subcuenta ahora tiene liberta."
          : "La subcuenta ya no tiene liberta.",
      });
      setSubAccounts(subAccounts.map(u =>
        u.id === uid ? { ...u, liberta: newValue } : u
      ));
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message || "No se pudo actualizar liberta",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (activeTab === "subaccounts" && isAdmin) fetchSubAccounts();
  }, [activeTab, isAdmin]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!isAdmin && !isSubAdmin) {
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

  const ofertas = products.filter((p: any) => p.category?.toLowerCase() === "ofertas");

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Advanced Header - Mobile Responsive */}
      <div className="bg-white border-b shadow-lg">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Settings className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Panel de Administración
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground mt-1 hidden sm:block">
                  Gestiona tu tienda del conjunto de manera profesional
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="relative group">
                <button className="p-2 rounded-full hover:bg-gray-100 relative">
                  <Bell className="h-5 w-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="hidden group-hover:block absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border p-2 animate-in fade-in-10 zoom-in-95">
                  <div className="p-2 border-b">
                    <h3 className="text-sm font-bold">Notificaciones</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-3 hover:bg-gray-50 border-b">
                      <p className="text-sm font-medium">Nuevo pedido recibido</p>
                      <p className="text-xs text-gray-500 mt-1">Hace 5 minutos</p>
                    </div>
                    <div className="p-3 hover:bg-gray-50">
                      <p className="text-sm font-medium">Inventario bajo: Producto X</p>
                      <p className="text-xs text-gray-500 mt-1">Hace 2 horas</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium">
                {isAdmin ? "👑 " : "🔑 "}
                <span className="hidden sm:inline">{isAdmin ? "Admin: " : "Subadmin: "}</span>
                {user?.name}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main content with sidebar */}
      <div className="flex relative">
        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isAdmin={isAdmin} 
          isSubAdmin={isSubAdmin} 
          navigateToHome={() => navigate('/')}
        />
        
        {/* Main content area */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            {/* Hidden tabs list for state management - visually hidden */}
            <TabsList className="hidden">
              {!isSubAdmin && <TabsTrigger value="dashboard">Dashboard</TabsTrigger>}
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              {!isSubAdmin && (
                <>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                  <TabsTrigger value="subaccounts">Subaccounts</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="info">Info</TabsTrigger>
                </>
              )}
            </TabsList>

            {/* Tab Contents */}
            {!isSubAdmin && (
              <TabsContent value="dashboard" className="space-y-6">
                {/* Header responsive */}
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold mb-4 sm:mb-0">Dashboard</h2>
                  <div className="flex space-x-2 w-full sm:w-auto">
                    <select className="bg-white rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                      <option>Últimos 7 días</option>
                      <option>Últimos 30 días</option>
                      <option>Este año</option>
                    </select>
                    <Button className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                      Actualizar
                    </Button>
                  </div>
                </div>
                
                {/* Stats Cards - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                  <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0 shadow-xl transform transition-all hover:scale-105">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-100 text-xs sm:text-sm">Estado del Sistema</p>
                          <p className="text-xl md:text-2xl font-bold">🟢 Activo</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-blue-200" />
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-blue-500/30">
                        <p className="text-xs text-blue-100">Última actualización: hace 5 min</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0 shadow-xl transform transition-all hover:scale-105">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-100 text-xs sm:text-sm">Ventas de Hoy</p>
                          <p className="text-xl md:text-2xl font-bold">$45,230</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                          <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-green-200" />
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-green-500/30 flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-200 mr-1" />
                        <p className="text-xs text-green-100">+12% vs ayer</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0 shadow-xl transform transition-all hover:scale-105 sm:col-span-2 md:col-span-1">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-100 text-xs sm:text-sm">Pedidos Pendientes</p>
                          <p className="text-xl md:text-2xl font-bold">
                            {
                              orders.filter(order =>
                                ["pending", "en espera", "espera"].includes(
                                  String(order.status).toLowerCase().trim()
                                )
                              ).length
                            }
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <AlertCircle className="h-6 w-6 md:h-8 md:w-8 text-purple-200" />
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-purple-500/30">
                        <p className="text-xs text-purple-100">Requieren atención inmediata</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <DashboardStats />
              </TabsContent>
            )}

            <TabsContent value="products" className="space-y-6">
              <ProductForm />
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-bold flex items-center">
                    <ShoppingCart className="h-5 w-5 text-orange-500 mr-2" />
                    Gestión de Pedidos
                  </h2>
                  
                  {/* Filtros y búsqueda optimizados para móvil */}
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                      <input 
                        type="text" 
                        placeholder="Buscar pedido..." 
                        className="w-full sm:w-auto px-4 py-2 pr-8 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                      <svg className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <select className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                      <option value="">Estado: Todos</option>
                      <option value="pendiente">Pendientes</option>
                      <option value="completado">Completados</option>
                      <option value="cancelado">Cancelados</option>
                    </select>
                  </div>
                </div>
                
                <div className="overflow-hidden">
                  <OrdersList />
                </div>
              </div>
              
              {/* Botón flotante para acciones rápidas en móvil */}
              <button
                className="fixed z-30 md:hidden bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center shadow-lg text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </TabsContent>

            {/* Solo para admin principal */}
            {!isSubAdmin && (
              <>
                <TabsContent value="users" className="space-y-6">
                  <UsersList />
                </TabsContent>
                
                <TabsContent value="categories" className="space-y-6">
                  <CategoryManager />
                </TabsContent>
                
                <TabsContent value="subaccounts" className="space-y-6">
                  <div className="bg-gradient-to-b from-sky-50 via-white to-sky-50 rounded-xl shadow-xl p-6 border border-sky-100">
                    {/* Header with animated badge - Mobile Optimized */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 md:mb-8 gap-4">
                      <div className="flex items-center w-full">
                        <div className="relative mr-3">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse-slow">
                            <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-bold text-blue-600 shadow-md border border-blue-100">
                            {subAccounts.length}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-sky-700 to-blue-700 bg-clip-text text-transparent">
                            Centro de Colaboradores
                          </h3>
                          <p className="text-sky-600 text-xs sm:text-sm">
                            Administra subcuentas con accesos privilegiados
                          </p>
                        </div>
                      </div>
                      
                      {/* Search & Add - Mobile optimized */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        <div className="relative group flex-1 lg:flex-none order-2 sm:order-1">
                          <input 
                            type="text" 
                            placeholder="Buscar colaborador..." 
                            className="w-full lg:w-64 px-4 py-2.5 pr-9 border border-sky-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-white"
                          />
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sky-400">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                          </svg>
                        </div>
                        <Button
                          onClick={() => setShowCreateSubForm(v => !v)}
                          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold w-full sm:w-auto px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 order-1 sm:order-2 shrink-0"
                        >
                          {showCreateSubForm ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6 6 18"></path>
                                <path d="m6 6 12 12"></path>
                              </svg>
                              <span className="font-medium">Cerrar</span>
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M19 8v6"></path>
                                <path d="M22 11h-6"></path>
                              </svg>
                              <span className="font-medium">Nuevo Colaborador</span>
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Animated Stats Cards - Mobile Optimized */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
                      {/* Scrollable container for mobile only */}
                      <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-3 sm:p-4 border border-sky-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                        <div>
                          <p className="text-[10px] sm:text-xs font-medium text-blue-500 mb-0.5 sm:mb-1">TOTAL COLABORADORES</p>
                          <p className="text-xl sm:text-2xl font-bold text-blue-700">{subAccounts.length}</p>
                          <p className="text-[10px] sm:text-xs text-blue-400 mt-0.5 sm:mt-1 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M12 5v14"></path>
                              <path d="m19 12-7-7-7 7"></path>
                            </svg>
                            Activos en el sistema
                          </p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 border border-green-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                        <div>
                          <p className="text-[10px] sm:text-xs font-medium text-green-500 mb-0.5 sm:mb-1">CON LIBERTA</p>
                          <p className="text-xl sm:text-2xl font-bold text-green-700">{subAccounts.filter(a => a.liberta === "si").length}</p>
                          <p className="text-[10px] sm:text-xs text-green-400 mt-0.5 sm:mt-1 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="m9 11-6 6v3h9l3-3"></path>
                              <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"></path>
                            </svg>
                            Permisos completos
                          </p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                            <path d="m9 12 2 2 4-4"></path>
                          </svg>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-3 sm:p-4 border border-amber-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 col-span-1 sm:col-span-2 md:col-span-1">
                        <div>
                          <p className="text-[10px] sm:text-xs font-medium text-amber-500 mb-0.5 sm:mb-1">SIN LIBERTA</p>
                          <p className="text-xl sm:text-2xl font-bold text-amber-700">{subAccounts.filter(a => a.liberta !== "si").length}</p>
                          <p className="text-[10px] sm:text-xs text-amber-400 mt-0.5 sm:mt-1 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                              <path d="M8 12h8"></path>
                            </svg>
                            Requieren aprobación
                          </p>
                        </div>
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Modal form for creating subcuenta - Mobile optimized */}
                    {showCreateSubForm && (
                      <div className="mb-6 md:mb-8 animate-in fade-in zoom-in-95 duration-300">
                        <div className="bg-gradient-to-r from-sky-100 to-blue-100 p-4 sm:p-6 rounded-xl border border-sky-200 shadow-inner relative">
                          {/* Design elements - optimized for mobile */}
                          <div className="absolute top-0 right-0 w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-200 to-sky-200 rounded-full blur-2xl opacity-50 -z-10 transform translate-x-8 -translate-y-8"></div>
                          <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-sky-200 to-blue-200 rounded-full blur-xl opacity-50 -z-10 transform -translate-x-5 translate-y-5"></div>
                          
                          <h4 className="text-lg sm:text-xl font-bold text-sky-800 mb-3 sm:mb-4 flex items-center gap-2">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-sky-500 rounded-lg flex items-center justify-center shadow-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                              </svg>
                            </div>
                            Crear Nuevo Colaborador
                          </h4>
                          
                          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 sm:p-5 shadow-sm border border-sky-100">
                            {/* Mobile-first form layout */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4">
                              <div>
                                <label className="text-xs font-medium text-sky-700 block mb-1">Nombre del Colaborador</label>
                                <div className="relative">
                                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-sky-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-3.5 sm:h-3.5">
                                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                      <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                  </span>
                                  <Input
                                    placeholder="Nombre completo"
                                    value={subName}
                                    onChange={e => setSubName(e.target.value)}
                                    required
                                    className="pl-8 h-9 sm:h-10 text-xs sm:text-sm bg-white border-sky-200 focus:border-sky-400 focus:ring-sky-300"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-xs font-medium text-sky-700 block mb-1">Correo Electrónico</label>
                                <div className="relative">
                                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-sky-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-3.5 sm:h-3.5">
                                      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                    </svg>
                                  </span>
                                  <Input
                                    placeholder="nombre@empresa.com"
                                    type="email"
                                    value={subEmail}
                                    onChange={e => setSubEmail(e.target.value)}
                                    required
                                    className="pl-8 h-9 sm:h-10 text-xs sm:text-sm bg-white border-sky-200 focus:border-sky-400 focus:ring-sky-300"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-xs font-medium text-sky-700 block mb-1">Contraseña Segura</label>
                                <div className="relative">
                                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-sky-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-3.5 sm:h-3.5">
                                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                  </span>
                                  <Input
                                    placeholder="Contraseña"
                                    type="password"
                                    value={subPassword}
                                    onChange={e => setSubPassword(e.target.value)}
                                    required
                                    className="pl-8 h-9 sm:h-10 text-xs sm:text-sm bg-white border-sky-200 focus:border-sky-400 focus:ring-sky-300"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 mt-3 sm:gap-4 sm:mt-6">
                              <div className="flex-1 text-xs text-sky-700 bg-sky-50 p-2.5 rounded-lg border border-sky-100">
                                <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500 shrink-0">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                                    <path d="m9 12 2 2 4-4"></path>
                                  </svg>
                                  <span className="font-medium">Información de Seguridad</span>
                                </div>
                                <p className="text-[10px] text-sky-600">
                                  Los colaboradores tendrán acceso a funciones administrativas limitadas. Comparte estas credenciales únicamente con personas de confianza.
                                </p>
                              </div>

                              <div className="flex justify-center sm:mt-1">
                                <Button
                                  type="submit"
                                  onClick={handleCreateSubAccount}
                                  disabled={subLoading || !subName || !subEmail || !subPassword}
                                  className="bg-gradient-to-r from-sky-600 to-blue-700 text-white font-medium w-full sm:w-auto py-2 sm:py-2.5 px-3 sm:px-6 rounded-lg shadow hover:shadow-lg transform hover:translate-y-[-2px] transition-all duration-300 sm:min-w-[200px]"
                                >
                                  {subLoading ? (
                                    <span className="flex items-center justify-center gap-1.5">
                                      <svg className="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                      </svg>
                                      <span className="text-xs sm:text-sm">Creando...</span>
                                    </span>
                                  ) : (
                                    <span className="flex items-center justify-center gap-1.5">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                      </svg>
                                      <span className="text-xs sm:text-sm">Crear Colaborador</span>
                                    </span>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Modern cards layout for subcuentas */}
                    {subAccountsLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 bg-white/50 backdrop-blur-sm rounded-xl border border-sky-100">
                        <div className="w-16 h-16 border-t-4 border-b-4 border-sky-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-lg font-medium text-sky-700">Cargando colaboradores...</p>
                      </div>
                    ) : subAccounts.length === 0 ? (
                      <div className="bg-white rounded-xl border border-sky-100 p-10 text-center">
                        <div className="w-24 h-24 bg-sky-50 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-sky-400">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-sky-700 mb-2">No hay colaboradores registrados</h3>
                        <p className="text-sky-500 mb-6">Agrega colaboradores para asignarles permisos en el sistema</p>
                        <Button
                          onClick={() => setShowCreateSubForm(true)}
                          className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                          Agregar colaborador
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                        {/* Responsive grid with horizontal scroll on mobile */}
                        {subAccounts.map(sub => (
                          <div key={sub.id} className="bg-white rounded-xl border border-sky-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="p-3 sm:p-5 border-b border-sky-100 relative">
                              {/* Status indicator - optimized for very small screens */}
                              <div className={`absolute -right-1 -top-1 ${sub.liberta === "si" ? "bg-green-500" : "bg-amber-500"} text-white text-[9px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-bl-xl rounded-tr-xl font-medium shadow-md flex items-center gap-0.5 sm:gap-1`}>
                                {sub.liberta === "si" ? (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-10 sm:h-10">
                                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                                      <path d="m9 12 2 2 4-4"></path>
                                    </svg>
                                    <span className="whitespace-nowrap">Con Liberta</span>
                                  </>
                                ) : (
                                  <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-10 sm:h-10">
                                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    <span className="whitespace-nowrap">Sin Liberta</span>
                                  </>
                                )}
                              </div>
                              
                              {/* User info - optimized for very small screens */}
                              <div className="flex items-center mb-2 sm:mb-4">
                                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center mr-2.5 sm:mr-4 border-2 border-white shadow">
                                  <span className="text-sm sm:text-xl font-bold text-sky-600">{sub.name?.charAt(0) || 'U'}</span>
                                </div>
                                <div className="overflow-hidden max-w-[calc(100%-3rem)] sm:max-w-[calc(100%-4.5rem)]">
                                  <h5 className="font-bold text-sm sm:text-lg text-gray-800 truncate">{sub.name}</h5>
                                  <div className="flex items-center text-[10px] sm:text-sm text-sky-500 truncate">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 shrink-0 sm:w-3 sm:h-3">
                                      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                                    </svg>
                                    <span className="truncate">{sub.email}</span>
                                  </div>
                                </div>
                              </div>

                              {/* ID and role info - more compact */}
                              <div className="bg-sky-50 p-2 sm:p-3 rounded-lg border border-sky-100">
                                <div className="grid grid-cols-2 gap-1 sm:gap-2 text-[10px] sm:text-xs">
                                  <div>
                                    <span className="text-sky-500 block">ID del Colaborador</span>
                                    <span className="font-mono text-gray-700 truncate block">{sub.id.substring(0, 8)}...</span>
                                  </div>
                                  <div>
                                    <span className="text-sky-500 block">Rol</span>
                                    <span className="text-gray-700">Sub-Admin</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Bottom action bar - optimized for very small screens */}
                            <div className="p-2 sm:p-4 bg-gradient-to-r from-sky-50 to-blue-50 flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2 sm:justify-between">
                              <Button
                                onClick={() => handleToggleLiberta(sub.id, sub.liberta)}
                                className={`text-[9px] sm:text-xs font-medium px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg flex-1 sm:flex-auto ${sub.liberta === "si"
                                  ? "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-md"
                                  : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-md"}`}
                              >
                                {sub.liberta === "si" ? (
                                  <span className="flex items-center justify-center gap-0.5 sm:gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 sm:w-3 sm:h-3">
                                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
                                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                    <span className="truncate">Quitar Liberta</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center justify-center gap-0.5 sm:gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 sm:w-3 sm:h-3">
                                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                                    </svg>
                                    <span className="truncate">Dar Liberta</span>
                                  </span>
                                )}
                              </Button>
                              
                              <div className="flex gap-1.5 sm:gap-2">
                                <Button
                                  className="bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 rounded-md sm:rounded-lg p-1 sm:p-2 h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-3.5 sm:h-3.5">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"></path>
                                  </svg>
                                </Button>
                                
                                <Button
                                  onClick={() => handleDeleteSubAccount(sub.id)}
                                  disabled={deletingId === sub.id}
                                  className="bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-md sm:rounded-lg p-1 sm:p-2 h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center"
                                >
                                  {deletingId === sub.id ? (
                                    <div className="h-2.5 w-2.5 sm:h-4 sm:w-4 border-2 border-t-2 border-red-600 rounded-full animate-spin" />
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-3.5 sm:h-3.5">
                                      <path d="M3 6h18"></path>
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                      <line x1="10" x2="10" y1="11" y2="17"></line>
                                      <line x1="14" x2="14" y1="11" y2="17"></line>
                                    </svg>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Activity Timeline - Mobile optimized */}
                    {subAccounts.length > 0 && (
                      <div className="mt-6 sm:mt-10">
                        <h3 className="text-base sm:text-lg font-bold text-sky-800 mb-3 sm:mb-4 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600">
                            <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"></path>
                            <path d="M12 6v6l4 2"></path>
                          </svg>
                          Actividad Reciente
                        </h3>
                        <div className="bg-white rounded-xl border border-sky-100 p-3 sm:p-4 shadow-sm">
                          <div className="space-y-3 sm:space-y-4">
                            <div className="flex gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                  <circle cx="9" cy="7" r="4"></circle>
                                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm sm:text-base text-gray-700">
                                  <span className="font-medium text-blue-700">Sistema</span> ha actualizado la lista de colaboradores
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">Hace unos momentos</p>
                              </div>
                            </div>
                            
                            <div className="flex gap-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
                                  <path d="m9 12 2 2 4-4"></path>
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm sm:text-base text-gray-700">
                                  <span className="font-medium text-green-700">{subAccounts.find(a => a.liberta === "si")?.name || "Un colaborador"}</span> ha recibido permisos de liberta
                                </p>
                                <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">Hoy</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 sm:mt-4 text-center">
                            <button className="text-xs sm:text-sm text-sky-600 hover:text-sky-800 font-medium">
                              Ver historial completo
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Revision List */}
                  <div className="relative mt-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-blue-500/10 rounded-2xl transform -rotate-1 blur-sm"></div>
                    <RevisionList />
                  </div>
                </TabsContent>
                
                <TabsContent value="analytics" className="space-y-6">
                  <ProductAnalyticsView />
                </TabsContent>
                
                <TabsContent value="info" className="space-y-6">
                  <InfoManager />
                </TabsContent>
              </>
            )}
          </Tabs>
          
          {/* Ofertas Especiales - Si hay */}
          {ofertas.length > 0 && (
            <div className="mt-16 px-2 sm:px-0">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-lg">🔥</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-orange-600">
                    Ofertas Especiales
                  </h2>
                </div>
                <Button 
                  className="text-sm bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
                  variant="outline"
                >
                  Ver todas
                </Button>
              </div>
              
              {/* Scrollable horizontal en móvil, grid en escritorio */}
              <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex sm:grid overflow-x-auto pb-6 sm:pb-0 sm:overflow-x-visible sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 snap-x">
                  {ofertas.map((oferta) => (
                    <div 
                      key={oferta.id} 
                      className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col min-w-[280px] sm:min-w-0 border border-orange-100 snap-start hover:shadow-xl transition-shadow duration-300 relative overflow-hidden"
                    >
                      {/* Badge de oferta */}
                      <div className="absolute -right-10 top-5 bg-gradient-to-r from-orange-500 to-red-500 text-white px-12 py-1 transform rotate-45 text-xs font-medium">
                        Oferta
                      </div>
                      
                      <div className="flex items-center mb-4">
                        <img src={oferta.image} alt={oferta.name} className="w-16 h-16 object-cover rounded-lg mr-4" />
                        <div>
                          <h3 className="text-base font-bold text-orange-700">{oferta.name}</h3>
                          <div className="flex items-center mt-1">
                            <span className="text-orange-600 font-medium mr-2">${oferta.price?.toLocaleString()}</span>
                            <span className="text-xs text-gray-400 line-through">${Math.round(oferta.price * 1.2).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{oferta.description}</p>
                      
                      <div className="flex items-center mt-auto">
                        <Button size="sm" variant="outline" className="text-xs border-orange-200 text-orange-700 hover:bg-orange-50 flex-1">
                          Editar
                        </Button>
                        <Button size="sm" className="text-xs bg-gradient-to-r from-orange-500 to-red-500 ml-2 flex-1">
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Indicador de scroll en móvil */}
                <div className="mt-4 flex justify-center gap-1 sm:hidden">
                  {[...Array(Math.min(ofertas.length, 4))].map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full bg-orange-200" />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
