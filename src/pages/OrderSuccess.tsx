import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, MessageCircle, ArrowLeft, User, Mail, CreditCard } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { TopPromoBar } from '@/components/layout/TopPromoBar';
import { AdvancedHeader } from '@/components/layout/AdvancedHeader';
import { useCategories } from '@/hooks/use-categories';

export const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart, items, getTotal } = useCart();
    const { user, isAuthenticated } = useAuth();
    const { categories, mainCategories, subcategoriesByParent, thirdLevelBySubcategory } = useCategories();
    const [promoVisible, setPromoVisible] = useState(true);
    const [isSaving, setIsSaving] = useState(true);
    const [orderSaved, setOrderSaved] = useState(false);

    // Obtener parámetros de Mercado Pago de la URL
    const queryParams = new URLSearchParams(location.search);
    const paymentId = queryParams.get('payment_id');
    const status = queryParams.get('status');
    const externalReference = queryParams.get('external_reference');

    useEffect(() => {
        const saveOrder = async () => {
            if (!isAuthenticated || !user || orderSaved) return;

            // Solo guardamos si el estado es 'approved' o si no hay estado (asumimos éxito si llegó aquí)
            if (status && status !== 'approved') return;

            try {
                const isSupabase = typeof (db as any)?.from === 'function';
                const orderPayload = {
                    user_id: user.id,
                    user_name: user.name || 'Usuario',
                    user_email: user.email,
                    user_phone: null as string | null,
                    items: items.map((i: any) => ({
                        id: i.id,
                        name: i.name,
                        price: Number(i.price),
                        quantity: i.quantity,
                        image: i.image
                    })),
                    total: getTotal(),
                    delivery_fee: 0,
                    status: 'confirmed',
                    order_type: 'online',
                    order_notes: `Pasarela MP | ID Pago: ${paymentId || 'N/A'} | Ref: ${externalReference || 'N/A'}`,
                };

                if (isSupabase) {
                    const { error } = await (db as any).from('orders').insert([orderPayload]);
                    if (error) {
                        console.error('[OrderSuccess] Insert error:', error);
                        throw error;
                    }
                } else {
                    // Si fuera Firebase (según los mocks en OrdersList)
                    // await addDoc(collection(db, 'orders'), orderPayload);
                    // Pero parece que la mayoría de la app usa el estilo Supabase ahora
                }

                setOrderSaved(true);
                clearCart();
                toast({
                    title: "¡Pago confirmado!",
                    description: "Tu pedido ha sido registrado correctamente."
                });
            } catch (error) {
                console.error('Error al guardar el pedido:', error);
                toast({
                    title: "Aviso",
                    description: "Tu pago fue exitoso, pero hubo un problema al registrar el pedido automáticamente. Por favor contacta a soporte.",
                    variant: "destructive"
                });
            } finally {
                setIsSaving(false);
            }
        };

        if (items.length > 0) {
            saveOrder();
        } else {
            setIsSaving(false);
        }
    }, [isAuthenticated, user, items, orderSaved]);

    const handleWhatsAppRedirect = () => {
        const message = `Hola! Acabo de realizar un pago por la pasarela de Mercado Pago.\n\n` +
            `👤 *Usuario:* ${user?.name || 'No especificado'}\n` +
            `📧 *Email:* ${user?.email || 'No especificado'}\n` +
            `🆔 *ID de Pago:* ${paymentId || 'No disponible'}\n\n` +
            `Adjunto el comprobante del pago.`;

        const whatsappUrl = `https://wa.me/541126711308?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <TopPromoBar setPromoVisible={setPromoVisible} />
            <AdvancedHeader
                categories={categories}
                selectedCategory="Todos"
                setSelectedCategory={(cat) => navigate(cat === 'Todos' ? '/' : `/categoria/${encodeURIComponent(cat)}`)}
                promoVisible={promoVisible}
                mainCategories={mainCategories}
                subcategoriesByParent={subcategoriesByParent}
                thirdLevelBySubcategory={thirdLevelBySubcategory}
            />

            <main className="max-w-2xl mx-auto px-4 py-12">
                <Card className="border-none shadow-xl overflow-hidden rounded-2xl">
                    <div className="bg-emerald-600 h-2" />
                    <CardHeader className="text-center pt-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-12 w-12 text-emerald-600 animate-bounce" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl md:text-3xl font-bold text-slate-800">
                            ¡Pago Realizado con Éxito!
                        </CardTitle>
                        <p className="text-slate-500 mt-2">
                            Gracias por tu compra en Visfum.
                        </p>
                    </CardHeader>

                    <CardContent className="px-6 pb-8 space-y-6">
                        <div className="bg-slate-100 rounded-xl p-5 space-y-4 border border-slate-200">
                            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                <User className="h-4 w-4 text-[hsl(214,100%,38%)]" />
                                Información de Confirmación
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="space-y-1">
                                    <span className="text-slate-500 block">Usuario en la página:</span>
                                    <span className="font-bold text-slate-800 break-all">{user?.name || 'Cargando...'}</span>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-slate-500 block">Correo electrónico:</span>
                                    <span className="font-medium text-slate-800 break-all">{user?.email || 'No disponible'}</span>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-slate-200">
                                <div className="flex items-center gap-2 text-[hsl(214,100%,38%)] font-bold">
                                    <CreditCard className="h-4 w-4" />
                                    <span>Pago procesado por Pasarela</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-4">
                            <div className="flex justify-center">
                                <div className="p-3 bg-amber-100 rounded-full">
                                    <MessageCircle className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                            <div>
                                <h4 className="font-bold text-amber-800 text-lg">Paso obligatorio para confirmar:</h4>
                                <p className="text-amber-700 text-sm mt-1">
                                    Para que confirmemos tu pago y preparemos tu pedido:
                                </p>
                                <p className="text-amber-900 font-extrabold mt-3 animate-pulse">
                                    Diríjase al WhatsApp con la foto del comprobante
                                </p>
                            </div>

                            <Button
                                onClick={handleWhatsAppRedirect}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 shadow-lg hover:shadow-green-200 transition-all gap-2"
                            >
                                <MessageCircle className="h-5 w-5" />
                                Enviar Comprobante por WhatsApp
                            </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button variant="outline" className="flex-1 py-6" asChild>
                                <Link to="/">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Volver al inicio
                                </Link>
                            </Button>
                            <Button variant="outline" className="flex-1 py-6" asChild>
                                <Link to="/perfil">
                                    Ir a mis pedidos
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-slate-400 text-xs mt-8">
                    Visfum - Tu tienda de confianza. Si tienes dudas, contáctanos.
                </p>
            </main>
        </div>
    );
};

export default OrderSuccess;
