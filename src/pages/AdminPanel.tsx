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
      console.log("Pedidos desde Firestore:", docs); // <-- AGREGA ESTO
      setOrders(docs);
    };
    fetchOrders();
  }, []);

  // Agrega este useEffect para cargar productos
  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(docs);
    };
    fetchProducts();
  }, []);

  // Función para crear subcuenta
  const handleCreateSubAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubLoading(true);
    try {
      // 1. Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(auth, subEmail, subPassword);
      // 2. Crear documento en "users" con campo subCuenta: "si"
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
      await setDoc(doc(db, "users", uid), {}, { merge: false }); // Borra el doc
      // Opcional: Si tienes Cloud Functions, aquí deberías borrar también del Auth
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
      // Opcional: Actualiza el estado local si lo deseas
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
    // eslint-disable-next-line
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

  // Mueve esta línea ARRIBA del return, dentro del componente:
  const ofertas = products.filter((p: any) => p.category?.toLowerCase() === "ofertas");

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
                {isAdmin ? "👑 Administrador: " : "🔑 Subadmin: "}
                {user.name}
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
            <TabsList className={`grid w-full ${isSubAdmin ? 'grid-cols-2' : 'grid-cols-7'} gap-2 mb-8`}>
              {/* Solo para admin principal */}
              {!isSubAdmin && (
                <TabsTrigger 
                  value="dashboard" 
                  className="flex flex-col items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                >
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-xs font-medium">Dashboard</span>
                </TabsTrigger>
              )}
              <TabsTrigger 
                value="products" 
                className="flex flex-col items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
              >
                <Package className="h-5 w-5" />
                <span className="text-xs font-medium">Productos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="orders" 
                className="flex flex-col items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="text-xs font-medium">Pedidos</span>
              </TabsTrigger>
              {/* Solo para admin principal */}
              {!isSubAdmin && (
                <>
                  <TabsTrigger 
                    value="users" 
                    className="flex flex-col items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-xs font-medium">Usuarios</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="categories" 
                    className="flex flex-col items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                  >
                    <Tag className="h-5 w-5" />
                    <span className="text-xs font-medium">Categorías</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="subaccounts" 
                    className="flex flex-col items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-xs font-medium">Subcuentas</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analytics" 
                    className="flex flex-col items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                  >
                    <BarChart3 className="h-5 w-5 text-orange-500" />
                    <span className="text-xs font-medium">Analítica</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="info" 
                    className="flex flex-col items-center gap-1 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
                  >
                    <Settings className="h-5 w-5 text-blue-500" />
                    <span className="text-xs font-medium">Info Secciones</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>
          </div>

          {/* Tab Contents */}
          {/* Solo para admin principal */}
          {!isSubAdmin && (
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
          )}

          <TabsContent value="products" className="space-y-6">
            <ProductForm />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrdersList />
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
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Users className="h-5 w-5 text-orange-500" />
                      Gestión de Subcuentas
                    </h3>
                    <Button
                      onClick={() => setShowCreateSubForm(v => !v)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-4 py-2 rounded-xl shadow hover:scale-105 transition-all"
                    >
                      {showCreateSubForm ? "Cerrar" : "Nueva Subcuenta"}
                    </Button>
                  </div>
                  {showCreateSubForm && (
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        <Users className="h-5 w-5 text-orange-500" />
                        Crear Subcuenta (Sub-administrador)
                      </h4>
                      <form
                        onSubmit={handleCreateSubAccount}
                        className="flex flex-col md:flex-row gap-4 items-stretch"
                      >
                        <Input
                          placeholder="Nombre completo"
                          value={subName}
                          onChange={e => setSubName(e.target.value)}
                          required
                          className="flex-1 bg-orange-50 border-orange-200 focus:ring-orange-400"
                        />
                        <Input
                          placeholder="Correo electrónico"
                          type="email"
                          value={subEmail}
                          onChange={e => setSubEmail(e.target.value)}
                          required
                          className="flex-1 bg-orange-50 border-orange-200 focus:ring-orange-400"
                        />
                        <Input
                          placeholder="Contraseña"
                          type="password"
                          value={subPassword}
                          onChange={e => setSubPassword(e.target.value)}
                          required
                          className="flex-1 bg-orange-50 border-orange-200 focus:ring-orange-400"
                        />
                        <Button
                          type="submit"
                          disabled={subLoading}
                          className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-6 py-3 rounded-xl shadow hover:scale-105 transition-all"
                        >
                          {subLoading ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                              </svg>
                              Creando...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Users className="h-5 w-5" />
                              Crear Subcuenta
                            </span>
                          )}
                        </Button>
                      </form>
                      <div className="mt-3 text-sm text-gray-500">
                        Las subcuentas pueden acceder a funciones administrativas limitadas. Recuerda compartir las credenciales solo con personas de confianza.
                      </div>
                    </div>
                  )}
                  {subAccountsLoading ? (
                    <div className="text-center py-8">Cargando subcuentas...</div>
                  ) : subAccounts.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No hay subcuentas registradas.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="bg-orange-50">
                            <th className="px-4 py-2 text-left">Nombre</th>
                            <th className="px-4 py-2 text-left">Correo</th>
                            <th className="px-4 py-2 text-left">UID</th>
                            <th className="px-4 py-2 text-left">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subAccounts.map(sub => (
                            <tr key={sub.id} className="border-b">
                              <td className="px-4 py-2">{sub.name}</td>
                              <td className="px-4 py-2">{sub.email}</td>
                              <td className="px-4 py-2 font-mono text-xs">{sub.id}</td>
                              <td className="px-4 py-2">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={deletingId === sub.id}
                                  onClick={() => handleDeleteSubAccount(sub.id)}
                                >
                                  {deletingId === sub.id ? "Eliminando..." : "Eliminar"}
                                </Button>
                                <Button
                                  onClick={() => handleToggleLiberta(sub.id, sub.liberta)}
                                  className={`ml-2 ${sub.liberta === "si"
                                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                                    : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                                  variant="outline"
                                  size="sm"
                                >
                                  {sub.liberta === "si" ? "Quitar Liberta" : "Dar Liberta"}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                <RevisionList />
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
      </div>

      {/* Crear Subcuenta solo para admin principal */}
      {ofertas.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-orange-600 mb-6 text-center flex items-center justify-center gap-2">
            <span>🔥</span> Ofertas Especiales <span>🔥</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {ofertas.map((oferta) => (
              <div key={oferta.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center border-2 border-orange-200">
                <img src={oferta.image} alt={oferta.name} className="w-24 h-24 object-cover rounded-lg mb-4" />
                <h3 className="text-lg font-bold mb-2 text-orange-700">{oferta.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{oferta.description}</p>
                <span className="text-xl font-bold text-orange-600 mb-2">${oferta.price?.toLocaleString()}</span>
                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">Oferta</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
