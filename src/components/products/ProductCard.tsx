import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/contexts/CartContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { ShoppingCart, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "¡Producto agregado!",
      description: `${product.name} se agregó a tu carrito`,
    });
  };

  return (
    <Card className="group overflow-hidden hover-lift hover-glow transition-all duration-300">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge 
          className="absolute top-3 right-3 bg-white/90 text-foreground border-0"
        >
          {product.category}
        </Badge>
        {product.stock < 5 && (
          <Badge 
            variant="destructive"
            className="absolute top-3 left-3"
          >
            ¡Últimas unidades!
          </Badge>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold gradient-text-orange">
            ${product.price.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">
            Stock: {product.stock}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-2 pt-0 flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 min-w-0"
          onClick={() => onViewDetails(product)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Ver
        </Button>
        <Button
          className="px-2 py-1 text-[11px] sm:px-3 sm:py-2 sm:text-sm rounded font-semibold bg-orange-500 hover:bg-orange-600 transition-colors min-w-0"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-1" />
          {product.stock === 0 ? 'Agotado' : 'Agregar'}
        </Button>
      </CardFooter>
    </Card>
  );
};
