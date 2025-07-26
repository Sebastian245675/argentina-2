
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/contexts/CartContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus, Star, Shield, Truck } from 'lucide-react';
import { recordProductView } from '@/lib/product-analytics';
import { useAuth } from '@/contexts/AuthContext';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [viewRecorded, setViewRecorded] = useState(false);

  useEffect(() => {
    // Registrar vista solo cuando el modal se abre y tenemos un producto
    if (isOpen && product && !viewRecorded) {
      recordProductView(product.id, product.name, user?.id);
      setViewRecorded(true);
    }
    
    // Resetear el estado cuando el modal se cierra
    if (!isOpen) {
      setViewRecorded(false);
    }
  }, [isOpen, product, user?.id, viewRecorded]);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: "¡Producto agregado!",
      description: `${quantity}x ${product.name} agregado a tu carrito`,
    });
    onClose();
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Imagen del producto */}
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-96 md:h-full object-cover"
            />
            <Badge 
              className="absolute top-4 right-4 bg-white/90 text-foreground border-0"
            >
              {product.category}
            </Badge>
            {product.stock < 5 && (
              <Badge 
                variant="destructive"
                className="absolute top-4 left-4"
              >
                ¡Últimas {product.stock} unidades!
              </Badge>
            )}
          </div>

          {/* Detalles del producto */}
          <div className="p-6 flex flex-col">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-bold leading-tight">
                {product.name}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 space-y-4">
              {/* Precio */}
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold gradient-text-orange">
                  ${product.price.toLocaleString()}
                </span>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Disponible
                </Badge>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">(128 reseñas)</span>
              </div>

              <Separator />

              {/* Descripción */}
              <div>
                <h4 className="font-semibold mb-2">Descripción</h4>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Características */}
              <div className="space-y-3">
                <h4 className="font-semibold">Beneficios</h4>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Garantía de 1 año</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span>Envío gratis a domicilio</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-600" />
                    <span>Producto premium</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Cantidad y Botones */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Cantidad</label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 p-0"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    
                    <span className="w-12 text-center font-medium text-lg">
                      {quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-10 w-10 p-0"
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    
                    <span className="text-sm text-muted-foreground ml-2">
                      ({product.stock} disponibles)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleAddToCart}
                    className="w-full gradient-orange hover:opacity-90 transition-opacity h-12"
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {product.stock === 0 ? 'Producto Agotado' : `Agregar al Carrito - $${(product.price * quantity).toLocaleString()}`}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full"
                  >
                    Seguir Viendo Productos
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
