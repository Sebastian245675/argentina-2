import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/firebase';
import { AdvancedHeader } from '@/components/layout/AdvancedHeader';
import { TopPromoBar } from '@/components/layout/TopPromoBar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProductCard } from '@/components/products/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/hooks/use-toast';
import { recordProductView } from '@/lib/product-analytics';
import { useAuth } from '@/contexts/AuthContext';

import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ShoppingCart,
  Plus,
  Minus,
  Star,
  Shield,
  Truck,
  Share2,
  ArrowLeft,
  MapPin,
  Mail
} from 'lucide-react';

import { Product } from '@/contexts/CartContext';

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


// Carrusel de productos similares con estilo Mercado Libre
type SimilarProductsCarouselProps = {
  products: Product[];
  onViewDetails: (prod: Product) => void;
};

const SimilarProductsCarousel = (props: SimilarProductsCarouselProps) => {
  const { products, onViewDetails } = props;
  const [start, setStart] = React.useState(0);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  
  // Ajuste responsivo para mostrar diferentes cantidades según el ancho
  const [maxVisible, setMaxVisible] = React.useState(5);
  
  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1536) {
        setMaxVisible(6);
      } else if (width >= 1280) {
        setMaxVisible(5);
      } else if (width >= 1024) {
        setMaxVisible(4);
      } else if (width >= 768) {
        setMaxVisible(3);
      } else {
        setMaxVisible(2);
      }
    };
    
    handleResize(); // Inicializar
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const canPrev = start > 0;
  const canNext = start + maxVisible < products.length;

  const handlePrev = () => {
    if (canPrev) setStart(Math.max(0, start - maxVisible));
  };
  
  const handleNext = () => {
    if (canNext) setStart(Math.min(products.length - maxVisible, start + maxVisible));
  };

  return (
    <div className="relative w-full py-2">
      {/* Navegación */}
      <div className="flex items-center">
        {/* Botón anterior */}
        <button
          onClick={handlePrev}
          disabled={!canPrev}
          className={`absolute left-0 z-10 rounded-full w-10 h-10 flex items-center justify-center border border-gray-200 bg-white shadow-lg transition-all ${
            !canPrev ? 'opacity-0 cursor-default' : 'opacity-95 hover:opacity-100 hover:border-blue-300 hover:text-blue-500'
          }`}
          style={{ transform: 'translateX(-50%)' }}
          aria-label="Anterior"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        
        {/* Productos en el carrusel */}
        <div className="flex gap-4 overflow-hidden w-full mx-4">
          {products.slice(start, start + maxVisible).map((prod, index) => (
            <div 
              key={prod.id} 
              className="w-full flex-shrink-0 transition-all"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div 
                onClick={() => onViewDetails(prod)}
                className={`bg-white rounded-lg overflow-hidden border ${
                  hoveredIndex === index 
                    ? 'border-blue-300 shadow-md' 
                    : 'border-gray-200'
                } cursor-pointer transition-all h-full flex flex-col`}
              >
                {/* Imagen del producto */}
                <div className="pt-2 px-2 bg-white flex items-center justify-center h-48 relative">
                  <img 
                    src={prod.image} 
                    alt={prod.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-300"
                    style={{
                      transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)'
                    }}
                  />
                  
                  {/* Badge de oferta */}
                  {prod.isOffer && prod.originalPrice && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {Math.round((1 - (prod.price / prod.originalPrice)) * 100)}% OFF
                    </span>
                  )}
                </div>
                
                {/* Información del producto */}
                <div className="p-4 flex-1 flex flex-col border-t border-gray-100">
                  {/* Nombre del producto con clamp para 2 líneas */}
                  <h3 className="text-sm text-gray-700 line-clamp-2 mb-2 h-10">{prod.name}</h3>
                  
                  {/* Precio y descuento */}
                  <div className="mt-auto">
                    <p className="text-lg font-semibold text-gray-900">${prod.price.toLocaleString()}</p>
                    {prod.isOffer && prod.originalPrice && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs line-through text-gray-500">${prod.originalPrice.toLocaleString()}</span>
                      </div>
                    )}
                    
                    {/* Envío gratis (simulado) */}
                    {prod.price > 100 && (
                      <p className="text-xs font-medium text-green-600 mt-1">Envío gratis</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Botón siguiente */}
        <button
          onClick={handleNext}
          disabled={!canNext}
          className={`absolute right-0 z-10 rounded-full w-10 h-10 flex items-center justify-center border border-gray-200 bg-white shadow-lg transition-all ${
            !canNext ? 'opacity-0 cursor-default' : 'opacity-95 hover:opacity-100 hover:border-blue-300 hover:text-blue-500'
          }`}
          style={{ transform: 'translateX(50%)' }}
          aria-label="Siguiente"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>
      
      {/* Botón "Ver todos" */}
      {products.length > maxVisible && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => window.location.href = '/?category=' + encodeURIComponent(products[0].category || '')}
            className="px-5 py-2 rounded-lg bg-white border border-blue-500 text-blue-600 font-medium hover:bg-blue-50 transition-colors flex items-center gap-2 text-sm"
          >
            Ver todos los productos similares
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};


// Permite URLs tipo /producto/:productId-:slug
const ProductDetailPage = () => {
  const { productId: param } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewRecorded, setViewRecorded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeImageUrl, setActiveImageUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'descripcion' | 'especificaciones'>('descripcion');
  const [selectedColor, setSelectedColor] = useState<{name: string, hexCode: string, image: string} | null>(null);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);

  // Extraer productId y slug de la URL
  let productId = param;
  let urlSlug = '';
  if (param && param.includes('-')) {
    const lastDash = param.lastIndexOf('-');
    productId = param.substring(0, lastDash);
    urlSlug = param.substring(lastDash + 1);
  }

  // Agregar URL canónica para SEO y redirigir si el slug no coincide
  useEffect(() => {
    if (!product) return;
    const canonicalSlug = slugify(product.name);
    const canonicalUrl = `${window.location.origin}/producto/${product.id}-${canonicalSlug}`;

    // Redirigir si el slug de la URL no coincide
    if (urlSlug && urlSlug !== canonicalSlug) {
      navigate(`/producto/${product.id}-${canonicalSlug}`, { replace: true });
      return;
    }

    // Eliminar cualquier enlace canónico existente
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }
    // Crear y agregar el nuevo enlace canónico
    const link = document.createElement('link');
    link.rel = 'canonical';
    link.href = canonicalUrl;
    document.head.appendChild(link);
    // Limpiar al desmontar
    return () => {
      const canonicalToRemove = document.querySelector('link[rel="canonical"]');
      if (canonicalToRemove) {
        canonicalToRemove.remove();
      }
    };
  }, [product, urlSlug, navigate]);

  // Actualizar título de página para SEO cuando carga el producto
  useEffect(() => {
    if (product) {
      document.title = `${product.name} | REGALA ALGO`;
      // Agregar metadatos para SEO
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', product.description || 'Detalles del producto en REGALA ALGO');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = product.description || 'Detalles del producto en REGALA ALGO';
        document.head.appendChild(meta);
      }
    } else {
      document.title = 'Producto | REGALA ALGO';
    }
  }, [product]);

  // Cargar datos del producto
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const productDoc = await getDoc(doc(db, "products", productId));
        if (productDoc.exists()) {
          const productData = { id: productDoc.id, ...productDoc.data() } as Product;
          setProduct(productData);
          // Set the main image as active
          setActiveImageUrl(productData.image);
          setActiveImageIndex(0);
          
          // If product has colors, set the first color as default
          if (productData.colors && productData.colors.length > 0) {
            setSelectedColor(productData.colors[0]);
          }
          // Registrar vista
          if (!viewRecorded) {
            await recordProductView(productData.id, productData.name, user?.id);
            setViewRecorded(true);
          }
          // Cargar productos similares por categoría (como en la primera vista)
          try {
            let similarItems: Product[] = [];
            if (productData.category) {
              const categoryNorm = productData.category.trim().toLowerCase();
              const allQuery = query(
                collection(db, "products"),
                where("category", "==", productData.category),
                where("id", "!=", productId),
                limit(30)
              );
              const allDocs = await getDocs(allQuery);
              similarItems = allDocs.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter((prod: any) =>
                  prod.category &&
                  typeof prod.category === 'string' &&
                  prod.category.trim().toLowerCase() === categoryNorm
                ) as Product[];
              similarItems = similarItems.slice(0, 8);
            }
            setSimilarProducts(similarItems);
          } catch (error) {
            console.error("Error al cargar productos similares:", error);
            // Intentar cargar al menos algunos productos aleatorios en caso de error
            try {
              const fallbackQuery = query(
                collection(db, "products"),
                limit(4)
              );
              const fallbackDocs = await getDocs(fallbackQuery);
              const fallbackItems = fallbackDocs.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              })) as Product[];
              setSimilarProducts(fallbackItems);
            } catch (fallbackError) {
              console.error("Error en la carga de respaldo:", fallbackError);
            }
          }
        } else {
          // Producto no encontrado
          toast({
            title: "Producto no encontrado",
            description: "El producto que buscas no existe o ha sido eliminado",
            variant: "destructive"
          });
          navigate('/');
        }
      } catch (error) {
        console.error("Error al cargar el producto:", error);
        setError("No se pudo cargar el producto. Por favor, inténtalo de nuevo más tarde.");
        toast({
          title: "Error",
          description: "No se pudo cargar el producto",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, user?.id]);

  // Cargar categorías
  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const cats = ["Todos", ...querySnapshot.docs.map(doc => doc.data().name)];
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  // Manejadores
  const handleAddToCart = () => {
    if (product) {
      // Pass the selected color if available
      addToCart(product, quantity, selectedColor);
      
      const colorInfo = selectedColor ? ` (color: ${selectedColor.name})` : '';
      toast({
        title: "¡Producto agregado!",
        description: `${quantity}x ${product.name}${colorInfo} agregado a tu carrito`,
      });
    }
  };

  // Navegación avanzada con slug
  const goToProduct = (prod: Product) => {
    navigate(`/producto/${prod.id}-${slugify(prod.name)}`);
  };

  const incrementQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name || 'Producto REGALA ALGO',
        text: product?.description || 'Mira este producto',
        url: window.location.href
      })
      .catch(error => console.log('Error al compartir', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Enlace copiado",
        description: "El enlace al producto ha sido copiado al portapapeles",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* TopPromoBar eliminada de esta vista */}
        <AdvancedHeader 
          selectedCategory="" 
          setSelectedCategory={(cat) => navigate('/?category=' + encodeURIComponent(cat))}
          categories={categories}
          setCategories={setCategories}
        />
        <div className="container mx-auto px-4 pt-32 pb-16 md:pt-40 md:pb-24 flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Cargando producto</h2>
            <p className="text-gray-500">Estamos obteniendo toda la información para ti...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* TopPromoBar eliminada de esta vista */}
        <AdvancedHeader 
          selectedCategory="" 
          setSelectedCategory={(cat) => navigate('/?category=' + encodeURIComponent(cat))}
          categories={categories}
          setCategories={setCategories}
        />
        <div className="container mx-auto px-4 pt-32 pb-16 md:pt-40 md:pb-24 flex items-center justify-center min-h-[70vh]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Error al cargar el producto</h2>
            <p className="text-gray-700 mb-4">{error}</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Volver a la tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* TopPromoBar eliminada de esta vista */}
        <AdvancedHeader 
          selectedCategory="" 
          setSelectedCategory={(cat) => navigate('/?category=' + encodeURIComponent(cat))}
          categories={categories}
          setCategories={setCategories}
        />
        <div className="container mx-auto px-4 py-28 md:py-32 text-center min-h-[70vh] flex flex-col items-center justify-center">
          <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-md border border-gray-100">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Producto no encontrado</h1>
            <p className="mb-6 text-gray-600">El producto que estás buscando no existe o ha sido eliminado.</p>
            <Button onClick={() => navigate('/')} className="bg-orange-600 hover:bg-orange-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la tienda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* TopPromoBar eliminada de esta vista */}
      <AdvancedHeader 
        selectedCategory={product?.category || ""} 
        setSelectedCategory={(cat) => {
          navigate('/?category=' + encodeURIComponent(cat));
        }} 
        categories={categories}
        setCategories={setCategories}
      />
      
      <main className="w-full px-0 sm:px-4 pt-24 pb-16 md:pt-32 md:pb-24">
        {/* Navegación con breadcrumbs */}
        <div className="flex flex-wrap items-center mb-8 md:mb-12 text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 sm:p-4 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto font-normal hover:bg-transparent hover:text-orange-600"
            onClick={() => navigate('/')}
          >
            Inicio
          </Button>
          <span className="mx-1 sm:mx-2">/</span>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto font-normal hover:bg-transparent hover:text-orange-600 max-w-[120px] sm:max-w-none truncate"
            onClick={() => navigate('/?category=' + encodeURIComponent(product.category))}
          >
            {product.category}
          </Button>
          <span className="mx-1 sm:mx-2">/</span>
          <span className="text-gray-900 font-medium truncate max-w-[150px] sm:max-w-[300px]">{product.name}</span>
        </div>
        
        {/* Detalles del producto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 mb-16">
          {/* Columna izquierda: galería y productos similares en desktop */}
          <div className="space-y-4 flex flex-col">
            {/* Imagen principal con zoom efecto */}
            <div className="relative rounded-xl overflow-hidden shadow-xl bg-white p-4 border border-gray-100 group">
              <div className="overflow-hidden rounded-lg bg-white flex items-center justify-center">
                <img 
                  src={activeImageUrl || product.image}
                  alt={product.name}
                  className="w-full transition-transform duration-500 group-hover:scale-105"
                  style={{
                    height: "480px",
                    maxHeight: "480px",
                    objectFit: "contain",
                    objectPosition: "center",
                    padding: "10px"
                  }}
                />
              </div>
              
              {/* Image Gallery Navigation - Always show if there's at least one image */}
              <div className="absolute top-1/2 left-0 right-0 flex justify-between px-3 transform -translate-y-1/2">
                <button 
                  onClick={() => {
                    const allImages = [product.image, ...(product.additionalImages || []).filter(img => img)];
                    if (allImages.length <= 1) return;
                    const newIndex = (activeImageIndex - 1 + allImages.length) % allImages.length;
                    setActiveImageIndex(newIndex);
                    setActiveImageUrl(allImages[newIndex]);
                  }}
                  className={`rounded-full bg-white hover:bg-gray-100 p-2 shadow-lg border border-gray-200 text-gray-700 hover:text-orange-500 transition-all ${
                    (!product.additionalImages || product.additionalImages.filter(img => img).length === 0) 
                      ? 'opacity-30 cursor-not-allowed' 
                      : 'opacity-90 hover:opacity-100'
                  }`}
                  aria-label="Previous image"
                  disabled={!product.additionalImages || product.additionalImages.filter(img => img).length === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                </button>
                <button 
                  onClick={() => {
                    const allImages = [product.image, ...(product.additionalImages || []).filter(img => img)];
                    if (allImages.length <= 1) return;
                    const newIndex = (activeImageIndex + 1) % allImages.length;
                    setActiveImageIndex(newIndex);
                    setActiveImageUrl(allImages[newIndex]);
                  }}
                  className={`rounded-full bg-white hover:bg-gray-100 p-2 shadow-lg border border-gray-200 text-gray-700 hover:text-orange-500 transition-all ${
                    (!product.additionalImages || product.additionalImages.filter(img => img).length === 0) 
                      ? 'opacity-30 cursor-not-allowed' 
                      : 'opacity-90 hover:opacity-100'
                  }`}
                  aria-label="Next image"
                  disabled={!product.additionalImages || product.additionalImages.filter(img => img).length === 0}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </div>
              <Badge 
                className="absolute top-6 right-6 bg-white/90 text-foreground border-0 shadow-md px-3 py-1.5 text-sm"
              >
                {product.category}
              </Badge>
              {product.stock < 5 && (
                <Badge 
                  variant="destructive"
                  className="absolute top-6 left-6 shadow-md px-3 py-1.5 text-sm"
                >
                  ¡Últimas {product.stock} unidades!
                </Badge>
              )}
              {product.isOffer && (
                <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500 to-orange-600 rotate-45 transform origin-bottom-left shadow-lg">
                    <span className="absolute bottom-0 left-6 text-sm font-extrabold text-white transform -rotate-45">
                      OFERTA
                    </span>
                  </div>
                </div>
              )}
            </div>
            {/* Miniaturas */}
            <div className="flex gap-3 justify-center mt-4 overflow-x-auto px-2 pb-2">
              <button 
                onClick={() => {
                  setActiveImageUrl(product.image);
                  setActiveImageIndex(0);
                }}
                className={`flex-shrink-0 rounded-lg overflow-hidden bg-white ${
                  activeImageIndex === 0 
                    ? 'border-2 border-orange-500 ring-2 ring-orange-200' 
                    : 'border border-gray-200 hover:border-orange-300'
                }`}
                style={{ width: '80px', height: '80px' }}
              >
                <div className="w-full h-full flex items-center justify-center p-1">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="max-h-full max-w-full object-contain" 
                  />
                </div>
              </button>
              
              {product.additionalImages && product.additionalImages.map((img, i) => (
                img ? (
                  <button 
                    key={i}
                    onClick={() => {
                      setActiveImageUrl(img);
                      setActiveImageIndex(i + 1);
                    }}
                    className={`flex-shrink-0 rounded-lg overflow-hidden bg-white ${
                      activeImageIndex === i + 1 
                        ? 'border-2 border-orange-500 ring-2 ring-orange-200' 
                        : 'border border-gray-200 hover:border-orange-300'
                    }`}
                    style={{ width: '80px', height: '80px' }}
                  >
                    <div className="w-full h-full flex items-center justify-center p-1">
                      <img 
                        src={img} 
                        alt={`${product.name} vista ${i+1}`} 
                        className="max-h-full max-w-full object-contain" 
                      />
                    </div>
                  </button>
                ) : null
              ))}
              
              {(!product.additionalImages || product.additionalImages.filter(img => img).length === 0) && [...Array(3)].map((_, i) => (
                <button 
                  key={i} 
                  className="flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 hover:border-orange-300 transition-colors bg-white opacity-60"
                  style={{ width: '80px', height: '80px' }}
                >
                  <div className="w-full h-full flex items-center justify-center p-1">
                    <img 
                      src={product.image} 
                      alt={`${product.name} vista ${i+1}`} 
                      className="max-h-full max-w-full object-contain" 
                    />
                  </div>
                </button>
              ))}
            </div>
            {/* Productos similares solo en desktop (lg+) */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-xl p-5 mt-8 border border-gray-200 shadow-2xl">
                <div className="border-b pb-3 mb-4">
                  <span className="text-orange-600 font-medium text-xs block">TAMBIÉN TE PUEDE GUSTAR</span>
                  <h2 className="text-lg font-bold text-gray-800">Productos similares</h2>
                </div>
                {similarProducts && similarProducts.length > 0 ? (
                  <div className="flex gap-6 justify-center">
                    {similarProducts.slice(0, 4).map((similar) => (
                      <div
                        key={similar.id}
                        onClick={() => goToProduct(similar)}
                        className="w-56 h-56 bg-gradient-to-br from-orange-50 via-white to-orange-100 border border-orange-200 rounded-2xl shadow-2xl flex flex-col items-center justify-between cursor-pointer hover:shadow-orange-400 hover:-translate-y-1 hover:brightness-105 transition-all duration-200 group relative overflow-hidden"
                      >
                        {/* Imagen grande con icono carrito */}
                        <div className="w-full h-32 flex items-center justify-center bg-white rounded-t-2xl border-b border-gray-100 group-hover:bg-orange-50 transition-all relative">
                          <img
                            src={similar.image}
                            alt={similar.name}
                            className="max-h-28 max-w-full object-contain transition-transform duration-200 group-hover:scale-110 drop-shadow-lg"
                          />
                          <span className="absolute top-2 left-2 bg-orange-500 text-white rounded-full p-1 shadow-lg">
                            <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' viewBox='0 0 24 24'><circle cx='9' cy='21' r='1'/><circle cx='20' cy='21' r='1'/><path d='M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61l1.38-7.39H6'/></svg>
                          </span>
                        </div>
                        {/* Nombre y precio */}
                        <div className="flex-1 flex flex-col justify-center items-center px-3 py-2 w-full">
                          <h3 className="text-sm font-bold text-gray-800 text-center line-clamp-2 mb-1">{similar.name}</h3>
                          <p className="text-lg font-extrabold text-orange-600 mb-1">${similar.price.toLocaleString()}</p>
                          {similar.originalPrice && similar.isOffer && (
                            <span className="text-xs text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded-full">{Math.round((1 - (similar.price / similar.originalPrice)) * 100)}% OFF</span>
                          )}
                          {/* Badge cuotas */}
                          <span className="text-[11px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full mt-1 font-semibold">12x sin interés</span>
                        </div>
                        {/* Botón ver más */}
                        <div className="w-full py-2 text-center border-t border-gray-100 bg-white group-hover:bg-orange-50 transition-all">
                          <span className="text-xs text-orange-500 font-semibold">Ver producto</span>
                        </div>
                        {/* Sombra decorativa y animación brillo */}
                        <span className="absolute left-0 bottom-0 w-full h-2 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200 opacity-20"></span>
                        <span className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white via-orange-100 to-white opacity-40 animate-pulse"></span>
                      </div>
                    ))}
                  </div>
                  ) : (
                  <div className="py-4 text-center">
                    <div className="mx-auto mb-2 bg-orange-100 text-orange-500 w-12 h-12 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"></line>
                      </svg>
                    </div>
                    <h3 className="text-base font-semibold mb-1">No hay productos similares</h3>
                    <p className="text-gray-500 text-sm mb-3">Pronto tendremos más productos en <b>{product.category}</b></p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-orange-300 text-orange-600 hover:bg-orange-50"
                      onClick={() => navigate('/')}
                    >
                      Ver catálogo
                    </Button>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 border-orange-300 text-orange-600 hover:text-orange-700 hover:bg-orange-50 w-full"
                  onClick={() => navigate('/?category=' + encodeURIComponent(product.category || ''))}
                >
                  Ver todos <span className="ml-1">→</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Info del producto */}
          <div className="bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
            {/* Encabezado con marca y código */}
            <div className="flex items-center justify-between mb-2">
              <span className="bg-orange-100 text-orange-800 text-xs px-3 py-1 rounded-full font-medium">
                REGALA ALGO
              </span>
              <span className="text-xs text-gray-500">
                Código: {product.id?.substring(0, 8) || 'FS-' + Math.floor(Math.random() * 10000)}
              </span>
            </div>
            
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">(128 reseñas)</span>
                {/* <Button variant="link" className="text-xs sm:text-sm p-0 h-auto text-orange-600">Ver reseñas</Button> */}
              </div>
            </div>
            
            {/* Precio con badge de descuento */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500">
                  ${product.price.toLocaleString()}
                </span>
                {(product.discount || product.isOffer) && product.originalPrice && (
                  <>
                    <span className="text-base sm:text-lg text-gray-500 line-through">
                      ${product.originalPrice.toLocaleString()}
                    </span>
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">
                      {Math.round((1 - (product.price / (product.originalPrice || product.price + 1000))) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Precio incluye impuestos • Envío calculado al finalizar la compra
              </p>
            </div>
            
            <Separator />
            
            {/* Descripción con tabs */}
            <div className="rounded-lg border overflow-hidden">
              <div className="flex text-sm border-b">
                <button 
                  onClick={() => setActiveTab('descripcion')}
                  className={`px-4 py-2 font-medium flex-1 sm:flex-none transition-colors ${
                    activeTab === 'descripcion' 
                      ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-500' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Descripción
                </button>
                <button 
                  onClick={() => setActiveTab('especificaciones')}
                  className={`px-4 py-2 font-medium flex-1 sm:flex-none transition-colors ${
                    activeTab === 'especificaciones' 
                      ? 'bg-orange-50 text-orange-700 border-b-2 border-orange-500' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Especificaciones
                </button>
                {/* <button className="px-4 py-2 text-gray-600 hover:text-gray-800 hidden sm:block">Reseñas</button> */}
                {/* <button className="px-4 py-2 text-gray-600 hover:text-gray-800 hidden md:block">Preguntas</button> */}
              </div>
              
              {/* Tab content */}
              <div className="p-4 bg-white">
                {activeTab === 'descripcion' ? (
                  <div>
                    <p className="text-gray-700 leading-relaxed">{product.description}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h4 className="font-medium text-base">Especificaciones del producto</h4>
                    {product.specifications && product.specifications.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-3">
                        {product.specifications.map((spec, index) => (
                          <div key={index} className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{spec.name}</span>
                            <span className="text-sm text-gray-600">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm pl-2">
                        <li>Material de alta calidad</li>
                        <li>Ideal para uso diario</li>
                        <li>Perfecto para regalo</li>
                        <li>Fabricado con estándares internacionales</li>
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Beneficios y garantías */}
            <div className="bg-slate-50 rounded-lg p-5">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span>Beneficios y Garantías</span>
              </h4>
              <div className="grid sm:grid-cols-2 gap-4">
                {product.benefits && product.benefits.length > 0 ? (
                  // Mostrar beneficios guardados en el producto
                  product.benefits.map((benefit, index) => (
                    <div key={`benefit-${index}`} className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium block text-sm">{benefit}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  // Beneficios predeterminados si no hay guardados
                  <>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                      <div className="bg-green-100 p-2 rounded-full">
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <span className="font-medium block text-sm">Garantía de calidad</span>
                        <span className="text-xs text-gray-500">Satisfacción garantizada</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Truck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <span className="font-medium block text-sm">Envío gratis</span>
                        <span className="text-xs text-gray-500">En compras mayores a $50.000</span>
                      </div>
                    </div>
                  </>
                )}

                {product.warranties && product.warranties.length > 0 ? (
                  // Mostrar garantías guardadas en el producto
                  product.warranties.map((warranty, index) => (
                    <div key={`warranty-${index}`} className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                      <div className="bg-emerald-100 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium block text-sm">{warranty}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <Star className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <span className="font-medium block text-sm">Producto premium</span>
                        <span className="text-xs text-gray-500">Calidad garantizada</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium block text-sm">Retiro en tienda</span>
                        <span className="text-xs text-gray-500">En nuestras sucursales</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <Separator />
            
            {/* Estado de disponibilidad */}
            <div className="flex items-center bg-gray-50 p-3 rounded-lg">
              {product.stock > 10 ? (
                <>
                  <div className="h-3 w-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <p className="text-sm font-medium text-gray-700">En stock - Disponibilidad inmediata</p>
                </>
              ) : product.stock > 0 ? (
                <>
                  <div className="h-3 w-3 bg-amber-500 rounded-full mr-2 animate-pulse"></div>
                  <p className="text-sm font-medium text-gray-700">¡Últimas unidades disponibles!</p>
                </>
              ) : (
                <>
                  <div className="h-3 w-3 bg-red-500 rounded-full mr-2"></div>
                  <p className="text-sm font-medium text-gray-700">Agotado - Disponible bajo pedido</p>
                </>
              )}
            </div>
            
            {/* Cantidad y Botones */}
            <div className="space-y-5">
              {/* Selector de color si el producto tiene colores */}
              {product.colors && product.colors.length > 0 && (
                <div className="bg-white rounded-lg border p-4">
                  <label className="text-sm font-medium mb-3 block">
                    Color: <span className="text-orange-600 font-semibold">{selectedColor?.name || 'Selecciona un color'}</span>
                  </label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedColor(color);
                          // Si hay una imagen para este color, mostrarla como imagen principal
                          if (color.image) {
                            setActiveImageUrl(color.image);
                            // Establecer el índice correcto si la imagen coincide con alguna adicional
                            if (color.image === product.image) {
                              setActiveImageIndex(0);
                            } else if (product.additionalImages) {
                              const imgIndex = product.additionalImages.findIndex(img => img === color.image);
                              if (imgIndex !== -1) {
                                setActiveImageIndex(imgIndex + 1); // +1 porque la imagen principal es índice 0
                              }
                            }
                          }
                        }}
                        className={`relative p-1 rounded-full flex items-center justify-center transition-all ${
                          selectedColor?.name === color.name 
                            ? 'ring-2 ring-offset-2 ring-orange-500 transform scale-110' 
                            : 'hover:ring-1 hover:ring-orange-200 hover:ring-offset-1'
                        }`}
                        title={color.name}
                      >
                        {/* Color swatch */}
                        <span 
                          className="block w-8 h-8 rounded-full border"
                          style={{ backgroundColor: color.hexCode }}
                        ></span>
                        
                        {/* Check icon for selected color */}
                        {selectedColor?.name === color.name && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`text-white ${color.hexCode.toLowerCase() === '#ffffff' ? 'text-black' : ''}`}>
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  {/* Miniatura de la imagen del color seleccionado */}
                  {selectedColor?.image && (
                    <div className="mt-3 flex items-center gap-3">
                      <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200">
                        <img 
                          src={selectedColor.image} 
                          alt={`${product.name} - ${selectedColor.name}`} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        Vista previa del color <strong>{selectedColor.name}</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Selector de cantidad */}
              <div className="bg-white rounded-lg border p-4">
                <label className="text-sm font-medium mb-2 flex justify-between">
                  <span>Cantidad</span>
                  <span className="text-orange-600">
                    {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
                  </span>
                </label>
                <div className="flex items-center mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-l-lg rounded-r-none border-r-0"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1 || product.stock === 0}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <div className="h-10 border-y px-4 flex items-center justify-center min-w-[60px]">
                    <span className="font-medium text-lg">{quantity}</span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-r-lg rounded-l-none border-l-0"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock || product.stock === 0}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <Button
                  onClick={handleAddToCart}
                  className="sm:col-span-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 text-white py-6 rounded-xl shadow-lg shadow-orange-100"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stock === 0 
                    ? 'Producto Agotado' 
                    : `Agregar al Carrito - $${(product.price * quantity).toLocaleString()}`
                  }
                </Button>
                
                <Button
                  variant="outline"
                  className="py-6 rounded-xl hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border-2"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5 sm:mr-0 md:mr-2" />
                  <span className="hidden md:inline">Compartir</span>
                </Button>
              </div>
              
              {/* Métodos de pago */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Métodos de pago aceptados:</p>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-white p-1 rounded shadow-sm"><img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v6/icons/visa.svg" alt="Visa" className="w-8 h-5 object-contain" /></div>
                  <div className="bg-white p-1 rounded shadow-sm"><img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v6/icons/mastercard.svg" alt="Mastercard" className="w-8 h-5 object-contain" /></div>
                  <div className="bg-white p-1 rounded shadow-sm"><img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v6/icons/americanexpress.svg" alt="American Express" className="w-8 h-5 object-contain" /></div>
                  <div className="bg-white p-1 rounded shadow-sm"><img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v6/icons/paypal.svg" alt="PayPal" className="w-8 h-5 object-contain" /></div>
                  <div className="bg-white p-1 rounded shadow-sm"><img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v6/icons/mercadopago.svg" alt="Mercado Pago" className="w-8 h-5 object-contain" /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Productos similares - Siempre se muestra, con fallback */}
        <div className="mb-20 bg-white py-12 -mx-4 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
              <div>
                <span className="text-orange-600 font-medium text-sm mb-1 block">PRODUCTOS RELACIONADOS</span>
                <h2 className="text-2xl font-bold text-gray-800">
                  {similarProducts.length > 0 ? 'Productos más vistos' : 'Te podría interesar'}
                </h2>
              </div>
              <Button 
                variant="ghost"
                className="mt-3 sm:mt-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50/50 font-medium"
                onClick={() => navigate('/?category=' + encodeURIComponent(product.category || ''))}
              >
                Ver todos <span className="ml-1">→</span>
              </Button>
            </div>
            
            <div className="relative">
              {similarProducts && similarProducts.length > 0 ? (
                <div className="flex flex-wrap gap-6 justify-center">
                  {similarProducts.slice(0, 8).map((similar) => (
                    <div
                      key={similar.id}
                      onClick={() => goToProduct(similar)}
                      className="w-56 h-56 bg-gradient-to-br from-orange-50 via-white to-orange-100 border border-orange-200 rounded-2xl shadow-2xl flex flex-col items-center justify-between cursor-pointer hover:shadow-orange-400 hover:-translate-y-1 hover:brightness-105 transition-all duration-200 group relative overflow-hidden"
                    >
                      {/* Imagen grande con icono carrito */}
                      <div className="w-full h-32 flex items-center justify-center bg-white rounded-t-2xl border-b border-gray-100 group-hover:bg-orange-50 transition-all relative">
                        <img
                          src={similar.image}
                          alt={similar.name}
                          className="max-h-28 max-w-full object-contain transition-transform duration-200 group-hover:scale-110 drop-shadow-lg"
                        />
                        <span className="absolute top-2 left-2 bg-orange-500 text-white rounded-full p-1 shadow-lg">
                          <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' viewBox='0 0 24 24'><circle cx='9' cy='21' r='1'/><circle cx='20' cy='21' r='1'/><path d='M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61l1.38-7.39H6'/></svg>
                        </span>
                      </div>
                      {/* Nombre y precio */}
                      <div className="flex-1 flex flex-col justify-center items-center px-3 py-2 w-full">
                        <h3 className="text-sm font-bold text-gray-800 text-center line-clamp-2 mb-1">{similar.name}</h3>
                        <p className="text-lg font-extrabold text-orange-600 mb-1">${similar.price.toLocaleString()}</p>
                        {similar.originalPrice && similar.isOffer && (
                          <span className="text-xs text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded-full">{Math.round((1 - (similar.price / similar.originalPrice)) * 100)}% OFF</span>
                        )}
                        {/* Badge cuotas */}
                        <span className="text-[11px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full mt-1 font-semibold">12x sin interés</span>
                      </div>
                      {/* Botón ver más */}
                      <div className="w-full py-2 text-center border-t border-gray-100 bg-white group-hover:bg-orange-50 transition-all">
                        <span className="text-xs text-orange-500 font-semibold">Ver producto</span>
                      </div>
                      {/* Sombra decorativa y animación brillo */}
                      <span className="absolute left-0 bottom-0 w-full h-2 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200 opacity-20"></span>
                      <span className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white via-orange-100 to-white opacity-40 animate-pulse"></span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 px-6 text-center bg-gray-50 rounded-xl border border-gray-100">
                  <div className="mx-auto mb-4 bg-orange-100 text-orange-500 w-16 h-16 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"></line>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No hay productos similares en esta categoría</h3>
                  <p className="text-gray-500 mb-4">Pronto tendremos más productos de <b>{product.category}</b></p>
                  <Button 
                    variant="outline"
                    className="border-orange-400 text-orange-600 hover:bg-orange-50"
                    onClick={() => navigate('/')}
                  >
                    Ver catálogo completo
                  </Button>              </div>
              )}
            </div>
            {/* Fin del carrusel de productos similares */}
          </div>
        </div>
        
        {/* Características destacadas */}
        <div className="my-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10">Características Destacadas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
                    <path d="m9 12 2 2 4-4"></path>
                    <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z"></path>
                    <path d="M22 19H2"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Alta Calidad</h3>
                <p className="text-gray-600 text-sm">
                  Nuestros productos son seleccionados cuidadosamente para garantizar la mejor calidad.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
                    <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path>
                    <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path>
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Garantía Extendida</h3>
                <p className="text-gray-600 text-sm">
                  Todos nuestros productos cuentan con garantía extendida para tu tranquilidad.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 text-center shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
                    <path d="M7 10v12"></path>
                    <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Satisfacción 100%</h3>
                <p className="text-gray-600 text-sm">
                  Si no estás satisfecho con tu compra, te devolvemos el dinero sin preguntas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Preguntas frecuentes */}
      <div className="container mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold mb-6 text-center">Preguntas Frecuentes</h2>
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {[
              { 
                q: '¿Cuál es el tiempo de entrega?', 
                a: 'El tiempo de entrega estándar es de 2 a 5 días hábiles, dependiendo de tu ubicación.' 
              },
              { 
                q: '¿Cómo puedo realizar el seguimiento de mi pedido?', 
                a: 'Una vez que tu pedido sea despachado, recibirás un correo con el número de seguimiento.' 
              },
              { 
                q: '¿Cuál es la política de devoluciones?', 
                a: 'Aceptamos devoluciones dentro de los 30 días posteriores a la compra, siempre que el producto esté en su empaque original.' 
              },
              { 
                q: '¿Este producto tiene garantía?', 
                a: 'Sí, todos nuestros productos cuentan con garantía de 1 año por defectos de fabricación.' 
              }
            ].map((faq, i) => (
              <div key={i} className="bg-white border rounded-lg overflow-hidden">
                <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
                  <h3 className="font-medium">{faq.q}</h3>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </div>
                <div className="px-4 pb-4 text-sm text-gray-600">
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 mb-3">¿Tienes más preguntas?</p>
            <Button className="bg-orange-600 hover:bg-orange-700">
              Contactar Soporte
            </Button>
          </div>
        </div>
      </div>
      
      {/* Newsletter */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 text-white py-12 mb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">¡Suscríbete a nuestro newsletter!</h3>
            <p className="mb-6 opacity-90">Recibe ofertas exclusivas, novedades y descuentos directamente en tu correo.</p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Tu correo electrónico" 
                className="px-4 py-2 rounded-lg flex-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <Button className="bg-white text-orange-600 hover:bg-gray-100">
                Suscribirse
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4 text-orange-400">REGALA ALGO</h3>
              <p className="text-gray-400 text-sm">
                La mejor tienda online para encontrar productos exclusivos y de alta calidad. Desde 2020 brindando la mejor experiencia de compra con envíos rápidos y atención personalizada.
              </p>
              <div className="flex gap-4 pt-2">
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-orange-600 transition-colors">
                  <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v6/icons/facebook.svg" alt="Facebook" className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-orange-600 transition-colors">
                  <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v6/icons/twitter.svg" alt="Twitter" className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-orange-600 transition-colors">
                  <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v6/icons/instagram.svg" alt="Instagram" className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="bg-gray-800 p-2 rounded-full hover:bg-orange-600 transition-colors">
                  <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v6/icons/youtube.svg" alt="YouTube" className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces rápidos</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-orange-400" onClick={() => navigate('/')}>Inicio</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-orange-400" onClick={() => navigate('/')}>Categorías</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-orange-400" onClick={() => navigate('/')}>Ofertas</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-orange-400" onClick={() => navigate('/')}>Blog</Button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Ayuda</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-orange-400">Preguntas Frecuentes</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-orange-400">Política de Privacidad</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-orange-400">Términos y Condiciones</Button></li>
                <li><Button variant="link" className="p-0 h-auto text-gray-400 hover:text-orange-400">Política de Envío</Button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-800 p-2 rounded">
                    <MapPin className="h-4 w-4 text-orange-400" />
                  </div>
                  <span>Calle Principal #123, Ciudad</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-gray-800 p-2 rounded">
                    <Mail className="h-4 w-4 text-orange-400" />
                  </div>
                  <span>info@regalaalgo.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-gray-800 p-2 rounded">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <span>+57 (300) 123-4567</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} REGALA ALGO. Todos los derechos reservados.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <div className="bg-gray-800 p-1 rounded">
                <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v6/icons/visa.svg" alt="Visa" className="w-10 h-6 object-contain" />
              </div>
              <div className="bg-gray-800 p-1 rounded">
                <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v6/icons/mastercard.svg" alt="Mastercard" className="w-10 h-6 object-contain" />
              </div>
              <div className="bg-gray-800 p-1 rounded">
                <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v6/icons/americanexpress.svg" alt="American Express" className="w-10 h-6 object-contain" />
              </div>
              <div className="bg-gray-800 p-1 rounded">
                <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v6/icons/paypal.svg" alt="PayPal" className="w-10 h-6 object-contain" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetailPage;
