import React, { useState, useMemo, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/contexts/CartContext';
import { Search, Filter, MessageCircle } from 'lucide-react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

interface ProductsSectionProps {
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({ selectedCategory, setSelectedCategory }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar productos reales de Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
      setLoading(false);
    };
    fetchProducts();
  }, []);

  // Cargar categorías de Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "categories"));
      setCategories(["Todos", ...querySnapshot.docs.map(doc => doc.data().name)]);
    };
    fetchCategories();
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'Todos' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Ordenar productos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, sortBy]);

  return (
    <section id="productos" className="py-10 md:py-16 bg-white">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header centrado y organizado */}
        <div className="flex flex-col items-center justify-center mb-8 md:mb-12 w-full">
          <span className="uppercase tracking-widest text-orange-600 font-bold text-sm md:text-base mb-2 text-center">
            Compras Bogotá
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-3 text-center tracking-tight">
            <span className="gradient-text-orange block w-full">Productos</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl text-center">
            Descubre nuestra selección de productos de alta calidad con los mejores precios del mercado.
          </p>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar productos..."
              className="pl-10 border-orange-200 focus:border-orange-400 focus:ring-orange-400 text-gray-900 placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtro por categoría */}
        
          {/* Ordenar */}
          
        </div>

        {/* Botón de WhatsApp y aviso de domicilio gratis */}
        <div className="flex flex-col items-center mb-8">
          <a
            href="https://wa.me/573186218792?text=¡Hola!%20Quiero%20hacer%20un%20pedido%20en%20TiendaUltra"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold text-lg shadow-lg transition-all mb-2"
            style={{ minWidth: 260, justifyContent: 'center' }}
          >
            <MessageCircle className="h-6 w-6" />
            Pedir por WhatsApp
          </a>
          <span className="text-base text-green-700 font-semibold mt-1 text-center">
            ¡Domicilio gratis en compras superiores a $60,000!
          </span>
        </div>

        {/* Grid de productos */}
        {loading ? (
          <div className="text-center py-12 text-lg text-muted-foreground">Cargando productos...</div>
        ) : filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={setSelectedProduct}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">No se encontraron productos</h3>
            <p className="text-gray-600 mb-4">
              Intenta cambiar los filtros o términos de búsqueda
            </p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('Todos');
                setSortBy('name');
              }}
              variant="outline"
              className="border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              Limpiar Filtros
            </Button>
          </div>
        )}

        {/* Modal de detalles */}
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      </div>
    </section>
  );
};
