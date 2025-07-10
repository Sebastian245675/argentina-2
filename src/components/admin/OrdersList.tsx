import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Search, Eye, MessageCircle, Clock, CheckCircle, XCircle, Trash2, Check } from 'lucide-react';
import { collection, getDocs, deleteDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/firebase";

export const OrdersList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar pedidos reales de Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "pedidos"));
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  // Confirmar pedido
  const handleConfirm = async (orderId: string) => {
    await updateDoc(doc(db, "pedidos", orderId), { status: "confirmed" });
    setOrders(orders =>
      orders.map(order =>
        order.id === orderId ? { ...order, status: "confirmed" } : order
      )
    );
  };

  // Eliminar pedido
  const handleDelete = async (orderId: string) => {
    await deleteDoc(doc(db, "pedidos", orderId));
    setOrders(orders => orders.filter(order => order.id !== orderId));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmado</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">En espera</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const filteredOrders = orders.filter(order =>
    (order.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.userConjunto || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Gestión de Pedidos ({filteredOrders.length})
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por cliente, email o conjunto..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Cargando pedidos...</div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Conjunto</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.userName}</div>
                        <div className="text-sm text-muted-foreground">{order.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.userConjunto}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} className="text-sm">
                            {item.name} x{item.quantity}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-green-600">
                        ${order.total?.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{order.orderNotes}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status || 'pending')}
                        {getStatusBadge(order.status || 'pending')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {order.status !== "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConfirm(order.id)}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(order.id)}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
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
          <div className="text-center py-8">
            <p className="text-muted-foreground">No se encontraron pedidos con esos criterios de búsqueda.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
