import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/contexts/CartContext';
import { Search, Filter, MessageCircle, Flame, ChevronDown } from 'lucide-react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/hooks/use-categories';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Category {
  id?: string;
  name: string;
  image?: string;
  parentId?: string;
  parentName?: string;
}

interface ProductsSectionProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  setCategories: (cats: string[]) => void;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  selectedCategory,
  setSelectedCategory,
  setCategories,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [products, setProducts] = useState<Product[]>([]);
  const { categoriesData: categories } = useCategories();
  const [loading, setLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('Todas');
  const [selectedTerceraCategoria, setSelectedTerceraCategoria] = useState<string>('Todas');

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

  // Obtener subcategorías para la categoría seleccionada
  const subcategories = useMemo(() => {
    if (selectedCategory === 'Todos') {
      return [];
    }

    // Obtener la categoría seleccionada por su nombre
    const selectedCategoryObj = categories.find(cat => cat.name === selectedCategory);
    
    // Buscar subcategorías que tienen esta categoría como padre
    // Podemos buscar tanto por name como por id para mayor compatibilidad
    const subCats = categories.filter(cat => 
      (cat.parentName === selectedCategory) || 
      (selectedCategoryObj && cat.parentId === selectedCategoryObj.id)
    );
    
    return [
      { id: "todas", name: "Todas" },
      ...subCats.map(cat => ({ id: cat.id, name: cat.name }))
    ];
  }, [categories, selectedCategory]);

  // Obtener terceras categorías para la subcategoría seleccionada
  const tercerasCategorias = useMemo(() => {
    // Si no hay subcategoría seleccionada o es "Todas", no hay terceras categorías disponibles
    if (selectedSubcategory === 'Todas' || !selectedSubcategory) {
      return [];
    }

    // Obtener el objeto de la subcategoría seleccionada
    const selectedSubcategoryObj = categories.find(cat => cat.name === selectedSubcategory);
    if (!selectedSubcategoryObj) return [];
    
    // Buscar categorías que tienen esta subcategoría como padre
    const terceraCats = categories.filter(cat => 
      cat.parentId === selectedSubcategoryObj.id
    );
    
    return [
      { id: "todas", name: "Todas" },
      ...terceraCats.map(cat => ({ id: cat.id, name: cat.name }))
    ];
  }, [categories, selectedSubcategory]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch =
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const isOferta = product.category?.toLowerCase() === "oferta" || 
                       product.category?.toLowerCase() === "ofertas";

      // Comprueba si coincide con la categoría principal
      let matchesCategory = selectedCategory === 'Todos'
        ? !isOferta // excluye ofertas si es "Todos"
        : (product.category?.toLowerCase() === selectedCategory.toLowerCase() || 
           product.categoryName?.toLowerCase() === selectedCategory.toLowerCase());

      // Si hay una subcategoría seleccionada, filtra por ella
      if (matchesCategory && selectedSubcategory !== 'Todas' && subcategories.length > 0) {
        matchesCategory = product.subcategory === selectedSubcategory || 
                         product.subcategoryName === selectedSubcategory;
        
        // Si hay una tercera categoría seleccionada, filtra por ella
        if (matchesCategory && selectedTerceraCategoria !== 'Todas' && tercerasCategorias.length > 0) {
          // Usamos acceso seguro a las propiedades con operadores de opcional encadenamiento
          matchesCategory = (product.terceraCategoria === selectedTerceraCategoria) || 
                           (product.terceraCategoriaName === selectedTerceraCategoria);
          
          // Si el producto no tiene información de tercera categoría, no coincide
          if (product.terceraCategoria === undefined && product.terceraCategoriaName === undefined) {
            matchesCategory = false;
          }
        }
      }

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
  }, [products, searchTerm, selectedCategory, selectedSubcategory, selectedTerceraCategoria, subcategories, tercerasCategorias, sortBy]);

  const ofertas = useMemo(
    () => products.filter((p) => {
      // Verificar si hay categoría asignada
      if (!p.category) return false;
      
      // Verificar categoría "oferta" o "ofertas" 
      const isOfertaCategory = 
        p.category?.toLowerCase() === "oferta" || 
        p.category?.toLowerCase() === "ofertas";
      
      // Verificar nombre contiene "oferta"
      const hasOfertaInName = p.name?.toLowerCase().includes("oferta");
      
      // También verificar si el producto tiene un campo de descuento o está marcado como oferta
      const isMarkedAsOffer = p.isOffer === true || (p.discount && p.discount > 0);
      
      return isOfertaCategory || hasOfertaInName || isMarkedAsOffer;
    }),
    [products]
  );

  const categoryImages: Record<string, string> = {
    Bebidas: "https://images.unsplash.com/photo-1514361892635-cebb9b6c3e53?auto=format&fit=facearea&w=96&q=80",
    Snacks: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=facearea&w=96&q=80",
    Dulces: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=facearea&w=96&q=80",
    Lácteos: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=facearea&w=96&q=80",
    Panadería: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=facearea&w=96&q=80",
    Despensa: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=facearea&w=96&q=80",
    Aseo: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=facearea&w=96&q=80",
    Combos: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=facearea&w=96&q=80",
    Todos: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=facearea&w=96&q=80"
  };

  return (
    <section id="productos" className="py-10 md:py-16 bg-white">
      <div className="w-full px-2 md:px-4">
        {/* Header centrado y organizado */}
      

        {/* Botón de WhatsApp y aviso de domicilio gratis */}
        

        {/* CategoryBar - Usar una barra de desplazamiento horizontal en móviles */}
        <div className="flex overflow-x-auto pb-4 gap-4 sm:gap-6 md:gap-8 mb-10 md:mb-14 justify-start md:justify-center">
          {categories
            // Filtrar solo categorías principales para el selector principal (sin parentId)
            .filter(cat => cat.name === "Todos" || !cat.parentId)
            .map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  // Resetear la subcategoría cuando se cambia la categoría principal
                  setSelectedSubcategory('Todas');
                }}
                className={`flex-shrink-0 flex flex-row items-center bg-transparent px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 rounded-xl transition-all hover:bg-slate-50 focus:outline-none
                  ${selectedCategory === cat.name ? "ring-2 ring-blue-400" : ""}
                `}
                style={{ minWidth: 120, maxWidth: 260 }}
              >
                <img
                  src={cat.image || "https://via.placeholder.com/80x80?text=?"}
                  alt={cat.name}
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-cover mr-3 sm:mr-4 md:mr-6"
                  loading="lazy"
                  style={{ boxShadow: "none", border: "none", background: "none" }}
                />
                <div className="text-left">
                  <h3 className="text-md md:text-lg font-bold text-slate-900">{cat.name}</h3>
                  <p className="text-xs md:text-sm text-slate-500">
                    {products.filter(p => {
                      if (cat.name === "Todos") return true;
                      
                      // Contar productos que pertenecen directamente a esta categoría
                      // O que pertenecen a alguna de sus subcategorías
                      const directMatch = p.category === cat.name || p.categoryName === cat.name;
                      
                      // También contar productos en subcategorías de esta categoría principal
                      const subCategories = categories.filter(sc => sc.parentId && 
                                                              (sc.parentName === cat.name || sc.parentName === cat.id));
                      const inSubCategory = subCategories.some(sc => 
                        p.subcategory === sc.id || p.subcategoryName === sc.name
                      );
                      
                      return directMatch || inSubCategory;
                    }).length} productos
                  </p>
                </div>
              </button>
            ))}
        </div>

        {/* Search and Sort Section - Mejorada para móviles */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 px-2">
          <div className="w-full md:w-auto mb-4 md:mb-0">
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-auto min-w-[250px]"
            />
          </div>

          {/* Sort Options y Filtro de Subcategorías */}
          <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
            {/* Filtro de subcategorías - solo visible cuando hay una categoría seleccionada */}
            {selectedCategory !== 'Todos' && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-600 font-medium hidden md:inline">Subcategoría:</span>
                {subcategories.length > 1 ? (
                  <Select 
                    value={selectedSubcategory} 
                    onValueChange={(value) => {
                      setSelectedSubcategory(value);
                      setSelectedTerceraCategoria('Todas'); // Reset tercera categoría cuando cambia subcategoría
                    }}
                  >
                    <SelectTrigger className="w-[180px] border-slate-300 focus:border-blue-500 bg-white shadow-sm">
                      <SelectValue placeholder="Todas las subcategorías" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((subcat) => (
                        <SelectItem 
                          key={subcat.id} 
                          value={subcat.name}
                          className="subcategory-button" 
                        >
                          {subcat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-sm text-gray-500">Esta categoría no tiene subcategorías</span>
                )}
              </div>
            )}
            
            {/* Filtro de terceras categorías - solo visible cuando hay una subcategoría seleccionada */}
            {selectedSubcategory !== 'Todas' && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-slate-600 font-medium hidden md:inline">Tercera categoría:</span>
                {tercerasCategorias.length > 1 ? (
                  <Select 
                    value={selectedTerceraCategoria} 
                    onValueChange={(value) => setSelectedTerceraCategoria(value)}
                  >
                    <SelectTrigger className="w-[180px] border-slate-300 focus:border-orange-500 bg-white shadow-sm">
                      <SelectValue placeholder="Todas las terceras categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      {tercerasCategorias.map((terceraCat) => (
                        <SelectItem 
                          key={terceraCat.id} 
                          value={terceraCat.name}
                        >
                          {terceraCat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <span className="text-sm text-gray-500">Esta subcategoría no tiene terceras categorías</span>
                )}
              </div>
            )}
            
            {/* Ordenar por */}
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium hidden md:inline">Ordenar por:</span>
              <Select value={sortBy} onValueChange={value => setSortBy(value)}>
                <SelectTrigger className="w-[180px] border-slate-300 focus:border-blue-500 bg-white shadow-sm">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nombre (A-Z)</SelectItem>
                  <SelectItem value="price-asc">Precio: Menor a Mayor</SelectItem>
                  <SelectItem value="price-desc">Precio: Mayor a Menor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Mostrar filtros activos */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {selectedCategory !== 'Todos' && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 py-1.5 px-3">
              <span className="font-semibold">Categoría:</span> {selectedCategory}
            </Badge>
          )}
          {selectedSubcategory !== 'Todas' && selectedCategory !== 'Todos' && (
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 py-1.5 px-3">
              <span className="font-semibold">Subcategoría:</span> {selectedSubcategory}
            </Badge>
          )}
          {selectedTerceraCategoria !== 'Todas' && selectedSubcategory !== 'Todas' && (
            <Badge variant="secondary" className="bg-orange-50 text-orange-700 py-1.5 px-3">
              <span className="font-semibold">Tercera categoría:</span> {selectedTerceraCategoria}
            </Badge>
          )}
          {(selectedCategory !== 'Todos' || selectedSubcategory !== 'Todas' || selectedTerceraCategoria !== 'Todas') && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-500 hover:text-slate-800"
              onClick={() => {
                setSelectedCategory('Todos');
                setSelectedSubcategory('Todas');
                setSelectedTerceraCategoria('Todas');
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
        
        {/* Product Grid - Optimizado para productos más cuadrados */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-8 mb-16">
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-slate-100 animate-pulse h-[200px] sm:h-[240px] md:h-[320px] rounded-xl shadow-lg w-full mx-auto"></div>
            ))
          ) : filteredAndSortedProducts.length > 0 ? (
            filteredAndSortedProducts.map(product => (
              <div key={product.id} className="w-full mx-auto">
                <ProductCard product={{...product, price: product.price, originalPrice: product.originalPrice}} />
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                <Search className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-700 mb-4">No se encontraron productos</h3>
              <p className="text-slate-500 max-w-md mb-8">
                No hay productos que coincidan con tu búsqueda "{searchTerm}" 
                {selectedCategory !== 'Todos' && ` en la categoría ${selectedCategory}`}
                {selectedSubcategory !== 'Todas' && `, subcategoría ${selectedSubcategory}`}
                {selectedTerceraCategoria !== 'Todas' && `, tercera categoría ${selectedTerceraCategoria}`}.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Todos');
                }}
                variant="outline"
                className="bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700"
              >
                Mostrar todos los productos
              </Button>
            </div>
          )}
        </div>

        {/* Ofertas Especiales */}
       
        {/* NUEVA SECCIÓN ULTRA-DESTACADA DE OFERTAS ESPECIALES - Siempre visible */}
        {(
          <div className="mt-32 mb-10 relative">
            {/* Separador decorativo superior */}
            {/* Encabezado principal de Ofertas - Diseño profesional y moderno */}
            <div className="bg-gradient-to-r from-blue-600 to-slate-800 pt-10 pb-8 px-6 text-center relative overflow-hidden shadow-lg rounded-t-xl">
              {/* Elementos decorativos modernos y sutiles */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-15">
                <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-white mix-blend-overlay filter blur-xl"></div>
                <div className="absolute bottom-1/3 right-1/4 w-56 h-56 rounded-full bg-blue-300 mix-blend-overlay filter blur-xl"></div>
              </div>
              
              <div className="relative z-10">
                <div className="inline-block mb-3 px-4 py-1.5 bg-blue-500/30 rounded-full backdrop-blur-sm border border-blue-400/30">
                  <span className="text-sm font-medium text-white">Promociones especiales</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
                  Ofertas exclusivas
                </h2>
                <p className="text-base md:text-lg text-blue-50 max-w-2xl mx-auto font-light">
                  Descubre nuestra selección de productos con los mejores precios por tiempo limitado
                </p>
                <div className="flex justify-center mt-6">
                  <span className="inline-block bg-white/95 backdrop-blur-sm text-blue-800 text-sm font-semibold px-5 py-2 rounded-full shadow-md">
                    Hasta 25% de descuento en productos seleccionados
                  </span>
                </div>
              </div>
            </div>

            {/* Contenedor principal de productos en oferta con diseño profesional */}
            <div className="bg-gradient-to-b from-slate-50 to-white py-12 px-4 md:px-8 relative">
              {/* Elementos decorativos sutiles */}
              <div className="absolute top-0 right-10 w-24 h-24 opacity-20">
                <svg viewBox="0 0 200 200" className="text-blue-500/20 w-full h-full">
                  <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,74.1,43.2C66.7,57.2,57.6,70.6,45,78.1C32.4,85.6,16.2,87.3,0.7,86.2C-14.8,85.1,-29.6,81.2,-43.9,74.5C-58.3,67.8,-72.3,58.2,-79.1,45.1C-85.9,32,-85.5,16,-83.2,1.3C-80.9,-13.4,-76.6,-26.8,-69.9,-39.2C-63.2,-51.7,-54.1,-63.2,-42.2,-71.3C-30.3,-79.4,-15.1,-84,-0.3,-83.6C14.6,-83.2,29.2,-77.8,44.7,-76.4Z" transform="translate(100 100)" />
                </svg>
              </div>
              
              <div className="max-w-7xl mx-auto">
                {/* Encabezado de ofertas más profesional */}
                <div className="mb-8 relative">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 flex items-center">
                    <span className="text-blue-600 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    Ofertas Especiales
                  </h2>
                  <div className="h-1 w-24 bg-blue-600 rounded-full mb-4"></div>
                  <p className="text-slate-600 max-w-2xl">
                    Descubre nuestras ofertas exclusivas por tiempo limitado. Productos de alta calidad a precios inigualables.
                  </p>
                </div>
                
                {/* Grid de productos en oferta - tarjetas más anchas y avanzadas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {ofertas.length > 0 ? (
                    ofertas.map((oferta) => (
                      <ProductCard key={oferta.id} product={{...oferta, price: oferta.price, originalPrice: oferta.originalPrice}} />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <div className="bg-white p-10 rounded-xl shadow-sm border border-slate-200 max-w-md mx-auto">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3">No hay ofertas disponibles</h3>
                        <p className="text-slate-600">
                          En este momento no tenemos ofertas especiales activas. Nuestras promociones son actualizadas constantemente, ¡vuelve pronto para descubrir nuevos descuentos!
                        </p>
                        <div className="mt-6">
                          <button 
                            className="inline-flex items-center justify-center text-sm px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Recibir notificaciones de ofertas
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Banner de información adicional - Diseño profesional con colores azul/slate */}
                <div className="mt-16 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-8 border border-slate-200 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-slate-700 flex items-center justify-center mb-4 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg mb-1">Ofertas por tiempo limitado</h3>
                      <p className="text-sm text-slate-600">Descuentos disponibles hasta agotar existencias</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-slate-700 flex items-center justify-center mb-4 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg mb-1">Calidad garantizada</h3>
                      <p className="text-sm text-slate-600">Productos seleccionados de primera calidad</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-slate-700 flex items-center justify-center mb-4 shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg mb-1">Proceso de pago seguro</h3>
                      <p className="text-sm text-slate-600">Múltiples métodos de pago disponibles</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
