import React, { useState } from 'react';
import { Wallet } from '@mercadopago/sdk-react';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MercadoPagoButtonProps {
    items: any[];
    payer?: {
        email: string;
        name?: string;
    };
    onPaymentCreated?: (preferenceId: string) => void;
}

export const MercadoPagoButton: React.FC<MercadoPagoButtonProps> = ({ items, payer, onPaymentCreated }) => {
    const [preferenceId, setPreferenceId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCreatePreference = async () => {
        setIsLoading(true);
        try {
            // Creamos la preferencia directamente llamando a la API de Mercado Pago
            const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN || 'APP_USR-8082943511700817-030508-69f017ff1dbb9cfd758e54290ba6953f-439164010'}`
                },
                body: JSON.stringify({
                    items: items.map(item => ({
                        id: item.id,
                        title: item.name,
                        unit_price: Number(item.price),
                        quantity: Number(item.quantity),
                        currency_id: 'ARS',
                        picture_url: item.image
                    })),
                    payer: payer ? {
                        email: payer.email,
                        first_name: payer.name?.split(' ')[0] || '',
                        last_name: payer.name?.split(' ').slice(1).join(' ') || '',
                    } : undefined,
                    back_urls: {
                        success: `${window.location.origin}/order-success`,
                        failure: `${window.location.origin}/cart`,
                        pending: `${window.location.origin}/cart`
                    },
                    external_reference: `ORDER-${Date.now()}`,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear la preferencia de pago');
            }

            const data = await response.json();
            setPreferenceId(data.id);
            if (onPaymentCreated) {
                onPaymentCreated(data.id);
            }
        } catch (error) {
            console.error('Error MP:', error);
            toast({
                title: "Error de pago",
                description: "No se pudo conectar con Mercado Pago. Intenta nuevamente.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!preferenceId) {
        return (
            <Button
                className="w-full bg-[#009EE3] hover:bg-[#0089C7] text-white flex items-center justify-center gap-2"
                onClick={handleCreatePreference}
                disabled={isLoading}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <CreditCard className="h-4 w-4" />
                )}
                Pagar con Mercado Pago
            </Button>
        );
    }

    return (
        <div id="wallet_container" className="w-full">
            <Wallet
                initialization={{ preferenceId }}
            />
        </div>
    );
};
