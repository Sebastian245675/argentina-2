import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Search, Bell, MessageCircle, Clock, CheckCircle, XCircle, Trash2, Check, RefreshCw, Filter, Mail, Calendar, Download, BarChart3, FileText, ShoppingBag, Plus, DollarSign, CreditCard, Tags } from 'lucide-react';
import { db } from "@/firebase";

// Mocks para evitar errores de referencia tras eliminar la librería Firebase
const collection = (...args: any[]) => ({}) as any;
const onSnapshot = (...args: any[]) => (() => { }) as any;
const query = (...args: any[]) => ({}) as any;
const orderBy = (...args: any[]) => ({}) as any;
const limit = (...args: any[]) => ({}) as any;
const where = (...args: any[]) => ({}) as any;
const updateDoc = async (...args: any[]) => ({}) as any;
const doc = (...args: any[]) => ({}) as any;
const deleteDoc = async (...args: any[]) => ({}) as any;
const getDocs = async (...args: any[]) => ({ docs: [], forEach: () => { } }) as any;
const getDoc = async (...args: any[]) => ({ exists: () => false, data: () => ({}) }) as any;
const serverTimestamp = () => new Date();
const Timestamp = { fromDate: (d: Date) => d, now: () => new Date() } as any;
const runTransaction = async (...args: any[]) => ({}) as any;
import { useAuth } from "@/contexts/AuthContext";
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Extendemos la definición de jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface OrdersListProps {
  orders?: any[];
}

// CSS personalizado para ayudar con la responsividad
const responsiveStyles = `
  @media (max-width: 500px) {
    .responsive-table {
      font-size: 0.7rem;
    }
  }
`;

