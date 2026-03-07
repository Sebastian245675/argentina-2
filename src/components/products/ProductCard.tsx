import React, { useState, useMemo, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Product } from '@/contexts/CartContext';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Sparkles } from 'lucide-react';

// Utilidad para crear slugs SEO-friendly
function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product);
    toast({
      title: "Agregado",
      description: `${product.name} se agregó al carrito`,
      duration: 2000,
    });
  };

  const handleViewDetails = () => {
    const slug = slugify(product.name);
    navigate(`/producto/${slug}`);
  };

  // Discount Calculation
  const discountPercentage = useMemo(() => {
    if (product.originalPrice && product.price && product.originalPrice > product.price) {
      return Math.round((1 - (product.price / product.originalPrice)) * 100);
    }
    return product.discount || 0;
  }, [product]);

  return (
    <div
      className="group flex flex-col cursor-pointer h-full bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-300 hover:border-gray-400 hover:-translate-y-1"
      onClick={handleViewDetails}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-[3/4] flex items-center justify-center border-b-2 border-gray-300">
        {/* Discount Badge - Modern Design */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl ring-2 ring-white/50">
            <Sparkles className="w-3 h-3" />
            <span>{discountPercentage}% OFF</span>
          </div>
        )}

        {/* Loading Skeleton */}
        {imageLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        )}

        {/* Product Image */}
        <img
          src={(product.image?.includes('unsplash.com')
            ? `${product.image}&auto=format&fit=crop&w=500&q=60`
            : product.image)?.replace('http://', 'https://')}
          alt={product.name}
          width="400"
          height="533"
          loading="lazy"
          className={`object-cover h-full w-full transition-all duration-500 group-hover:scale-110 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setImageLoading(false)}
        />

        {/* Overlay Gradient on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Action Buttons on Hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-white text-gray-900 hover:bg-gray-50 px-4 py-3 text-xs font-bold uppercase tracking-wider rounded-lg shadow-xl border-2 border-gray-300 hover:border-gray-400 min-h-[44px]"
            onClick={handleAddToCart}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Agregar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-white/95 backdrop-blur-sm text-gray-900 hover:bg-white px-4 py-3 text-xs font-bold rounded-lg shadow-xl border-2 border-gray-300 hover:border-gray-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={`Ver detalles de ${product.name}`}
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow p-5 bg-white">
        {/* Product Name */}
        <h3 className="font-semibold text-base text-gray-900 mb-3 group-hover:text-black line-clamp-2 leading-snug transition-colors duration-200 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Price Section */}
        <div className="mt-auto flex flex-col items-start gap-1.5 pt-3 border-t-2 border-gray-300">
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 font-medium line-through">
                ${product.originalPrice.toLocaleString('es-AR')}
              </span>
              {discountPercentage > 0 && (
                <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                  -{discountPercentage}%
                </span>
              )}
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-gray-900">
              ${product.price ? product.price.toLocaleString('es-AR') : 'Consultar'}
            </span>
            {product.price && (
              <span className="text-xs text-gray-800 font-bold bg-gray-200 px-2 py-0.5 rounded">ARS</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductCard = memo(ProductCardComponent, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id;
});
