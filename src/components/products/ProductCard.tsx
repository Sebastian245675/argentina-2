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
      className="group flex flex-col cursor-pointer h-full bg-white rounded-2xl overflow-hidden shadow-[0_2px_15px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-700 border border-gray-200 hover:border-gray-300 hover:-translate-y-2"
      onClick={() => onClick?.(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-[#FAFAFA] aspect-[4/5] flex items-center justify-center border-b border-gray-200">
        {/* Discount Badge - Modern Design */}
        {discountPercentage > 0 && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xl ring-2 ring-white/50">
            <Sparkles className="w-3 h-3" />
            <span>{discountPercentage}% OFF</span>
          </div>
        )}

        {/* Loading Skeleton */}
        {imageLoading && product.image && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        )}

        {/* Product Image & Fallback */}
        {product.image ? (
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
            onError={() => setImageLoading(false)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 w-full h-full bg-[#f9f9f9]">
            <Sparkles className="w-6 h-6 mb-3 opacity-40" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium opacity-60">Sin Fotografía</span>
          </div>
        )}

        {/* Overlay en Hover con toque premium */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Action Buttons on Hover Glassmorphism */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-white/80 backdrop-blur-md text-gray-900 hover:bg-black hover:text-white px-4 py-3 text-[10px] font-medium uppercase tracking-[0.2em] rounded-xl shadow-lg border border-white/50 transition-all min-h-[44px]"
            onClick={handleAddToCart}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <ShoppingCart className="w-3 h-3 mr-2" />
            Añadir
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-white/80 backdrop-blur-md text-gray-900 hover:bg-white px-4 py-3 rounded-xl shadow-lg border border-white/50 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
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
      <div className="flex flex-col flex-grow p-6 bg-white shrink-0">
        {/* Product Name */}
        <h3 className="font-serif tracking-wide text-sm text-gray-900 mb-4 group-hover:text-black line-clamp-2 leading-relaxed transition-colors duration-200 min-h-[2.5rem] uppercase">
          {product.name}
        </h3>

        {/* Price Section */}
        <div className="mt-auto flex flex-col items-start gap-1.5 pt-2">
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
            <span className="text-base font-light tracking-widest text-gray-900">
              ${product.price ? product.price.toLocaleString('es-AR') : 'Consultar'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProductCard = memo(ProductCardComponent, (prevProps, nextProps) => {
  return prevProps.product.id === nextProps.product.id;
});