export const OrdersList: React.FC<OrdersListProps> = ({ orders: initialOrders }) => {
  const { user } = useAuth();
  const isSupabase = typeof (db as any)?.from === 'function';
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<any[]>(initialOrders || []);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'confirmed'
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [currentTab, setCurrentTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Estados para el modal de venta física
  const [showPhysicalSaleModal, setShowPhysicalSaleModal] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [savingPhysicalSale, setSavingPhysicalSale] = useState(false);

  // Estado del formulario de venta física
  const [physicalSaleData, setPhysicalSaleData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    paymentMethod: 'efectivo', // 'efectivo', 'tarjeta', 'transferencia'
    notes: '',
    discountType: 'none', // 'none', 'percentage', 'fixed'
    discountValue: 0, // valor del descuento (porcentaje o monto fijo)
  });

  // Estado para búsqueda de productos
  const [productSearchTerm, setProductSearchTerm] = useState('');

  // Estados para estadísticas del día
  const [dailySales, setDailySales] = useState({
    total: 0,
    count: 0,
    lastUpdated: new Date()
  });
  const [loadingDailySales, setLoadingDailySales] = useState(false);

  // Cargar pedidos reales de Firestore
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      if (isSupabase) {
        const { data, error } = await db
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setOrders((data || []).map((order: any) => ({
          ...order,
          id: order.id,
          createdAt: order.created_at,
          deliveryFee: order.delivery_fee,
          orderNotes: order.order_notes,
          userName: order.user_name ?? order.userName,
          userEmail: order.user_email ?? order.userEmail,
          userPhone: order.user_phone ?? order.userPhone,
          physicalSale: order.order_type === 'physical' || order.orderType === 'physical'
        })));
      } else {
        // Usamos query para ordenar por fecha de creación descendente (más reciente primero)
        const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(ordersQuery);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(ordersData);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error al cargar pedidos",
        description: "No se pudieron cargar los pedidos. Por favor, intente nuevamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // Obtener productos para la venta física
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      if (isSupabase) {
        const { data, error } = await db.from("products").select("*");
        if (error) throw error;
        setProducts(data || []);
      } else {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error al cargar productos",
        description: "No se pudieron cargar los productos disponibles.",
        variant: "destructive"
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  // Obtener ventas del día
  const fetchDailySales = async () => {
    setLoadingDailySales(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const todayStart = today.getTime();
      const tomorrowStart = tomorrow.getTime();

      if (isSupabase) {
        const { data, error } = await (db as any).from('orders').select('*');
        if (error) throw error;
        let total = 0;
        let count = 0;
        (data || []).forEach((o: any) => {
          if (o.order_type !== 'physical' && o.orderType !== 'physical') return;
          const raw = o.created_at ?? o.createdAt;
          if (!raw) return;
          const orderDate = new Date(raw).getTime();
          if (orderDate >= todayStart && orderDate < tomorrowStart) {
            total += Number(o.total || 0);
            count++;
          }
        });
        setDailySales({ total, count, lastUpdated: new Date() });
        return;
      }

      // Firestore
      try {
        const salesQuery = query(
          collection(db, "orders"),
          where("orderType", "==", "physical"),
          where("createdAt", ">=", Timestamp.fromDate(today)),
          where("createdAt", "<", Timestamp.fromDate(tomorrow))
        );
        const querySnapshot = await getDocs(salesQuery);
        let total = 0;
        let count = 0;
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.total) total += data.total;
          count++;
        });
        setDailySales({ total, count, lastUpdated: new Date() });
      } catch (queryError: any) {
        const allOrdersQuery = query(
          collection(db, "orders"),
          where("orderType", "==", "physical"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(allOrdersQuery);
        let total = 0;
        let count = 0;
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const createdAt = data.createdAt;
          let orderDate: number;
          if (createdAt?.toDate) orderDate = createdAt.toDate().getTime();
          else if (createdAt?.seconds) orderDate = createdAt.seconds * 1000;
          else if (createdAt instanceof Date) orderDate = createdAt.getTime();
          else return;
          if (orderDate >= todayStart && orderDate < tomorrowStart) {
            if (data.total) total += data.total;
            count++;
          }
        });
        setDailySales({ total, count, lastUpdated: new Date() });
      }
    } catch (error) {
      console.error("Error fetching daily sales:", error);
    } finally {
      setLoadingDailySales(false);
    }
  };

  // Listener en tiempo real para actualizar estadísticas (Supabase: polling; Firestore: onSnapshot)
  useEffect(() => {
    if (!showPhysicalSaleModal) return;

    if (isSupabase) {
      const interval = setInterval(fetchDailySales, 15000);
      return () => clearInterval(interval);
    }

    let updateTimeout: NodeJS.Timeout | null = null;
    const unsubscribe = onSnapshot(
      query(collection(db, "orders"), where("orderType", "==", "physical")),
      (snapshot) => {
        if (updateTimeout) clearTimeout(updateTimeout);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const todayStart = today.getTime();
        const tomorrowStart = tomorrow.getTime();
        updateTimeout = setTimeout(() => {
          let total = 0;
          let count = 0;
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const createdAt = data.createdAt;
            let orderDate: number;
            if (createdAt?.toDate) orderDate = createdAt.toDate().getTime();
            else if (createdAt?.seconds) orderDate = createdAt.seconds * 1000;
            else if (createdAt instanceof Date) orderDate = createdAt.getTime();
            else return;
            if (orderDate >= todayStart && orderDate < tomorrowStart) {
              if (data.total) total += data.total;
              count++;
            }
          });
          setDailySales({ total, count, lastUpdated: new Date() });
        }, 300);
      },
      (error) => {
        console.error("Error en listener de ventas:", error);
        fetchDailySales();
      }
    );
    return () => {
      unsubscribe();
      if (updateTimeout) clearTimeout(updateTimeout);
    };
  }, [showPhysicalSaleModal, isSupabase]);

  // Abrir modal de venta física y cargar productos
  const handleOpenPhysicalSaleModal = () => {
    setSelectedProducts([]);
    setPhysicalSaleData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      paymentMethod: 'efectivo',
      notes: '',
      discountType: 'none',
      discountValue: 0,
    });
    setProductSearchTerm('');
    fetchProducts();
    fetchDailySales();
    setShowPhysicalSaleModal(true);
  };

  // Gestionar la selección de productos
  const handleAddProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const stock = product.stock || 0;

      // Verificar si ya está en la lista
      const existingProduct = selectedProducts.find(p => p.id === productId);
      if (existingProduct) {
        // Si ya existe, verificar stock antes de aumentar la cantidad
        if (existingProduct.quantity + 1 > stock) {
          toast({
            title: "Stock insuficiente",
            description: `Solo hay ${stock} unidades disponibles de ${product.name}`,
            variant: "destructive"
          });
          return;
        }
        // Si ya existe, aumentar la cantidad
        setSelectedProducts(selectedProducts.map(p =>
          p.id === productId ? { ...p, quantity: p.quantity + 1 } : p
        ));
      } else {
        // Si no existe y hay stock, añadir con cantidad 1
        if (stock <= 0) {
          toast({
            title: "Sin stock",
            description: `${product.name} no tiene stock disponible`,
            variant: "destructive"
          });
          return;
        }
        setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
      }
    }
  };

  // Actualizar cantidad de un producto
  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      // Eliminar el producto si la cantidad es 0 o menos
      setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    } else {
      // Verificar stock antes de actualizar
      const product = products.find(p => p.id === productId);
      if (product) {
        const stock = product.stock || 0;
        if (quantity > stock) {
          toast({
            title: "Stock insuficiente",
            description: `Solo hay ${stock} unidades disponibles`,
            variant: "destructive"
          });
          return;
        }
      }
      // Actualizar la cantidad
      setSelectedProducts(selectedProducts.map(p =>
        p.id === productId ? { ...p, quantity } : p
      ));
    }
  };

  // Eliminar un producto de la selección
  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  // Calcular el subtotal (suma de productos sin descuento)
  const calculateSubtotal = () => {
    return selectedProducts.reduce((total, product) => {
      const price = parseFloat(product.price) || 0;
      return total + (price * product.quantity);
    }, 0);
  };

  // Calcular el descuento aplicado
  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (physicalSaleData.discountType === 'none' || subtotal === 0) {
      return 0;
    } else if (physicalSaleData.discountType === 'percentage') {
      // Asegurar que el porcentaje esté entre 0 y 100
      const percentage = Math.min(Math.max(parseFloat(physicalSaleData.discountValue.toString()) || 0, 0), 100);
      return (subtotal * percentage) / 100;
    } else if (physicalSaleData.discountType === 'fixed') {
      // El descuento fijo no puede ser mayor que el subtotal
      return Math.min(parseFloat(physicalSaleData.discountValue.toString()) || 0, subtotal);
    }
    return 0;
  };

  // Calcular el total de la venta (subtotal - descuento)
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return subtotal - discount;
  };

  // Guardar la venta física y descontar stock
  const handleSavePhysicalSale = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "No hay productos seleccionados",
        description: "Debe seleccionar al menos un producto para registrar la venta.",
        variant: "destructive"
      });
      return;
    }

    if (!physicalSaleData.customerName) {
      toast({
        title: "Nombre del cliente requerido",
        description: "Por favor, ingrese el nombre del cliente.",
        variant: "destructive"
      });
      return;
    }

    setSavingPhysicalSale(true);

    // Preparar los datos de la venta
    const items = selectedProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price) || 0,
      quantity: product.quantity,
      image: product.image || ""
    }));

    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const total = calculateTotal();
    const discountValue = parseFloat(physicalSaleData.discountValue.toString()) || 0;

    let updatedStocks: Array<{ id: string; name: string; newStock: number }> = [];

    try {
      if (isSupabase) {
        const uid = user?.id;
        const userEmail = user?.email;
        const userName = user?.name;
        if (!uid) throw new Error(JSON.stringify({ type: "auth", message: "Debes iniciar sesión para registrar ventas físicas." }));
        const supabaseDb = db as any;
        // Asegurar que el usuario existe en public.users (requerido por FK de orders)
        try {
          await supabaseDb.from('users').upsert(
            { id: uid, email: userEmail || '', name: userName || 'Admin' },
            { onConflict: 'id', ignoreDuplicates: true }
          );
        } catch (_) {
          // Si falla el upsert, el usuario puede existir ya
        }
        for (const sp of selectedProducts) {
          const { data: prod } = await supabaseDb.from('products').select('stock').eq('id', sp.id).single();
          if (!prod) throw new Error(JSON.stringify({ type: "stock", message: `"${sp.name}" ya no está disponible.` }));
          const currentStock = Number(prod.stock ?? 0);
          if (currentStock < (sp.quantity || 0)) throw new Error(JSON.stringify({ type: "stock", message: `${sp.name}: Stock ${currentStock}, solicitado ${sp.quantity}` }));
        }
        for (const sp of selectedProducts) {
          const { data: prod } = await supabaseDb.from('products').select('stock').eq('id', sp.id).single();
          const newStock = Number(prod?.stock ?? 0) - (sp.quantity || 0);
          await supabaseDb.from('products').update({ stock: newStock }).eq('id', sp.id);
          updatedStocks.push({ id: sp.id, name: sp.name, newStock });
        }
        const { error: insErr } = await supabaseDb.from('orders').insert({
          user_id: uid,
          user_name: physicalSaleData.customerName || null,
          user_email: physicalSaleData.customerEmail || null,
          user_phone: physicalSaleData.customerPhone || null,
          items,
          total,
          delivery_fee: 0,
          order_notes: physicalSaleData.notes || null,
          status: "confirmed",
          order_type: "physical",
        });
        if (insErr) {
          console.error('[OrdersList] orders insert error:', insErr);
          throw new Error(insErr?.message || insErr?.code || 'Error al guardar la venta');
        }
      } else {
        const orderRef = doc(collection(db, "orders"));
        updatedStocks = await runTransaction(db, async (transaction) => {
          const stockUpdates: Array<{ id: string; name: string; newStock: number }> = [];

          for (const selectedProduct of selectedProducts) {
            const productRef = doc(db, "products", selectedProduct.id);
            const productSnapshot = await transaction.get(productRef);

            if (!productSnapshot.exists()) {
              throw new Error(JSON.stringify({
                type: "stock",
                message: `El producto "${selectedProduct.name}" ya no está disponible en el inventario.`
              }));
            }

            const data = productSnapshot.data();
            const currentStock = Number(data.stock ?? 0);
            const quantityRequested = Number(selectedProduct.quantity ?? 0);

            if (!Number.isFinite(quantityRequested) || quantityRequested <= 0) {
              throw new Error(JSON.stringify({
                type: "stock",
                message: `Cantidad inválida para "${selectedProduct.name}".`
              }));
            }

            if (!Number.isFinite(currentStock) || currentStock < quantityRequested) {
              throw new Error(JSON.stringify({
                type: "stock",
                message: `${selectedProduct.name}: Stock disponible ${Math.max(0, currentStock)}, solicitado ${quantityRequested}`
              }));
            }

            const newStock = currentStock - quantityRequested;

            transaction.update(productRef, {
              stock: newStock,
              lastModified: serverTimestamp()
            });

            stockUpdates.push({
              id: selectedProduct.id,
              name: selectedProduct.name,
              newStock
            });
          }

          transaction.set(orderRef, {
            userName: physicalSaleData.customerName,
            userPhone: physicalSaleData.customerPhone,
            userEmail: physicalSaleData.customerEmail,
            items,
            subtotal,
            discountType: physicalSaleData.discountType,
            discountValue,
            discountAmount: discount,
            total,
            status: "confirmed",
            createdAt: serverTimestamp(),
            confirmedAt: serverTimestamp(),
            orderType: "physical",
            paymentMethod: physicalSaleData.paymentMethod,
            orderNotes: physicalSaleData.notes,
            physicalSale: true
          });

          return stockUpdates;
        });
      }

      toast({
        title: "Venta registrada exitosamente",
        description: `Se ha registrado la venta por $${total.toLocaleString()}.`,
        variant: "default"
      });

      // Forzar actualización del dashboard
      console.log("Disparando evento de actualización del dashboard con total:", total);
      const dashboardUpdateEvent = new CustomEvent('dashboardUpdate', {
        detail: {
          type: 'orderConfirmed',
          orderTotal: total
        }
      });
      document.dispatchEvent(dashboardUpdateEvent);

      // Forzar recarga de las estadísticas - busca el botón de actualizar del dashboard y haz clic en él
      setTimeout(() => {
        const refreshButton = document.querySelector('.dashboard-refresh-button');
        if (refreshButton && refreshButton instanceof HTMLButtonElement) {
          console.log("Forzando recarga de estadísticas");
          refreshButton.click();
        }
      }, 500);

      // Actualizar estadísticas del día inmediatamente (suma local)
      setDailySales(prev => ({
        total: prev.total + total,
        count: prev.count + 1,
        lastUpdated: new Date()
      }));

      // También actualizar desde Firestore después de un pequeño delay
      setTimeout(() => {
        fetchDailySales();
      }, 1000);

      // Resetear formulario para nueva venta
      setSelectedProducts([]);
      setPhysicalSaleData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        paymentMethod: 'efectivo',
        notes: '',
        discountType: 'none',
        discountValue: 0,
      });
      setProductSearchTerm('');

      // Recargar pedidos y productos
      await fetchOrders();
      await fetchProducts();

      // Opcional: mostrar alerta de stock agotado
      const zeroStockProducts = updatedStocks.filter(p => p.newStock === 0);
      if (zeroStockProducts.length > 0) {
        toast({
          title: "Productos sin stock",
          description: `${zeroStockProducts.map(p => p.name).join(", ")} quedó ${zeroStockProducts.length > 1 ? "sin stock" : "sin unidades disponibles"}.`,
        });
      }

    } catch (error) {
      console.error("Error registrando la venta física:", error);
      let errorMessage = "No se pudo registrar la venta. Por favor, intente nuevamente.";
      let title = "Error al registrar la venta";

      if (error instanceof Error && error.message) {
        try {
          const parsed = JSON.parse(error.message);
          if (parsed?.type === "stock") {
            errorMessage = parsed.message;
            title = "Stock insuficiente";
          } else if (parsed?.type === "auth") {
            errorMessage = parsed.message;
            title = "Sesión requerida";
          } else if (parsed?.message) {
            errorMessage = parsed.message;
          }
        } catch {
          if (error.message.toLowerCase().includes("stock")) {
            title = "Stock insuficiente";
            errorMessage = error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
        }
      }

      toast({
        title,
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSavingPhysicalSale(false);
    }
  };

  // Confirmar pedido
  const handleConfirm = async (orderId: string) => {
    try {
      let orderData: any;
      if (isSupabase) {
        const { data, error: fetchErr } = await (db as any).from('orders').select('*').eq('id', orderId).single();
        if (fetchErr || !data) throw new Error("No se encontró el pedido");
        orderData = data;
        const { error: updateErr } = await (db as any).from('orders').update({
          status: "confirmed",
          confirmed_at: new Date().toISOString()
        }).eq('id', orderId);
        if (updateErr) throw updateErr;
      } else {
        const orderRef = doc(db, "orders", orderId);
        const orderSnapshot = await getDoc(orderRef);
        if (!orderSnapshot.exists()) throw new Error("No se encontró el pedido");
        orderData = orderSnapshot.data();
        await updateDoc(orderRef, { status: "confirmed", confirmedAt: new Date().toISOString() });
      }

      // Actualizar la UI
      setOrders(orders =>
        orders.map(order =>
          order.id === orderId ? {
            ...order,
            status: "confirmed",
            confirmedAt: new Date().toISOString()
          } : order
        )
      );

      toast({
        title: "Pedido confirmado",
        description: "El pedido ha sido confirmado exitosamente.",
        variant: "default"
      });

      // Forzar actualización del dashboard
      // Esta acción sería ideal para un sistema de eventos o context
      // pero para simplificar usaremos un evento personalizado
      const dashboardUpdateEvent = new CustomEvent('dashboardUpdate', {
        detail: {
          type: 'orderConfirmed',
          orderTotal: orderData.total || 0
        }
      });
      document.dispatchEvent(dashboardUpdateEvent);

      // Forzar recarga de las estadísticas - busca el botón de actualizar del dashboard y haz clic en él
      setTimeout(() => {
        const refreshButton = document.querySelector('.dashboard-refresh-button');
        if (refreshButton && refreshButton instanceof HTMLButtonElement) {
          console.log("Forzando recarga de estadísticas");
          refreshButton.click();
        }
      }, 500);
    } catch (error) {
      console.error("Error confirming order:", error);
      toast({
        title: "Error al confirmar",
        description: "No se pudo confirmar el pedido. Por favor, intente nuevamente.",
        variant: "destructive"
      });
    }
  };

  // Eliminar pedido
  const handleDelete = async (orderId: string) => {
    if (!confirm("¿Está seguro que desea eliminar este pedido? Esta acción no se puede deshacer.")) {
      return;
    }

    try {
      if (isSupabase) {
        const { error } = await (db as any).from('orders').delete().eq('id', orderId);
        if (error) throw error;
      } else {
        await deleteDoc(doc(db, "orders", orderId));
      }
      setOrders(orders => orders.filter(order => order.id !== orderId));
      toast({
        title: "Pedido eliminado",
        description: "El pedido ha sido eliminado exitosamente.",
        variant: "default"
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el pedido. Por favor, intente nuevamente.",
        variant: "destructive"
      });
    }
  };

  // Manejar cambio en el notificador
  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    toast({
      title: "Función no disponible",
      description: "El notificador de pedidos por correos aún no está disponible en esta tienda.",
      variant: "destructive"
    });
  };

  // Exportar pedidos como CSV
  const exportToCSV = () => {
    setExporting(true);

    try {
      // Crear el contenido CSV
      const headers = ["ID", "Cliente", "Email", "Teléfono", "Productos", "Total", "Estado", "Fecha Creación", "Fecha Confirmación", "Notas"];

      const csvRows = [headers];

      // Agregar datos de pedidos
      filteredOrders.forEach(order => {
        const productsList = order.items && order.items.length > 0
          ? order.items.map((item: any) => `${item.name} x${item.quantity}`).join(", ")
          : "Sin productos";

        const row = [
          order.id || "",
          order.userName || "",
          order.userEmail || "",
          order.userPhone || "",
          productsList,
          typeof order.total === 'number' ? order.total.toLocaleString() : '0',
          order.status === 'confirmed' ? 'Confirmado' : 'En espera',
          order.createdAt ? formatDate(order.createdAt) : 'N/A',
          order.confirmedAt ? formatDate(order.confirmedAt) : 'N/A',
          order.orderNotes || ""
        ];

        csvRows.push(row);
      });

      // Convertir array a string CSV
      const csvContent = csvRows.map(row =>
        row.map(cell => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      ).join('\n');

      // Crear el blob y descargarlo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `pedidos_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Exportación exitosa",
        description: `Se han exportado ${filteredOrders.length} pedidos en formato CSV.`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast({
        title: "Error en la exportación",
        description: "No se pudieron exportar los pedidos. Inténtelo nuevamente.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  // Exportar pedidos como PDF
  const exportToPDF = () => {
    setExporting(true);

    try {
      // Crear el documento PDF
      const doc = new jsPDF();

      // Añadir título
      doc.setFontSize(16);
      doc.text("Reporte de Pedidos", 14, 15);

      // Añadir fecha
      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}`, 14, 22);

      // Añadir filtros utilizados
      if (searchTerm || currentTab !== 'all') {
        let filtersText = "Filtros: ";
        if (searchTerm) filtersText += `Búsqueda: "${searchTerm}" `;
        if (currentTab !== 'all') filtersText += `Estado: ${currentTab === 'pending' ? 'Pendientes' : 'Confirmados'}`;
        doc.text(filtersText, 14, 27);
      }

      // Preparar datos para la tabla
      const tableColumn = ["Cliente", "Contacto", "Productos", "Total", "Estado", "Fecha"];
      const tableRows = filteredOrders.map(order => {
        const productsList = order.items && order.items.length > 0
          ? order.items.map((item: any) => `${item.name} x${item.quantity}`).join(", ")
          : "Sin productos";

        return [
          order.userName || "Cliente",
          `${order.userPhone || "No especificado"}\n${order.userEmail || ""}`,
          productsList.length > 40 ? `${productsList.substring(0, 40)}...` : productsList,
          typeof order.total === 'number' ? `$${order.total.toLocaleString()}` : '$0',
          order.status === 'confirmed' ? 'Confirmado' : 'En espera',
          formatDate(order.createdAt)
        ];
      });

      // Crear tabla en el PDF
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 32,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        theme: 'grid',
        columnStyles: {
          0: { cellWidth: 30 },  // Cliente
          1: { cellWidth: 40 },  // Contacto
          2: { cellWidth: 60 },  // Productos
          3: { cellWidth: 15 },  // Total
          4: { cellWidth: 20 },  // Estado
          5: { cellWidth: 25 },  // Fecha
        }
      });

      // Añadir información al pie de página
      const finalY = doc.lastAutoTable.finalY || 32;
      doc.setFontSize(10);
      doc.text(`Total de pedidos: ${filteredOrders.length}`, 14, finalY + 10);

      // Añadir contador de estados
      const confirmedCount = filteredOrders.filter(order => order.status === 'confirmed').length;
      const pendingCount = filteredOrders.filter(order => order.status !== 'confirmed').length;
      doc.text(`Confirmados: ${confirmedCount} | Pendientes: ${pendingCount}`, 14, finalY + 16);

      // Guardar el PDF
      doc.save(`reporte_pedidos_${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "Exportación exitosa",
        description: `Se han exportado ${filteredOrders.length} pedidos en formato PDF.`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      toast({
        title: "Error en la exportación",
        description: "No se pudieron exportar los pedidos a PDF. Inténtelo nuevamente.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: string, isPhysical: boolean, paymentMethod?: string) => {
    if (isPhysical) {
      return <Badge className="bg-[hsl(214,100%,38%)]/10 text-[hsl(214,100%,38%)] border-[hsl(214,100%,38%)]/20 font-medium rounded-lg">Venta Física</Badge>;
    }

    if (paymentMethod === 'pasarela') {
      return <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-medium rounded-lg flex items-center gap-1">
        <CreditCard className="h-3 w-3" />
        Pagado con pasarela
      </Badge>;
    }

    switch (status) {
      case 'confirmed':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium rounded-lg">Confirmado</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium rounded-lg">En espera</Badge>;
    }
  };

  const getStatusIcon = (status: string, isPhysical: boolean) => {
    if (isPhysical) {
      return <ShoppingBag className="h-4 w-4 text-[hsl(214,100%,38%)]" />;
    }

    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-amber-600" />;
    }
  };

  const formatDate = (dateString?: any) => {
    if (!dateString) return 'N/A';

    try {
      // Si es un timestamp de Firestore
      if (typeof dateString === 'object' && dateString.seconds) {
        return new Intl.DateTimeFormat('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date(dateString.seconds * 1000));
      }

      // Si es una cadena ISO
      const date = new Date(dateString);

      // Validar si la fecha es válida
      if (isNaN(date.getTime())) {
        // Intentar convertir de timestamp numérico si es un número
        if (!isNaN(Number(dateString))) {
          return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).format(new Date(Number(dateString)));
        }

        // Si llegamos aquí, no pudimos formatear la fecha
        console.error("Fecha inválida:", dateString);
        return new Date().toLocaleDateString('es-ES');
      }

      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return new Date().toLocaleDateString('es-ES');
    }
  };

  const filteredOrders = orders
    .filter(order =>
      (order.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.userPhone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.id || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(order => {
      if (currentTab === 'all') return true;
      if (currentTab === 'pending') return order.status !== 'confirmed' && !order.physicalSale;
      if (currentTab === 'confirmed') return order.status === 'confirmed' && !order.physicalSale;
      if (currentTab === 'physical') return !!order.physicalSale || order.order_type === 'physical' || order.orderType === 'physical';
      return true;
    });

  return (
    <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden rounded-xl">
      <style>{responsiveStyles}</style>
      <CardHeader className="pb-0 bg-slate-50/50 border-b border-slate-200">
        {/* Encabezado responsivo */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[hsl(214,100%,38%)] flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-800 text-xl md:text-2xl font-bold">
                Gestión de Pedidos
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs md:text-sm mt-0.5">
                {refreshing ? 'Actualizando...' : `Total ${filteredOrders.length} ${filteredOrders.length === 1 ? 'pedido' : 'pedidos'}`}
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <Button
              size="sm"
              variant="default"
              onClick={handleOpenPhysicalSaleModal}
              className="flex items-center gap-1.5 text-xs h-9 gradient-orange hover:opacity-90"
            >
              <ShoppingBag className="h-3.5 w-3.5 md:h-4 md:w-4" />
              <span className="hidden xs:inline">Venta Física</span>
              <Plus className="h-3.5 w-3.5 md:h-4 md:w-4 xs:hidden" />
            </Button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200">
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={handleToggleNotifications}
              />
              <label htmlFor="notifications" className="text-xs md:text-sm text-slate-600 cursor-pointer flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Notificador por email</span>
                <span className="sm:hidden">Notif.</span>
              </label>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 text-xs h-9 border-slate-200 hover:bg-slate-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 md:h-4 md:w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1.5 text-xs h-9 border-slate-200 hover:bg-slate-50"
                  disabled={exporting || filteredOrders.length === 0}
                >
                  {exporting ? (
                    <RefreshCw className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  )}
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-slate-200">
                <DropdownMenuItem onClick={exportToCSV} disabled={exporting || filteredOrders.length === 0}>
                  Exportar como CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF} disabled={exporting || filteredOrders.length === 0}>
                  Exportar como PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mt-4 md:mt-5">
          <TabsList className="mb-3 bg-slate-100 p-1 w-full h-10 md:h-11 rounded-xl border border-slate-200">
            <TabsTrigger value="all" className="text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[hsl(214,100%,38%)] rounded-lg">
              Todos
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[hsl(214,100%,38%)] rounded-lg">
              Pendientes
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[hsl(214,100%,38%)] rounded-lg">
              Confirmados
            </TabsTrigger>
            <TabsTrigger value="physical" className="text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[hsl(214,100%,38%)] rounded-lg">
              Ventas Físicas
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar pedido por cliente, contacto o ID..."
                className="pl-10 text-sm h-10 border-slate-200 focus:border-[hsl(214,100%,38%)] focus:ring-[hsl(214,100%,38%)]/20 rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button size="icon" variant="outline" className="h-10 w-10 rounded-lg border-slate-200 hover:bg-slate-50">
              <Filter className="h-4 w-4 text-slate-500" />
            </Button>
          </div>
        </Tabs>
      </CardHeader>
      <CardContent className="pt-4 px-4 md:px-6 bg-white">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <RefreshCw className="h-7 w-7 animate-spin text-[hsl(214,100%,38%)]" />
            </div>
            <span className="text-slate-500 text-sm">Cargando pedidos...</span>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 overflow-hidden overflow-x-auto responsive-table shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-slate-200 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-700 text-xs md:text-sm whitespace-nowrap">Cliente</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-xs md:text-sm whitespace-nowrap hidden sm:table-cell">Contacto</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-xs md:text-sm whitespace-nowrap hidden md:table-cell">Productos</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-xs md:text-sm whitespace-nowrap">Total</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-xs md:text-sm whitespace-nowrap hidden sm:table-cell">Fecha</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-xs md:text-sm whitespace-nowrap">Estado</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700 text-xs md:text-sm whitespace-nowrap">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50/80 text-xs md:text-sm border-b border-slate-100">
                    {/* Cliente - Siempre visible */}
                    <TableCell className="py-2 md:py-4">
                      <div>
                        <div className="font-semibold text-xs md:text-sm line-clamp-1">
                          {order.userName || 'Cliente'}
                        </div>
                        <div className="text-[10px] md:text-xs text-muted-foreground mt-1 hidden xs:block">
                          ID: {order.id.substring(0, 6)}...
                        </div>
                      </div>
                    </TableCell>

                    {/* Contacto - Oculto en móvil */}
                    <TableCell className="hidden sm:table-cell py-2 md:py-4">
                      <div>
                        <div className="font-medium text-xs md:text-sm flex items-center gap-1 line-clamp-1">
                          {order.userPhone || 'No especificado'}
                        </div>
                        <div className="text-[10px] md:text-xs text-[hsl(214,100%,38%)] font-semibold mt-1 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="line-clamp-1">{order.userEmail}</span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Productos - Oculto en móvil */}
                    <TableCell className="hidden md:table-cell py-2 md:py-4">
                      <div className="max-w-[140px] md:max-w-[200px] overflow-hidden">
                        {order.items && order.items.length > 0 ? (
                          <>
                            {order.items.slice(0, 2).map((item: any, idx: number) => (
                              <div key={idx} className="text-xs md:text-sm flex items-center gap-1 mb-1">
                                <Badge variant="outline" className="px-1.5 py-0 h-4 md:h-5 text-[10px] md:text-xs rounded-lg border-slate-200 bg-slate-50">
                                  {item.quantity}
                                </Badge>
                                <span className="truncate max-w-[90px] md:max-w-[140px]" title={item.name}>
                                  {item.name}
                                </span>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <div className="text-[10px] md:text-xs text-slate-500">
                                +{order.items.length - 2} más
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-[10px] md:text-xs text-muted-foreground">Sin productos</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Total - Siempre visible */}
                    <TableCell className="py-2 md:py-4">
                      <div className="font-semibold text-[hsl(214,100%,38%)] text-xs md:text-sm whitespace-nowrap">
                        ${typeof order.total === 'number' ? order.total.toLocaleString() : '0'}
                      </div>
                      {order.discountType && order.discountType !== 'none' && (
                        <div className="text-[10px] md:text-xs text-red-500 mt-1 flex items-center gap-1">
                          <Tags className="h-3 w-3" />
                          {order.discountType === 'percentage' ?
                            `${order.discountValue}% desc.` :
                            `$${order.discountAmount?.toLocaleString() || 0} desc.`}
                        </div>
                      )}
                    </TableCell>

                    {/* Fecha - Oculto en móvil */}
                    <TableCell className="hidden sm:table-cell py-2 md:py-4">
                      <div>
                        <div className="text-[10px] md:text-xs font-medium">
                          {formatDate(order.createdAt)}
                        </div>
                        {order.status === 'confirmed' && order.confirmedAt && (
                          <div className="text-[10px] md:text-xs text-slate-500 mt-1">
                            Conf: {formatDate(order.confirmedAt)}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    {/* Estado - Siempre visible */}
                    <TableCell className="py-2 md:py-4">
                      <div className="flex items-center gap-1 md:gap-2">
                        {getStatusIcon(order.status || 'pending', !!order.physicalSale)}
                        {getStatusBadge(order.status || 'pending', !!order.physicalSale, order.paymentMethod || order.payment_method)}
                      </div>
                      {order.orderNotes && (
                        <div className="text-[10px] md:text-xs text-slate-500 mt-1 italic truncate max-w-[80px] md:max-w-[120px] hidden sm:block" title={order.orderNotes}>
                          "{order.orderNotes}"
                        </div>
                      )}
                      {(order.paymentMethod || order.payment_method) && (
                        <div className="text-[10px] md:text-xs text-slate-500 mt-1 truncate max-w-[80px] md:max-w-[120px]">
                          Pago: {
                            (order.paymentMethod === 'pasarela' || order.payment_method === 'pasarela') ? 'Pasarela (MP)' :
                              order.paymentMethod === 'efectivo' ? 'Efectivo' :
                                order.paymentMethod === 'tarjeta' ? 'Tarjeta' :
                                  'Transferencia'
                          }
                        </div>
                      )}
                    </TableCell>

                    {/* Acciones - Siempre visible */}
                    <TableCell className="text-right py-2 md:py-4">
                      <div className="flex justify-end gap-1 md:gap-2">
                        {order.status !== "confirmed" && !order.physicalSale && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConfirm(order.id)}
                            className="text-green-600 border-green-300 hover:bg-green-50 h-7 w-7 p-0 md:h-8 md:w-8"
                            title="Confirmar pedido"
                          >
                            <Check className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(order.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50 h-8 w-8 p-0 rounded-lg"
                          title="Eliminar pedido"
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredOrders.length === 0 && !loading && (
          <div className="text-center py-12 md:py-16 border border-slate-200 rounded-xl bg-slate-50/50">
            <div className="flex flex-col items-center max-w-[280px] md:max-w-md mx-auto px-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-700 text-base md:text-lg mb-2">No hay pedidos</h3>
              <span className="text-slate-500 text-sm mb-4 block">
                No se encontraron pedidos con los criterios de búsqueda actuales.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setCurrentTab('all');
                }}
                className="text-sm h-9 border-slate-200 hover:bg-slate-100"
              >
                Limpiar filtros
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {/* Punto de Venta (POS) - Pantalla Completa */}
      {showPhysicalSaleModal && (
        <>
          {/* Estilos personalizados para scrollbar sutil */}
          <style>{`
            .pos-scrollbar::-webkit-scrollbar, .pos-scrollbar-horizontal::-webkit-scrollbar { width: 6px; height: 6px; }
            .pos-scrollbar::-webkit-scrollbar-track, .pos-scrollbar-horizontal::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 3px; }
            .pos-scrollbar::-webkit-scrollbar-thumb, .pos-scrollbar-horizontal::-webkit-scrollbar-thumb {
              background: hsl(214 100% 38% / 0.25); border-radius: 3px;
            }
            .pos-scrollbar::-webkit-scrollbar-thumb:hover, .pos-scrollbar-horizontal::-webkit-scrollbar-thumb:hover {
              background: hsl(214 100% 38% / 0.4);
            }
          `}</style>
          <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col">
            {/* Header del POS - Mismo azul que el resto de la app */}
            <div className="bg-[hsl(214,100%,38%)] text-white px-3 sm:px-5 py-3 shadow-lg border-b border-[hsl(214,80%,28%)]">
              <div className="flex items-center justify-between gap-2 max-w-[1800px] mx-auto">
                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                  <img src="/logo%20vifum.png" alt="Visfum" className="h-8 sm:h-10 w-auto object-contain" />
                  <div className="min-w-0 border-l border-white/30 pl-3 sm:pl-4">
                    <h2 className="text-sm sm:text-base md:text-lg font-bold leading-tight">Punto de Venta</h2>
                    <p className="text-white/80 text-[10px] sm:text-xs leading-tight hidden sm:block">Ventas en tienda física</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="bg-white/15 rounded-lg px-2.5 sm:px-3 py-1.5 border border-white/25">
                      <span className="text-white/80 text-[10px] sm:text-xs">Ventas hoy</span>
                      <span className="font-bold block text-base sm:text-lg">
                        {loadingDailySales ? <RefreshCw className="h-4 w-4 animate-spin inline" /> : dailySales.count}
                      </span>
                    </div>
                    <div className="bg-white/15 rounded-lg px-2.5 sm:px-3 py-1.5 border border-white/25">
                      <span className="text-white/80 text-[10px] sm:text-xs">Total hoy</span>
                      <span className="font-bold block text-base sm:text-lg">
                        {loadingDailySales ? <RefreshCw className="h-4 w-4 animate-spin inline" /> : `$${dailySales.total.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="bg-white/20 rounded-lg px-2.5 sm:px-3 py-1.5 border border-white/30 hidden sm:block">
                      <span className="text-white/80 text-[10px] sm:text-xs">Venta actual</span>
                      <span className="font-bold block text-base sm:text-lg">${calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPhysicalSaleModal(false)}
                    className="text-white hover:bg-white/20 rounded-full h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                  >
                    <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Contenido principal del POS */}
            <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row bg-slate-50">
              {/* Panel izquierdo: Búsqueda y Carrito */}
              <div className="max-h-[60vh] lg:max-h-none flex-shrink-0 lg:flex-1 min-w-0 border-r-0 lg:border-r border-slate-200 bg-white flex flex-col shadow-sm">
                {/* Buscador de productos */}
                <div className="p-3 sm:p-4 border-b border-slate-200 bg-white">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Buscar productos..."
                      className="pl-10 h-10 text-sm border-slate-200 focus:border-[hsl(214,100%,38%)] focus:ring-[hsl(214,100%,38%)]/20"
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                    />
                    {productSearchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-8 w-8 sm:h-9 sm:w-9 px-0"
                        onClick={() => setProductSearchTerm('')}
                      >
                        <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      </Button>
                    )}
                  </div>

                  {/* Lista rápida de productos (scroll horizontal) */}
                  {(productSearchTerm || products.length > 0) && (
                    <div className="overflow-x-auto -mx-2 sm:-mx-3 px-2 sm:px-3 pos-scrollbar-horizontal">
                      <div className="flex gap-1.5 sm:gap-2 pb-2">
                        {(productSearchTerm
                          ? products.filter(product =>
                            product.name?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                            product.description?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                            product.id?.toLowerCase().includes(productSearchTerm.toLowerCase())
                          ).slice(0, 10)
                          : products.slice(0, 15)
                        ).map((product) => {
                          const stock = product.stock || 0;
                          const hasStock = stock > 0;

                          return (
                            <div
                              key={product.id}
                              onClick={() => hasStock && handleAddProduct(product.id)}
                              className={cn(
                                "bg-white border rounded-xl p-2 sm:p-2.5 cursor-pointer transition-all flex-shrink-0 min-w-[90px] sm:min-w-[110px] border-slate-200",
                                !hasStock && "opacity-50 cursor-not-allowed",
                                hasStock && "hover:border-[hsl(214,100%,38%)] hover:shadow-lg hover:ring-2 hover:ring-[hsl(214,100%,38%)]/20"
                              )}
                            >
                              {product.image ? (
                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg overflow-hidden mb-1 mx-auto border border-slate-100">
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-slate-100 rounded-lg flex items-center justify-center mb-1 mx-auto">
                                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                                </div>
                              )}
                              <p className="text-[9px] sm:text-[10px] font-medium line-clamp-2 mb-1 text-center leading-tight">{product.name}</p>
                              <div className="flex items-center justify-between text-[10px] sm:text-xs gap-1">
                                <p className="font-bold text-[hsl(214,100%,38%)] truncate">${parseFloat(product.price || 0).toLocaleString()}</p>
                                <Badge variant={stock > 0 ? "secondary" : "destructive"} className="text-[8px] h-4 px-1.5 bg-slate-100 text-slate-700">
                                  {stock}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/50">
                  <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                    <ShoppingBag className="h-4 w-4 text-[hsl(214,100%,38%)]" />
                    Productos en venta
                  </h3>
                </div>

                {/* Lista de productos en el carrito - Estilo Elevator */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-3 pos-scrollbar">
                  {selectedProducts.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium text-slate-500">Carrito vacío</p>
                      <p className="text-xs mt-1">Busca y haz clic en los productos para agregar</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedProducts.map((product) => (
                        <div key={product.id} className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all">
                          <div className="flex items-start gap-2 sm:gap-3">
                            {product.image ? (
                              <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                              </div>
                            ) : (
                              <div className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0 border border-gray-200">
                                <ShoppingBag className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-semibold line-clamp-1 mb-0.5 sm:mb-1">{product.name}</p>
                              <p className="text-[10px] sm:text-xs text-gray-500 mb-1.5 sm:mb-2">${parseFloat(product.price || 0).toLocaleString()} c/u</p>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6 sm:h-7 sm:w-7 text-xs sm:text-sm"
                                    onClick={() => handleUpdateQuantity(product.id, product.quantity - 1)}
                                  >
                                    -
                                  </Button>
                                  <span className="text-xs sm:text-sm font-bold w-5 sm:w-6 text-center">{product.quantity}</span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6 sm:h-7 sm:w-7 text-xs sm:text-sm"
                                    onClick={() => handleUpdateQuantity(product.id, product.quantity + 1)}
                                  >
                                    +
                                  </Button>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6 sm:h-7 sm:w-7 text-red-500 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                                  onClick={() => handleRemoveProduct(product.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                              </div>
                              <div className="mt-2 pt-2 border-t border-slate-100">
                                <p className="text-sm font-bold text-[hsl(214,100%,38%)]">
                                  ${(parseFloat(product.price || 0) * product.quantity).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Totales rápidos en el carrito */}
                {selectedProducts.length > 0 && (
                  <div className="p-4 border-t border-slate-200 bg-slate-50">
                    <div className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="font-medium">${calculateSubtotal().toLocaleString()}</span>
                    </div>
                    {physicalSaleData.discountType !== 'none' && (
                      <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="text-slate-500">Descuento:</span>
                        <span className="text-red-600 font-medium">-${calculateDiscount().toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-slate-300">
                      <span className="text-base font-bold text-slate-700">Total:</span>
                      <span className="text-xl font-bold text-[hsl(214,100%,38%)]">${calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Panel derecho: Formulario de cliente y pago */}
              <div className="w-full lg:w-[380px] flex-shrink-0 p-4 sm:p-5 lg:overflow-y-auto bg-white flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 lg:pos-scrollbar shadow-sm">
                {/* Panel de información del cliente y totales */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-sm font-medium text-slate-700">Cliente *</Label>
                    <Input
                      id="customerName"
                      placeholder="Nombre completo"
                      value={physicalSaleData.customerName}
                      onChange={(e) => setPhysicalSaleData({ ...physicalSaleData, customerName: e.target.value })}
                      className="h-10 text-sm border-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone" className="text-sm font-medium text-slate-700">Teléfono</Label>
                      <Input
                        id="customerPhone"
                        placeholder="Teléfono"
                        value={physicalSaleData.customerPhone}
                        onChange={(e) => setPhysicalSaleData({ ...physicalSaleData, customerPhone: e.target.value })}
                        className="h-10 text-sm border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod" className="text-sm font-medium text-slate-700">Pago</Label>
                      <Select
                        value={physicalSaleData.paymentMethod}
                        onValueChange={(value) => setPhysicalSaleData({ ...physicalSaleData, paymentMethod: value })}
                      >
                        <SelectTrigger className="h-10 text-sm border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="efectivo">Efectivo</SelectItem>
                          <SelectItem value="tarjeta">Tarjeta</SelectItem>
                          <SelectItem value="transferencia">Transferencia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Descuentos */}
                  <div className="border-t border-slate-200 pt-4 space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Tipo de descuento</Label>
                    <Select
                      value={physicalSaleData.discountType}
                      onValueChange={(value) => setPhysicalSaleData({ ...physicalSaleData, discountType: value, discountValue: 0 })}
                    >
                      <SelectTrigger className="h-10 text-sm border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin descuento</SelectItem>
                        <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                        <SelectItem value="fixed">Monto fijo ($)</SelectItem>
                      </SelectContent>
                    </Select>

                    {physicalSaleData.discountType !== 'none' && (
                      <Input
                        type="number"
                        min="0"
                        max={physicalSaleData.discountType === 'percentage' ? "100" : undefined}
                        placeholder={physicalSaleData.discountType === 'percentage' ? "0-100" : "0.00"}
                        value={physicalSaleData.discountValue}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          const validValue = physicalSaleData.discountType === 'percentage' ?
                            Math.min(Math.max(value, 0), 100) :
                            Math.max(value, 0);
                          setPhysicalSaleData({ ...physicalSaleData, discountValue: validValue });
                        }}
                        className="h-10 text-sm border-slate-200"
                      />
                    )}
                  </div>

                  {/* Totales */}
                  <div className="border-t border-slate-200 pt-4 space-y-2 bg-slate-50 rounded-xl p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="font-medium">${calculateSubtotal().toLocaleString()}</span>
                    </div>
                    {physicalSaleData.discountType !== 'none' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 truncate pr-1">
                          Desc. {physicalSaleData.discountType === 'percentage' ? `(${physicalSaleData.discountValue}%)` : ''}:
                        </span>
                        <span className="text-red-600 font-medium flex-shrink-0">-${calculateDiscount().toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-3 border-t border-slate-200">
                      <span className="text-slate-700">Total:</span>
                      <span className="text-[hsl(214,100%,38%)] text-lg">${calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="space-y-2 pt-2">
                    <Button
                      onClick={handleSavePhysicalSale}
                      disabled={savingPhysicalSale || selectedProducts.length === 0 || !physicalSaleData.customerName}
                      className="w-full gradient-orange hover:opacity-90 h-12 text-base font-bold"
                      size="lg"
                    >
                      {savingPhysicalSale ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 animate-spin" />
                          <span className="text-xs sm:text-sm">Procesando...</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                          <span className="text-xs sm:text-base">Finalizar Venta</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowPhysicalSaleModal(false)}
                      disabled={savingPhysicalSale}
                      className="w-full h-10 text-sm border-slate-200 hover:bg-slate-50"
                    >
                      Cerrar POS
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};
