import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { 
  Plus, Package, Edit, Trash2, Search, Save, X, Image, AlertTriangle, Check, CreditCard, 
  ShieldCheck, Award, Wand2, ChevronDown, Calendar, Filter, RefreshCw, Tags, History, 
  SlidersHorizontal, Loader2, Eye
} from 'lucide-react';
import { CustomClock } from '@/components/ui/CustomClock';
import { sampleProducts } from '@/data/products';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { collection, addDoc, getDocs, updateDoc, doc, setDoc, getDoc, query, orderBy, Timestamp, deleteDoc, where, limit } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { ImageUploader } from './ImageUploader';
import { MultiImageUploader } from './MultiImageUploader';

interface ProductFormProps {
  selectedProductId?: string | null;
  onProductSelected?: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ selectedProductId, onProductSelected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cost: '',  // Costo de adquisición/producción del producto
    category: '',
    subcategory: '',  // Será "none" en la UI, pero guardamos como "" cuando no hay subcategoría
    terceraCategoria: '', // Será "none" en la UI, pero guardamos como "" cuando no hay tercera categoría
    stock: '',
    image: '',
    additionalImages: ['', '', ''],
    specifications: [{ name: '', value: '' }],
    isOffer: false,
    discount: '',
    originalPrice: '',
    benefits: [] as string[],
    warranties: [] as string[],
    paymentMethods: [] as string[],
    colors: [] as { name: string, hexCode: string, image: string }[],
    isPublished: true  // Por defecto publicado
  });
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(5);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; parentId?: string | null; }[]>([]);
  const [visibleProducts, setVisibleProducts] = useState<number>(20); // Número de productos visibles inicialmente
  const [hasMoreProducts, setHasMoreProducts] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // Filtro por categoría
  
  // Estados para secciones colapsables
  const [sectionsOpen, setSectionsOpen] = useState({
    basicInfo: true,
    images: true,
    offers: false,
    details: false,
    benefits: false
  });
  
  const [monthlyCostData, setMonthlyCostData] = useState<{
    month: string;
    year: number;
    totalCost: number;
    totalProducts: number;
    breakdown: Array<{category: string; cost: number; count: number}>;
  } | null>(null);
  const [isLoadingCosts, setIsLoadingCosts] = useState(false);
  const { user } = useAuth();
  // Por defecto, establecemos liberta como "no" para asegurar que los cambios vayan a revisión
  // hasta que se verifique el permiso
  const [liberta, setLiberta] = useState("no");

  // Lista predefinida de beneficios
  const predefinedBenefits = [
    "Envío gratis",
    "Entrega en 24 horas",
    "Producto importado",
    "Producto ecológico",
    "Ahorro energético",
    "Fabricación local",
    "Servicio post-venta",
    "Producto orgánico",
    "Soporte técnico incluido",
    "Materiales premium"
  ];

  // Lista predefinida de garantías
  const predefinedWarranties = [
    "Garantía de 6 meses",
    "Garantía de 1 año",
    "Garantía de 2 años",
    "Garantía de por vida",
    "Devolución en 30 días",
    "Reembolso garantizado",
    "Cambio sin costo",
    "Reparación incluida",
    "Repuestos disponibles",
    "Servicio técnico oficial"
  ];

  // Lista predefinida de medios de pago
  const predefinedPaymentMethods = [
    "Tarjeta de crédito",
    "Tarjeta de débito",
    "Transferencia bancaria",
    "PayPal",
    "Efectivo",
    "Contra-reembolso",
    "Pago en cuotas",
    "Mercado Pago",
    "Nequi",
    "Daviplata"
  ];

  // This is now handled by the useMemo implementation later in the code

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        // Cargar todos los productos ordenados por última modificación
        const productsQuery = query(
          collection(db, "products"),
          orderBy("lastModified", "desc")
        );
        const querySnapshot = await getDocs(productsQuery);
        setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        // Fallback: cargar sin orden si no hay índice
        try {
          const querySnapshot = await getDocs(collection(db, "products"));
          setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (fallbackError) {
          console.error('Error cargando productos:', fallbackError);
        }
      } finally {
        setLoadingProducts(false);
      }
    };
    
    const fetchCategories = async () => {
      try {
        // Get all categories
        const querySnapshot = await getDocs(collection(db, "categories"));
        const allCategories = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          name: doc.data().name || "Categoría sin nombre",
          parentId: doc.data().parentId || null
        })) as { id: string; name: string; parentId?: string | null }[];
        
        setCategories(allCategories);
        
        // Verificar si el usuario tiene libertad
        if (user && user.email) {
          // Si es admin@gmail.com, darle permisos completos automáticamente
          if (user.email === "admin@gmail.com") {
            setLiberta("si");
          } else {
            // Primero verificar en la colección "users" donde está la info de subcuentas
            if (user.id) {
              const userDoc = await getDoc(doc(db, "users", user.id));
              if (userDoc.exists() && userDoc.data().liberta === "si") {
                setLiberta("si");
              } else {
                // Verificar también en "admins" por compatibilidad
                const adminDoc = await getDoc(doc(db, "admins", user.email));
                if (adminDoc.exists() && adminDoc.data().liberta === "yes") {
                  setLiberta("si");
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
    fetchProducts();
  }, [user]);

  // Efecto para abrir automáticamente un producto cuando se selecciona desde una notificación
  useEffect(() => {
    if (selectedProductId && products.length > 0 && !loadingProducts && editingId !== selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (product) {
        handleEdit(product);
        // Notificar al padre que el producto fue seleccionado
        if (onProductSelected) {
          onProductSelected();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId, products, loadingProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      toast({
        variant: "destructive",
        title: "Error al guardar producto",
        description: "Por favor completa los campos obligatorios."
      });
      return;
    }
    
    // La imagen es opcional, no hay validación requerida
    
    const numericPrice = parseFloat(formData.price);
    const numericStock = parseInt(formData.stock, 10);
    // Convertir costo a número si existe, de lo contrario NULL
    const numericCost = formData.cost ? parseFloat(formData.cost) : null;
    
    if (isNaN(numericPrice) || isNaN(numericStock) || (formData.cost && isNaN(numericCost as number))) {
      toast({
        variant: "destructive",
        title: "Error al guardar producto",
        description: "El precio, costo y stock deben ser valores numéricos."
      });
      return;
    }

    // Encontrar nombres completos de categorías para mejor visualización
    const categoryName = categories.find(cat => cat.id === formData.category)?.name || "";
    const subcategoryName = formData.subcategory ? 
      categories.find(cat => cat.id === formData.subcategory)?.name || "" : 
      "";
    const terceraCategoriaName = formData.terceraCategoria ? 
      categories.find(cat => cat.id === formData.terceraCategoria)?.name || "" : 
      "";
    
    const productData = {
      ...formData,
      price: numericPrice,
      cost: numericCost,
      stock: numericStock,
      originalPrice: formData.isOffer ? parseFloat(formData.originalPrice) : numericPrice,
      discount: formData.isOffer ? parseFloat(formData.discount) : 0,
      isOffer: formData.isOffer,
      categoryName, // Agregar nombres descriptivos
      subcategoryName,
      terceraCategoriaName,
      lastModified: new Date(),
      lastModifiedBy: user?.email || "unknown",
      // Agregar información para el seguimiento del inventario y costos
      costUpdatedAt: new Date(),
      profitMargin: numericCost ? ((numericPrice - numericCost) / numericPrice) * 100 : null,
      // Asegurar que la imagen se maneje correctamente
      image: formData.image || undefined,
    };
    
    try {
      if (isEditing && editingId) {
        // Si liberta="si", permite cambios directos, en cualquier otro caso requiere revisión
        if (liberta === "si") {
          // Obtener el producto actual para asegurarnos de no perder datos
          const currentProduct = products.find(product => product.id === editingId);
          
          // Solo conservar la imagen anterior si el campo está explícitamente vacío o es null/undefined
          // Si formData.image tiene un valor (nueva imagen o la misma), siempre usar ese valor
          if (!formData.image || formData.image.trim() === '') {
            // Solo conservar la imagen anterior si el campo está vacío
            if (currentProduct?.image) {
              productData.image = currentProduct.image;
            } else {
              productData.image = '';
            }
          }
          // Si formData.image tiene valor, productData.image ya lo tiene del spread operator
          
          // Si tiene libertad, actualiza directamente
          await updateDoc(doc(db, "products", editingId), productData);
          toast({
            title: "Producto actualizado",
            description: "El producto ha sido actualizado exitosamente."
          });
          
          // Actualizar la lista de productos
          const updatedProducts = products.map(product => 
            product.id === editingId ? { id: editingId, ...productData } : product
          );
          setProducts(updatedProducts);
          resetForm();
        } else {
          // Obtener el producto actual para asegurarnos de no perder datos
          const currentProduct = products.find(product => product.id === editingId);
          
          // Solo conservar la imagen anterior si el campo está explícitamente vacío o es null/undefined
          if (!formData.image || formData.image.trim() === '') {
            // Solo conservar la imagen anterior si el campo está vacío
            if (currentProduct?.image) {
              productData.image = currentProduct.image;
            } else {
              productData.image = '';
            }
          }
          // Si formData.image tiene valor, productData.image ya lo tiene del spread operator
          
          // Si no tiene liberta, los cambios van a revisión
          await addDoc(collection(db, "revision"), {
            type: "edit",
            data: { ...productData, id: editingId },
            status: "pendiente",
            timestamp: new Date(),
            editorEmail: user?.email || "unknown",
            userName: user?.name || user?.email || "unknown"
          });
          
          toast({
            title: "Cambios enviados a revisión",
            description: "Los cambios han sido enviados para aprobación del administrador."
          });
          resetForm();
        }
      } else {
        // Si liberta="si", permite cambios directos, en cualquier otro caso requiere revisión
        if (liberta === "si") {
          // Si tiene libertad, crea directamente
          const productWithMetadata = {
            ...productData,
            createdAt: new Date(),
            createdBy: user?.email || "unknown",
            lastModified: new Date(),
            lastModifiedBy: user?.email || "unknown"
          };
          
          const docRef = await addDoc(collection(db, "products"), productWithMetadata);
          toast({
            title: "Producto agregado",
            description: "El producto ha sido agregado exitosamente."
          });
          
          // Actualizar la lista de productos
          setProducts([...products, { id: docRef.id, ...productWithMetadata }]);
          resetForm();
        } else {
          // Si no tiene liberta, los cambios van a revisión
          await addDoc(collection(db, "revision"), {
            type: "add",
            data: productData,
            status: "pendiente",
            timestamp: new Date(),
            editorEmail: user?.email || "unknown",
            userName: user?.name || user?.email || "unknown"
          });
          
          toast({
            title: "Producto enviado a revisión",
            description: "El producto ha sido enviado para aprobación del administrador."
          });
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error guardando producto:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al guardar el producto. Inténtalo nuevamente."
      });
    }
  };

  const handleEdit = (product: any) => {
    setIsEditing(true);
    setEditingId(product.id);
    setIsFormOpen(true); // Abrir el formulario automáticamente
    
    // Convertir valores numéricos a string para el formulario
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price) || '',
      cost: String(product.cost) || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      terceraCategoria: product.terceraCategoria || '',
      stock: String(product.stock) || '',
      image: product.image || '',
      additionalImages: product.additionalImages && product.additionalImages.length >= 3 ? 
        product.additionalImages : ['', '', ''],
      specifications: product.specifications && product.specifications.length > 0 ? 
        product.specifications : [{ name: '', value: '' }],
      isOffer: product.isOffer || false,
      discount: String(product.discount || ''),
      originalPrice: String(product.originalPrice || ''),
      benefits: product.benefits || [],
      warranties: product.warranties || [],
      paymentMethods: product.paymentMethods || [],
      colors: product.colors || [],
      isPublished: product.isPublished !== undefined ? product.isPublished : true
    });
    
    // Scroll al formulario
    setTimeout(() => {
      document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDelete = async (productId: string) => {
    try {
      // Confirmar la eliminación permanente
      if (!window.confirm("¿Estás seguro de eliminar este producto PERMANENTEMENTE? Esta acción no se puede deshacer.")) {
        return;
      }
      
      // Eliminar de forma permanente utilizando la función deleteDoc
      await deleteDoc(doc(db, "products", productId));
      
      // También eliminar posibles referencias relacionadas en otras colecciones
      // Por ejemplo, eliminar imágenes asociadas, reviews, etc.
      try {
        // Eliminar revisiones pendientes relacionadas con este producto
        const revisionsQuery = query(collection(db, "revision"), 
          where("data.id", "==", productId));
        const revisionsSnapshot = await getDocs(revisionsQuery);
        
        const deletePromises = revisionsSnapshot.docs.map(revDoc => {
          return deleteDoc(doc(db, "revision", revDoc.id));
        });
        
        // Ejecutar todas las eliminaciones en paralelo
        if (deletePromises.length > 0) {
          await Promise.all(deletePromises);
        }
      } catch (cleanupError) {
        console.error("Error limpiando referencias del producto:", cleanupError);
        // No interrumpir el flujo por errores en limpieza
      }
      
      toast({
        title: "Producto eliminado permanentemente",
        description: "El producto ha sido eliminado de la base de datos de forma permanente."
      });
      
      // Actualizar la lista de productos
      setProducts(products.filter(product => product.id !== productId));
    } catch (error) {
      console.error("Error eliminando producto:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Ocurrió un error al intentar eliminar el producto. Inténtalo nuevamente."
      });
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setIsFormOpen(false); // Cerrar el formulario al cancelar
    setFormData({
      name: '',
      description: '',
      price: '',
      cost: '',
      category: '',
      subcategory: '',
      terceraCategoria: '',
      stock: '',
      image: '',
      additionalImages: ['', '', ''],
      specifications: [{ name: '', value: '' }],
      isOffer: false,
      discount: '',
      originalPrice: '',
      benefits: [],
      warranties: [],
      paymentMethods: [],
      colors: [],
      isPublished: true
    });
  };

  // OPTIMIZACIÓN: Memoizar función de estado de stock
  const getStockStatus = useCallback((stock: number) => {
    if (stock > 10) {
      return { text: "En Stock", color: "bg-green-100 text-green-800 hover:bg-green-200" };
    } else if (stock > 0) {
      return { text: "Stock Bajo", color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" };
    } else {
      return { text: "Agotado", color: "bg-red-100 text-red-800 hover:bg-red-200" };
    }
  }, []);

  // State for sorting
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest' | 'price-high' | 'price-low' | 'name-asc' | 'name-desc'>('recent');
  
  // OPTIMIZACIÓN: Filtrado combinado en una sola pasada para mejor rendimiento
  const filteredProducts = useMemo(() => {
    if (products.length === 0) return [];
    
    const hasSearchTerm = searchTerm.trim().length > 0;
    const hasCategoryFilter = selectedCategory.length > 0;
    
    // Si no hay filtros, retornar todos los productos directamente
    if (!hasSearchTerm && !hasCategoryFilter) {
      return products;
    }
    
    const lowercasedTerm = hasSearchTerm ? searchTerm.toLowerCase() : '';
    
    // Filtrar en una sola pasada combinando ambos filtros
    return products.filter(product => {
      // Filtro de búsqueda
      if (hasSearchTerm) {
        const matchesSearch = 
          (product.name && product.name.toLowerCase().includes(lowercasedTerm)) || 
          (product.description && product.description.toLowerCase().includes(lowercasedTerm)) ||
          (product.category && product.category.toLowerCase().includes(lowercasedTerm)) ||
          (product.price && String(product.price).includes(lowercasedTerm));
        
        if (!matchesSearch) return false;
      }
      
      // Filtro de categoría
      if (hasCategoryFilter) {
        const matchesCategory = 
          product.category === selectedCategory ||
          product.subcategory === selectedCategory ||
          product.terceraCategoria === selectedCategory;
        
        if (!matchesCategory) return false;
      }
      
      return true;
    });
  }, [searchTerm, selectedCategory, products]);
  
  // OPTIMIZACIÓN: Sort más eficiente con caché de valores calculados
  const sortedProducts = useMemo(() => {
    if (filteredProducts.length === 0) return [];
    
    // Crear array con valores pre-calculados para evitar recalcular en cada comparación
    const productsWithSortKeys = filteredProducts.map(product => {
      let sortKey: number | string = 0;
      
      switch (sortOrder) {
        case 'recent':
        case 'oldest':
          const modified = product.lastModified?.toDate?.() || product.updatedAt || new Date();
          sortKey = modified instanceof Date ? modified.getTime() : new Date(modified).getTime();
          break;
        case 'price-high':
        case 'price-low':
          sortKey = parseFloat(String(product.price)) || 0;
          break;
        case 'name-asc':
        case 'name-desc':
          sortKey = (product.name || '').toLowerCase();
          break;
      }
      
      return { product, sortKey };
    });
    
    // Ordenar usando los valores pre-calculados
    productsWithSortKeys.sort((a, b) => {
      switch (sortOrder) {
        case 'recent':
          return (b.sortKey as number) - (a.sortKey as number);
        case 'oldest':
          return (a.sortKey as number) - (b.sortKey as number);
        case 'price-high':
          return (b.sortKey as number) - (a.sortKey as number);
        case 'price-low':
          return (a.sortKey as number) - (b.sortKey as number);
        case 'name-asc':
          return (a.sortKey as string).localeCompare(b.sortKey as string);
        case 'name-desc':
          return (b.sortKey as string).localeCompare(a.sortKey as string);
        default:
          return 0;
      }
    });
    
    return productsWithSortKeys.map(item => item.product);
  }, [filteredProducts, sortOrder]);
  
  // Limitar el número de productos visibles para paginación
  const paginatedProducts = useMemo(() => {
    return sortedProducts.slice(0, visibleProducts);
  }, [sortedProducts, visibleProducts]);

  // Actualizar el estado de hasMoreProducts cuando cambien sortedProducts o visibleProducts
  useEffect(() => {
    setHasMoreProducts(visibleProducts < sortedProducts.length);
  }, [sortedProducts.length, visibleProducts]);

  // Función para cargar más productos
  const loadMoreProducts = () => {
    setLoadingMoreProducts(true);
    // Simular pequeño retraso para mejor UX
    setTimeout(() => {
      setVisibleProducts(prev => prev + 20);
      setLoadingMoreProducts(false);
    }, 500);
  };

  // Image loading state
  const [loadingImages, setLoadingImages] = useState<{[key: string]: boolean}>({});
  
  // Function to handle image load start/end
  const handleImageLoadStart = (productId: string) => {
    setLoadingImages(prev => ({...prev, [productId]: true}));
  };
  
  const handleImageLoadEnd = (productId: string) => {
    setLoadingImages(prev => ({...prev, [productId]: false}));
  };
  
  // Function to calculate monthly cost summary
  const calculateMonthlyCostSummary = async (month?: number, year?: number) => {
    setIsLoadingCosts(true);
    
    try {
      // Use current month and year if not specified
      const targetDate = new Date();
      if (month !== undefined) targetDate.setMonth(month);
      if (year !== undefined) targetDate.setFullYear(year);
      
      // Get first and last day of month
      const firstDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const lastDay = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
      
      // Format month name in Spanish
      const monthName = targetDate.toLocaleString('es-ES', { month: 'long' });
      
      // Get all products
      const productsQuery = query(collection(db, "products"));
      const productsSnapshot = await getDocs(productsQuery);
      
      let totalCost = 0;
      let productsWithCost = 0;
      const categoryBreakdown: {[key: string]: {cost: number, count: number}} = {};
      
      // Calculate totals
      productsSnapshot.docs.forEach(doc => {
        const product = doc.data();
        
        if (product.cost) {
          const cost = parseFloat(product.cost);
          const stock = parseInt(product.stock || 0, 10);
          
          if (!isNaN(cost) && !isNaN(stock) && stock > 0) {
            const totalProductCost = cost * stock;
            totalCost += totalProductCost;
            productsWithCost++;
            
            // Add to category breakdown
            const category = product.categoryName || "Sin categoría";
            if (!categoryBreakdown[category]) {
              categoryBreakdown[category] = { cost: 0, count: 0 };
            }
            
            categoryBreakdown[category].cost += totalProductCost;
            categoryBreakdown[category].count++;
          }
        }
      });
      
      // Transform category breakdown to array
      const breakdownArray = Object.entries(categoryBreakdown).map(([category, data]) => ({
        category,
        cost: data.cost,
        count: data.count
      })).sort((a, b) => b.cost - a.cost); // Sort by cost descending
      
      // Set the data
      setMonthlyCostData({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1), // Capitalize first letter
        year: targetDate.getFullYear(),
        totalCost,
        totalProducts: productsWithCost,
        breakdown: breakdownArray
      });
      
    } catch (error) {
      console.error("Error calculating monthly costs:", error);
      toast({
        variant: "destructive",
        title: "Error al calcular costos",
        description: "No se pudieron calcular los costos mensuales."
      });
    } finally {
      setIsLoadingCosts(false);
    }
  };

  // Initialize expandable sections based on form data
  // Calculate costs on component mount
  useEffect(() => {
    if (user && liberta === "si") {
      calculateMonthlyCostSummary();
    }
  }, [user, liberta]);

  useEffect(() => {
    // Helper function to check if a section has content
    const hasSectionContent = (sectionData: any[]) => {
      return sectionData.length > 0;
    };

    // Set timeout to ensure DOM elements are available
    const timer = setTimeout(() => {
      // Handle colors section visibility
      const colorsSection = document.getElementById('colorsSection');
      const colorsChevron = document.getElementById('colorsChevron');
      if (colorsSection && colorsChevron) {
        if (!hasSectionContent(formData.colors)) {
          colorsSection.classList.add('hidden');
        } else {
          colorsChevron.classList.add('rotate-180');
        }
      }

      // Handle benefits section visibility
      const benefitsSection = document.getElementById('benefitsSection');
      const benefitsChevron = document.getElementById('benefitsChevron');
      if (benefitsSection && benefitsChevron) {
        if (!hasSectionContent(formData.benefits)) {
          benefitsSection.classList.add('hidden');
        } else {
          benefitsChevron.classList.add('rotate-180');
        }
      }

      // Handle warranties section visibility
      const warrantiesSection = document.getElementById('warrantiesSection');
      const warrantiesChevron = document.getElementById('warrantiesChevron');
      if (warrantiesSection && warrantiesChevron) {
        if (!hasSectionContent(formData.warranties)) {
          warrantiesSection.classList.add('hidden');
        } else {
          warrantiesChevron.classList.add('rotate-180');
        }
      }

      // Handle payment methods section visibility
      const paymentMethodsSection = document.getElementById('paymentMethodsSection');
      const paymentMethodsChevron = document.getElementById('paymentMethodsChevron');
      if (paymentMethodsSection && paymentMethodsChevron) {
        if (!hasSectionContent(formData.paymentMethods)) {
          paymentMethodsSection.classList.add('hidden');
        } else {
          paymentMethodsChevron.classList.add('rotate-180');
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [formData.colors.length, formData.benefits.length, formData.warranties.length, formData.paymentMethods.length]);

  return (
    <div className="space-y-8">
      {/* Aviso del estado de libertad */}
      {user?.subCuenta === "si" && (
        <div className={`p-4 mb-4 ${liberta === "si" 
          ? "bg-green-100 border-l-4 border-green-400 text-green-800" 
          : "bg-sky-100 border-l-4 border-sky-400 text-sky-800"} rounded-lg shadow-sm`}>
          <div className="flex items-center">
            {liberta === "si" ? (
              <ShieldCheck className="h-5 w-5 mr-2 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 mr-2 text-sky-600" />
            )}
            <p className="font-medium">
              {liberta === "si" 
                ? "Tu cuenta tiene permisos para publicar cambios directamente." 
                : "Tu cuenta no tiene permisos para publicar cambios directos. Los cambios que realices serán enviados a revisión del administrador."}
            </p>
          </div>
        </div>
      )}

      {/* Formulario para agregar/editar productos */}
      <Card id="product-form" className={cn(
        "shadow-2xl border-2 overflow-hidden rounded-2xl transition-all duration-300",
        isFormOpen ? "border-blue-500" : "border-gray-200"
      )}>
        <CardHeader 
          className={cn(
            "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white transition-all",
            !isEditing && "cursor-pointer hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700"
          )}
          onClick={() => !isEditing && setIsFormOpen(!isFormOpen)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isEditing ? (
                <>
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                    <Edit className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">Editar Producto</CardTitle>
                    <CardDescription className="text-blue-100 mt-1">
                      Modifica la información del producto existente
                    </CardDescription>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                    <Plus className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">Agregar Nuevo Producto</CardTitle>
                    <CardDescription className="text-blue-100 mt-1 flex items-center gap-2">
                      {isFormOpen ? (
                        'Complete todos los campos requeridos para crear un producto'
                      ) : (
                        <>
                          <span>👆 Haz clic aquí para expandir el formulario y agregar un nuevo producto</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={(e) => {
                    e.stopPropagation();
                    resetForm();
                  }}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5 mr-2" />
                  Cancelar
                </Button>
              )}
              {!isEditing && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  className="text-white hover:bg-white/20"
                >
                  <ChevronDown className={cn(
                    "h-6 w-6 transition-transform duration-300",
                    isFormOpen && "rotate-180"
                  )} />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {isFormOpen && (
          <CardContent className="p-8 bg-gradient-to-br from-gray-50 to-white animate-in slide-in-from-top duration-300">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sección: Información Básica - Colapsable */}
            <div className="space-y-6 bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all"
                onClick={() => setSectionsOpen({...sectionsOpen, basicInfo: !sectionsOpen.basicInfo})}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Información Básica</h3>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700">Requerido</Badge>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 text-gray-600 transition-transform duration-300",
                  sectionsOpen.basicInfo && "rotate-180"
                )} />
              </div>
              
              {sectionsOpen.basicInfo && (
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                  Nombre del Producto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ej: Coca-Cola 600ml"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold">
                  Categoría Principal <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => {
                    setFormData({...formData, category: value, subcategory: ''}); // Reset subcategory when category changes (se mostrará como "none")
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar categoría principal" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Mostrar solo categorías principales */}
                    {categories
                      .filter(category => !category.parentId)
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {/* Mostrar nombre de la categoría seleccionada */}
                {formData.category && !formData.subcategory && (
                  <div className="mt-1 text-xs text-blue-600 font-medium">
                    Clasificación: {categories.find(cat => cat.id === formData.category)?.name || 'Categoría seleccionada'}
                  </div>
                )}
              </div>
              
              {/* Subcategoría (opcional) - solo mostrado si se ha seleccionado una categoría */}
              {formData.category && (
                <div className="space-y-2">
                  <Label htmlFor="subcategory" className="text-sm font-semibold flex items-center">
                    Subcategoría <span className="ml-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">Opcional</span>
                  </Label>
                  <Select 
                    value={formData.subcategory || "none"} 
                    onValueChange={(value) => setFormData({
                      ...formData, 
                      subcategory: value === "none" ? "" : value,
                      terceraCategoria: "" // Reset tercera categoría cuando cambia la subcategoría
                    })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Seleccionar subcategoría (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguna - Usar solo categoría principal</SelectItem>
                      {/* Mostrar subcategorías de la categoría seleccionada */}
                      {categories
                        .filter(category => category.parentId === formData.category)
                        .map((subCategory) => (
                          <SelectItem key={subCategory.id} value={subCategory.id}>
                            {subCategory.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {formData.category && formData.subcategory && (
                    <div className="mt-1 text-xs text-blue-600 font-medium">
                      Clasificación: {categories.find(cat => cat.id === formData.category)?.name || 'Categoría principal'} {'>'} {categories.find(cat => cat.id === formData.subcategory)?.name || 'Subcategoría'}
                    </div>
                  )}
                </div>
              )}
              
              {/* Tercera categoría (opcional) - solo mostrado si se ha seleccionado una subcategoría */}
              {formData.category && formData.subcategory && (
                <div className="space-y-2">
                  <Label htmlFor="terceraCategoria" className="text-sm font-semibold flex items-center">
                    Tercera Categoría <span className="ml-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">Opcional</span>
                  </Label>
                  <Select 
                    value={formData.terceraCategoria || "none"} 
                    onValueChange={(value) => setFormData({
                      ...formData, 
                      terceraCategoria: value === "none" ? "" : value
                    })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Seleccionar tercera categoría (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguna - Usar solo hasta subcategoría</SelectItem>
                      {/* Mostrar terceras categorías de la subcategoría seleccionada */}
                      {categories
                        .filter(category => category.parentId === formData.subcategory)
                        .map((terceraCategoria) => (
                          <SelectItem key={terceraCategoria.id} value={terceraCategoria.id}>
                            {terceraCategoria.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {formData.category && formData.subcategory && formData.terceraCategoria && (
                    <div className="mt-1 text-xs text-blue-600 font-medium">
                      Clasificación: {categories.find(cat => cat.id === formData.category)?.name || 'Categoría principal'} {'>'} 
                      {categories.find(cat => cat.id === formData.subcategory)?.name || 'Subcategoría'} {'>'} 
                      {categories.find(cat => cat.id === formData.terceraCategoria)?.name || 'Tercera categoría'}
                    </div>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-semibold">
                  Precio de venta <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="Ej: 12500"
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cost" className="text-sm font-semibold flex items-center">
                  Costo de adquisición
                  <div className="ml-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">Uso interno</div>
                </Label>
                <Input
                  id="cost"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  placeholder="Ej: 8000"
                  className="h-11"
                />
                {formData.cost && formData.price && (
                  <div className="mt-2 text-xs">
                    <span className="font-medium">Margen: </span>
                    {parseFloat(formData.price) > 0 && parseFloat(formData.cost) > 0 ? (
                      <span className="text-green-600 font-medium">
                        {Math.round(((parseFloat(formData.price) - parseFloat(formData.cost)) / parseFloat(formData.price)) * 100)}%
                      </span>
                    ) : (
                      <span className="text-gray-500">No calculable</span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Control de Publicación - Compacto */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Estado de Publicación
                </Label>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      formData.isPublished ? "bg-green-500" : "bg-gray-400"
                    )}></div>
                    <span className="text-xs text-gray-600">
                      {formData.isPublished ? "Publicado" : "No publicado"}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  {formData.isPublished 
                    ? "✅ Visible para el público" 
                    : "🔒 Solo visible internamente"}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-sm font-semibold">
                  Stock <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  placeholder="Ej: 100"
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                  Descripción <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe el producto detalladamente..."
                  required
                  className="min-h-[120px]"
                />
              </div>
            </div>
              )}
            </div>
              
            {/* Sección: Imágenes del Producto - Colapsable */}
            <div className="space-y-6 bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 cursor-pointer hover:from-purple-100 hover:to-pink-100 transition-all"
                onClick={() => setSectionsOpen({...sectionsOpen, images: !sectionsOpen.images})}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                    <Image className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Imágenes del Producto</h3>
                  <Badge variant="outline" className="bg-purple-100 text-purple-700">Recomendado</Badge>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 text-gray-600 transition-transform duration-300",
                  sectionsOpen.images && "rotate-180"
                )} />
              </div>
              
              {sectionsOpen.images && (
              <div className="p-6 space-y-6">
              
              <div className="space-y-2">
                <ImageUploader
                  value={formData.image}
                  onChange={(url) => setFormData({...formData, image: url})}
                  label="Imagen Principal del Producto (Opcional)"
                  folder="products/main"
                  maxSizeMB={5}
                  aspectRatio="aspect-square"
                />
              </div>

              {/* Imágenes adicionales */}
              <div className="space-y-4">
                <MultiImageUploader
                  images={formData.additionalImages}
                  onChange={(images) => setFormData({...formData, additionalImages: images})}
                  label="Imágenes Adicionales del Producto"
                  maxImages={6}
                  folder="products/additional"
                />
              </div>
              </div>
              )}
            </div>

            {/* Sección: Ofertas y Promociones - Colapsable */}
            <div className="space-y-6 bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-all"
                onClick={() => setSectionsOpen({...sectionsOpen, offers: !sectionsOpen.offers})}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Ofertas y Promociones</h3>
                  <Badge variant="outline" className="bg-green-100 text-green-700">Opcional</Badge>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 text-gray-600 transition-transform duration-300",
                  sectionsOpen.offers && "rotate-180"
                )} />
              </div>
              
              {sectionsOpen.offers && (
              <div className="p-6">

              <div className="space-y-4 bg-white rounded-xl p-6 border-2 border-gray-200">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isOffer"
                    checked={formData.isOffer}
                    onChange={(e) => setFormData({...formData, isOffer: e.target.checked})}
                    className="w-5 h-5 rounded text-green-600 focus:ring-2 focus:ring-green-500"
                  />
                  <Label htmlFor="isOffer" className="text-base font-semibold cursor-pointer flex items-center gap-2">
                    Activar oferta especial
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {formData.isOffer ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </Label>
                </div>
                
                {formData.isOffer && (
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="originalPrice" className="text-sm font-semibold text-gray-700">
                        Precio Original
                      </Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                        placeholder="Ej: 15000"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount" className="text-sm font-semibold text-gray-700">
                        Descuento (%)
                      </Label>
                      <Input
                        id="discount"
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData({...formData, discount: e.target.value})}
                        placeholder="Ej: 20"
                        className="h-11"
                      />
                    </div>
                  </div>
                )}
              </div>
              </div>
              )}
            </div>
              
            {/* Sección: Detalles del Producto - Colapsable */}
            <div className="space-y-6 bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-blue-50 cursor-pointer hover:from-indigo-100 hover:to-blue-100 transition-all"
                onClick={() => setSectionsOpen({...sectionsOpen, details: !sectionsOpen.details})}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg">
                    <SlidersHorizontal className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Detalles del Producto</h3>
                  <Badge variant="outline" className="bg-indigo-100 text-indigo-700">Opcional</Badge>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 text-gray-600 transition-transform duration-300",
                  sectionsOpen.details && "rotate-180"
                )} />
              </div>
              
              {sectionsOpen.details && (
              <div className="p-6 space-y-6">

              {/* Especificaciones */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <div className="p-1 bg-sky-50 rounded">
                      <Package className="h-4 w-4 text-sky-600" />
                    </div>
                    Especificaciones
                  </Label>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => setFormData({
                      ...formData, 
                      specifications: [...formData.specifications, { name: '', value: '' }]
                    })}
                    className="flex items-center gap-1 text-xs h-7"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Añadir especificación
                  </Button>
                </div>
                
                <div className="grid gap-3">
                  {formData.specifications.map((spec, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center bg-gray-50 p-3 rounded-lg">
                      <div className="sm:col-span-2">
                        <Label htmlFor={`spec-name-${index}`} className="sr-only">
                          Nombre
                        </Label>
                        <Input
                          id={`spec-name-${index}`}
                          value={spec.name}
                          onChange={(e) => {
                            const newSpecs = [...formData.specifications];
                            newSpecs[index] = { ...newSpecs[index], name: e.target.value };
                            setFormData({...formData, specifications: newSpecs});
                          }}
                          placeholder="Nombre (ej: Marca, Material)"
                          className="h-9"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label htmlFor={`spec-value-${index}`} className="sr-only">
                          Valor
                        </Label>
                        <Input
                          id={`spec-value-${index}`}
                          value={spec.value}
                          onChange={(e) => {
                            const newSpecs = [...formData.specifications];
                            newSpecs[index] = { ...newSpecs[index], value: e.target.value };
                            setFormData({...formData, specifications: newSpecs});
                          }}
                          placeholder="Valor (ej: Sony, Aluminio)"
                          className="h-9"
                        />
                      </div>
                      <div className="flex justify-end">
                        {formData.specifications.length > 1 && (
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              const newSpecs = [...formData.specifications];
                              newSpecs.splice(index, 1);
                              setFormData({...formData, specifications: newSpecs});
                            }}
                            className="h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Colores */}
              <div className="space-y-4 md:col-span-2">
                <div 
                  className="flex items-center justify-between cursor-pointer" 
                  onClick={() => {
                    // Toggle a DOM class for expanding/collapsing
                    const element = document.getElementById('colorsSection');
                    if (element) {
                      element.classList.toggle('hidden');
                    }
                    // Toggle the rotation of the chevron
                    const chevron = document.getElementById('colorsChevron');
                    if (chevron) {
                      chevron.classList.toggle('rotate-180');
                    }
                  }}
                >
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <div className="p-1 bg-purple-50 rounded">
                      <div className="h-4 w-4 rounded-full bg-gradient-to-r from-pink-500 to-violet-500"></div>
                    </div>
                    Colores Disponibles
                    <span className="text-xs text-gray-500">(Opcional)</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the parent onClick from firing
                        setFormData({
                          ...formData, 
                          colors: [...formData.colors, { name: '', hexCode: '#000000', image: '' }]
                        })
                      }}
                      className="flex items-center gap-1 text-xs h-7"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Añadir color
                    </Button>
                    <ChevronDown id="colorsChevron" className="h-4 w-4 text-gray-500 transition-transform" />
                  </div>
                </div>
                
                <div id="colorsSection" className="space-y-6 border rounded-lg p-6 bg-white shadow-sm">
                  {formData.colors.map((color, index) => (
                    <div key={index} className="relative bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-all">
                      {/* Botón eliminar en la esquina */}
                      {formData.colors.length > 0 && (
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            const newColors = [...formData.colors];
                            newColors.splice(index, 1);
                            setFormData({...formData, colors: newColors});
                          }}
                          className="absolute top-2 right-2 h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 z-10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Información del color */}
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs font-semibold text-gray-600 mb-2 block">Nombre del Color</Label>
                            <Input
                              value={color.name}
                              onChange={(e) => {
                                const newColors = [...formData.colors];
                                newColors[index] = { ...newColors[index], name: e.target.value };
                                setFormData({...formData, colors: newColors});
                              }}
                              placeholder="Ej: Rojo, Azul, Negro"
                              className="h-11"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-xs font-semibold text-gray-600 mb-2 block">Código de Color</Label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={color.hexCode}
                                onChange={(e) => {
                                  const newColors = [...formData.colors];
                                  newColors[index] = { ...newColors[index], hexCode: e.target.value };
                                  setFormData({...formData, colors: newColors});
                                }}
                                className="w-14 h-11 rounded-lg border-2 border-gray-300 cursor-pointer hover:border-purple-400 transition-colors"
                              />
                              <Input
                                value={color.hexCode}
                                onChange={(e) => {
                                  const newColors = [...formData.colors];
                                  newColors[index] = { ...newColors[index], hexCode: e.target.value };
                                  setFormData({...formData, colors: newColors});
                                }}
                                placeholder="#000000"
                                className="h-11 flex-1"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Imagen del color */}
                        <div className="md:col-span-2">
                          <Label className="text-xs font-semibold text-gray-600 mb-2 block">Imagen del Producto en este Color</Label>
                          <ImageUploader
                            value={color.image}
                            onChange={(url) => {
                              const newColors = [...formData.colors];
                              newColors[index] = { ...newColors[index], image: url };
                              setFormData({...formData, colors: newColors});
                            }}
                            folder="products/colors"
                            maxSizeMB={3}
                            aspectRatio="aspect-square"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {formData.colors.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No hay colores definidos. Utiliza el botón "Añadir color" para agregar opciones de colores al producto.
                    </div>
                  )}
                </div>
              </div>
              </div>
              )}
            </div>
              
            {/* Sección: Beneficios y Garantías - Colapsable */}
            <div className="space-y-6 bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div 
                className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 cursor-pointer hover:from-amber-100 hover:to-orange-100 transition-all"
                onClick={() => setSectionsOpen({...sectionsOpen, benefits: !sectionsOpen.benefits})}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Beneficios y Garantías</h3>
                  <Badge variant="outline" className="bg-amber-100 text-amber-700">Opcional</Badge>
                </div>
                <ChevronDown className={cn(
                  "h-5 w-5 text-gray-600 transition-transform duration-300",
                  sectionsOpen.benefits && "rotate-180"
                )} />
              </div>
              
              {sectionsOpen.benefits && (
              <div className="p-6 space-y-6">

              {/* Beneficios del Producto */}
              <div className="space-y-4">
                <div 
                  className="flex items-center justify-between cursor-pointer" 
                  onClick={() => {
                    // Toggle a DOM class for expanding/collapsing
                    const element = document.getElementById('benefitsSection');
                    if (element) {
                      element.classList.toggle('hidden');
                    }
                    // Toggle the rotation of the chevron
                    const chevron = document.getElementById('benefitsChevron');
                    if (chevron) {
                      chevron.classList.toggle('rotate-180');
                    }
                  }}
                >
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <div className="p-1 bg-green-50 rounded">
                      <Award className="h-4 w-4 text-green-600" />
                    </div>
                    Beneficios del Producto
                    <span className="text-xs text-gray-500">(Opcional)</span>
                    <Badge variant="outline" className="ml-2 py-0 px-2 text-xs">
                      {formData.benefits.length} seleccionados
                    </Badge>
                  </Label>
                  <ChevronDown id="benefitsChevron" className="h-4 w-4 text-gray-500 transition-transform" />
                </div>
                
                <div id="benefitsSection" className="border rounded-lg p-4 bg-slate-50">
                  <div className="flex flex-wrap gap-2">
                    {predefinedBenefits.map((benefit) => (
                      <Badge 
                        key={benefit} 
                        variant={formData.benefits.includes(benefit) ? "default" : "outline"}
                        className={`cursor-pointer py-1.5 px-3 ${
                          formData.benefits.includes(benefit) 
                            ? "bg-green-500 hover:bg-green-600" 
                            : "hover:bg-slate-100"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent the parent onClick from firing
                          if (formData.benefits.includes(benefit)) {
                            setFormData({
                              ...formData,
                              benefits: formData.benefits.filter(b => b !== benefit)
                            });
                          } else {
                            setFormData({
                              ...formData,
                              benefits: [...formData.benefits, benefit]
                            });
                          }
                        }}
                      >
                        {formData.benefits.includes(benefit) && (
                          <Check className="h-3.5 w-3.5 mr-1" />
                        )}
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Garantías del Producto */}
              <div className="space-y-4 md:col-span-2">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => {
                    // Toggle a DOM class for expanding/collapsing
                    const element = document.getElementById('warrantiesSection');
                    if (element) {
                      element.classList.toggle('hidden');
                    }
                    // Toggle the rotation of the chevron
                    const chevron = document.getElementById('warrantiesChevron');
                    if (chevron) {
                      chevron.classList.toggle('rotate-180');
                    }
                  }}
                >
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <div className="p-1 bg-blue-50 rounded">
                      <ShieldCheck className="h-4 w-4 text-blue-600" />
                    </div>
                    Garantías y Respaldo
                    <span className="text-xs text-gray-500">(Opcional)</span>
                    <Badge variant="outline" className="ml-2 py-0 px-2 text-xs">
                      {formData.warranties.length} seleccionados
                    </Badge>
                  </Label>
                  <ChevronDown id="warrantiesChevron" className="h-4 w-4 text-gray-500 transition-transform" />
                </div>
                
                <div id="warrantiesSection" className="border rounded-lg p-4 bg-slate-50">
                  <div className="flex flex-wrap gap-2">
                    {predefinedWarranties.map((warranty) => (
                      <Badge 
                        key={warranty} 
                        variant={formData.warranties.includes(warranty) ? "default" : "outline"}
                        className={`cursor-pointer py-1.5 px-3 ${
                          formData.warranties.includes(warranty) 
                            ? "bg-blue-500 hover:bg-blue-600" 
                            : "hover:bg-slate-100"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent the parent onClick from firing
                          if (formData.warranties.includes(warranty)) {
                            setFormData({
                              ...formData,
                              warranties: formData.warranties.filter(w => w !== warranty)
                            });
                          } else {
                            setFormData({
                              ...formData,
                              warranties: [...formData.warranties, warranty]
                            });
                          }
                        }}
                      >
                        {formData.warranties.includes(warranty) && (
                          <Check className="h-3.5 w-3.5 mr-1" />
                        )}
                        {warranty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Métodos de Pago */}
              <div className="space-y-4 md:col-span-2">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => {
                    // Toggle a DOM class for expanding/collapsing
                    const element = document.getElementById('paymentMethodsSection');
                    if (element) {
                      element.classList.toggle('hidden');
                    }
                    // Toggle the rotation of the chevron
                    const chevron = document.getElementById('paymentMethodsChevron');
                    if (chevron) {
                      chevron.classList.toggle('rotate-180');
                    }
                  }}
                >
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <div className="p-1 bg-cyan-50 rounded">
                      <CreditCard className="h-4 w-4 text-cyan-600" />
                    </div>
                    Métodos de Pago Aceptados
                    <span className="text-xs text-gray-500">(Opcional)</span>
                    <Badge variant="outline" className="ml-2 py-0 px-2 text-xs">
                      {formData.paymentMethods.length} seleccionados
                    </Badge>
                  </Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the parent onClick from firing
                        setFormData({
                          ...formData, 
                          paymentMethods: [...formData.paymentMethods, '']
                        })
                      }}
                      className="flex items-center gap-1 text-xs h-7"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Añadir método
                    </Button>
                    <ChevronDown id="paymentMethodsChevron" className="h-4 w-4 text-gray-500 transition-transform" />
                  </div>
                </div>
                
                <div id="paymentMethodsSection" className="space-y-3 border rounded-lg p-4 bg-gray-50">
                  {/* Lista predefinida */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {predefinedPaymentMethods.map((method) => (
                      <Badge 
                        key={method} 
                        variant={formData.paymentMethods.includes(method) ? "default" : "outline"}
                        className={`cursor-pointer py-1.5 px-3 ${
                          formData.paymentMethods.includes(method) 
                            ? "bg-cyan-500 hover:bg-cyan-600" 
                            : "hover:bg-slate-100"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent the parent onClick from firing
                          if (formData.paymentMethods.includes(method)) {
                            setFormData({
                              ...formData,
                              paymentMethods: formData.paymentMethods.filter(m => m !== method)
                            });
                          } else {
                            setFormData({
                              ...formData,
                              paymentMethods: [...formData.paymentMethods, method]
                            });
                          }
                        }}
                      >
                        {formData.paymentMethods.includes(method) && (
                          <Check className="h-3.5 w-3.5 mr-1" />
                        )}
                        {method}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Métodos personalizados */}
                  {formData.paymentMethods
                    .filter(method => !predefinedPaymentMethods.includes(method))
                    .map((method, index) => (
                      <div key={`custom-${index}`} className="flex items-center gap-2">
                        <Input
                          value={method}
                          onChange={(e) => {
                            const newMethods = [...formData.paymentMethods];
                            const customIndex = formData.paymentMethods.findIndex(m => m === method);
                            if (customIndex >= 0) {
                              newMethods[customIndex] = e.target.value;
                              setFormData({...formData, paymentMethods: newMethods});
                            }
                          }}
                          placeholder="Método de pago personalizado"
                          className="h-10"
                          onClick={(e) => e.stopPropagation()} // Prevent the section from collapsing when clicking on the input
                        />
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent the parent onClick from firing
                            setFormData({
                              ...formData, 
                              paymentMethods: formData.paymentMethods.filter(m => m !== method)
                            });
                          }}
                          className="h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  }
                </div>
              </div>
              </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-8 mt-8 border-t-2 border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                size="lg"
                className="bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 text-purple-700 border-purple-200 shadow-md"
                onClick={() => {
                  setFormData({
                    ...formData,
                    name: "Producto de Prueba",
                    price: "4444",
                    cost: "3000",
                    stock: "50",
                    description: "Hola, este es un producto con datos de prueba.",
                    isPublished: true
                  });
                }}
              >
                <Wand2 className="h-5 w-5 mr-2" />
                Auto-Rellenar
              </Button>
              
              <div className="flex gap-3">
                {isEditing && (
                  <Button 
                    type="button" 
                    variant="outline"
                    size="lg"
                    onClick={resetForm}
                    className="border-gray-300 hover:bg-gray-100 shadow-md"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Cancelar
                  </Button>
                )}
                <Button 
                  type="submit" 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl px-8"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {isEditing && liberta !== "si" 
                    ? 'Enviar Cambios a Revisión' 
                    : isEditing 
                      ? 'Actualizar Producto' 
                      : liberta !== "si" 
                        ? 'Enviar Producto a Revisión' 
                        : 'Agregar Producto'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
        )}
      </Card>

      {/* Resumen de Costos Mensuales */}
      {user && liberta === "si" && (
        <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Calendar className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="text-indigo-700">Resumen de Costos de Inventario</span>
            </CardTitle>
            <CardDescription className="text-indigo-700/70">
              Análisis de costos basado en los productos actuales y su stock
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isLoadingCosts ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                <span className="ml-2 text-indigo-600">Calculando costos...</span>
              </div>
            ) : !monthlyCostData ? (
              <div className="flex items-center justify-center py-6">
                <Button 
                  onClick={() => calculateMonthlyCostSummary()} 
                  variant="outline" 
                  className="bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Calcular Costos del Mes
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
                    <div className="text-sm text-indigo-600 mb-1">Periodo</div>
                    <div className="text-xl font-bold">{monthlyCostData.month} {monthlyCostData.year}</div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100">
                    <div className="text-sm text-green-600 mb-1">Costo Total de Inventario</div>
                    <div className="text-xl font-bold text-green-700">
                      ${monthlyCostData.totalCost.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                    <div className="text-sm text-blue-600 mb-1">Productos con Costo Registrado</div>
                    <div className="text-xl font-bold text-blue-700">
                      {monthlyCostData.totalProducts}
                    </div>
                  </div>
                </div>
                
                {monthlyCostData.breakdown.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-indigo-100">
                    <div className="p-4 border-b border-indigo-100">
                      <h3 className="font-semibold text-indigo-800">Costos por Categoría</h3>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                        {monthlyCostData.breakdown.map((item, index) => (
                          <div 
                            key={index} 
                            className="flex justify-between items-center p-2 rounded-md hover:bg-indigo-50 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <Tags className="h-4 w-4 text-indigo-600" />
                              <span>{item.category}</span>
                              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 text-xs">
                                {item.count} productos
                              </Badge>
                            </div>
                            <span className="font-semibold text-green-600">
                              ${item.cost.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-b-lg border-t border-indigo-100">
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs bg-white text-indigo-700"
                          onClick={() => calculateMonthlyCostSummary()}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Actualizar datos
                        </Button>
                        <div className="text-xs text-indigo-600">
                          <span>Última actualización: {new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Separator className="my-8" />

      {/* Lista de productos existentes */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-blue-700">Inventario de Productos ({sortedProducts.length})</span>
              </CardTitle>
              <Button
                onClick={() => {
                  setIsFormOpen(true);
                  setTimeout(() => {
                    document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Filtro por categoría */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 px-3 gap-1 text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100">
                    <Filter className="h-4 w-4" />
                    <span>Categoría</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 max-h-[300px] overflow-y-auto">
                  <DropdownMenuItem onClick={() => setSelectedCategory('')} className={!selectedCategory ? 'bg-blue-50 text-blue-700' : ''}>
                    <span className="h-4 w-4 mr-2 opacity-70">🏠</span> Todas las categorías
                  </DropdownMenuItem>
                  {categories
                    .filter(category => !category.parentId)
                    .map((category) => (
                      <DropdownMenuItem 
                        key={category.id} 
                        onClick={() => setSelectedCategory(category.id)}
                        className={selectedCategory === category.id ? 'bg-blue-50 text-blue-700' : ''}
                      >
                        <Tags className="h-4 w-4 mr-2 opacity-70" /> {category.name}
                      </DropdownMenuItem>
                    ))
                  }
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Ordenamiento */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 px-3 gap-1 text-sky-700 border-sky-200 bg-sky-50 hover:bg-sky-100">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span>Ordenar por</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setSortOrder('recent')} className={sortOrder === 'recent' ? 'bg-sky-50 text-sky-700' : ''}>
                    <CustomClock className="h-4 w-4 mr-2 opacity-70" /> Más recientes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder('oldest')} className={sortOrder === 'oldest' ? 'bg-sky-50 text-sky-700' : ''}>
                    <History className="h-4 w-4 mr-2 opacity-70" /> Más antiguos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder('name-asc')} className={sortOrder === 'name-asc' ? 'bg-sky-50 text-sky-700' : ''}>
                    <Tags className="h-4 w-4 mr-2 opacity-70" /> Nombre (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder('name-desc')} className={sortOrder === 'name-desc' ? 'bg-sky-50 text-sky-700' : ''}>
                    <Tags className="h-4 w-4 mr-2 opacity-70" /> Nombre (Z-A)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder('price-high')} className={sortOrder === 'price-high' ? 'bg-sky-50 text-sky-700' : ''}>
                    <CreditCard className="h-4 w-4 mr-2 opacity-70" /> Precio (Mayor a menor)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder('price-low')} className={sortOrder === 'price-low' ? 'bg-sky-50 text-sky-700' : ''}>
                    <CreditCard className="h-4 w-4 mr-2 opacity-70" /> Precio (Menor a mayor)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Indicador de filtro activo */}
              {selectedCategory && (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 gap-1">
                  {categories.find(cat => cat.id === selectedCategory)?.name || "Categoría"}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSelectedCategory('')}
                    className="h-4 w-4 p-0 ml-1 hover:bg-blue-200 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          </div>
          
          <div className="relative mt-4">
            <div className="flex items-center bg-white border rounded-lg overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 transition-all">
              <div className="pl-3 py-2">
                <Search className="h-5 w-5 text-sky-500" />
              </div>
              <Input 
                placeholder="Buscar por nombre, descripción, categoría o precio" 
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-10 flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSearchTerm('')}
                  className="h-8 w-8 mr-1 rounded-full hover:bg-sky-50 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loadingProducts ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center text-sky-600">
                <Loader2 className="h-10 w-10 animate-spin mb-2" />
                <p className="text-sm font-medium">Cargando productos...</p>
              </div>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-10 bg-sky-50/50 rounded-lg border border-dashed border-sky-200">
              <div className="flex flex-col items-center">
                <Package className="h-12 w-12 text-sky-300 mb-3" />
                <p className="text-sky-700 font-medium">No se encontraron productos</p>
                {searchTerm ? (
                  <p className="text-sm text-sky-600/70 mt-1">Prueba con otros términos de búsqueda</p>
                ) : selectedCategory ? (
                  <p className="text-sm text-sky-600/70 mt-1">No hay productos en esta categoría</p>
                ) : (
                  <p className="text-sm text-sky-600/70 mt-1">Añade tu primer producto</p>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-4">
                {paginatedProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock);
                  return (
                  <div key={product.id} className="flex items-center justify-between p-5 border rounded-xl hover:shadow-lg transition-all duration-200 hover:border-sky-200 bg-white">
                    <div className="flex items-center gap-5">
                      <div className="relative w-20 h-20">
                        {loadingImages[product.id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
                            <Loader2 className="h-5 w-5 text-sky-600 animate-spin" />
                          </div>
                        )}
                        <img
                          src={product.image}
                          alt={product.name}
                          className={cn(
                            "w-20 h-20 object-cover rounded-xl shadow-md transition-opacity duration-300",
                            loadingImages[product.id] ? "opacity-0" : "opacity-100"
                          )}
                          onLoad={() => handleImageLoadEnd(product.id)}
                          onError={(e) => {
                            handleImageLoadEnd(product.id);
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                          onLoadStart={() => handleImageLoadStart(product.id)}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{product.name}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="font-medium bg-orange-50 text-orange-700 border-orange-200">
                              <span className="text-xs text-gray-500 mr-1">Categoría:</span> {product.categoryName || product.category}
                            </Badge>
                            {product.subcategoryName && (
                              <div className="flex items-center">
                                <svg className="h-3 w-3 text-gray-400 mx-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                <Badge variant="outline" className="font-medium bg-blue-50 text-blue-700 border-blue-200">
                                  <span className="text-xs text-gray-500 mr-1">Subcategoría:</span> {product.subcategoryName}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <span className="text-lg font-bold text-green-600">
                            ${product.price.toLocaleString()}
                            {product.cost && liberta === "si" && (
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <span>Costo: </span>
                                <span className="text-amber-700 font-medium">${Number(product.cost).toLocaleString()}</span>
                                {product.price && product.cost && (
                                  <Badge variant="outline" className="ml-1 text-[10px] h-5 bg-green-50 text-green-700 border-green-200">
                                    {Math.round(((Number(product.price) - Number(product.cost)) / Number(product.price)) * 100)}% margen
                                  </Badge>
                                )}
                              </div>
                            )}
                          </span>
                          <Badge className={cn(
                            stockStatus.color, 
                            "flex items-center gap-1"
                          )}>
                            <span className={cn(
                              "w-2 h-2 rounded-full",
                              stockStatus.text === "En Stock" ? "bg-green-400" : 
                              stockStatus.text === "Stock Bajo" ? "bg-yellow-400" : 
                              "bg-red-400"
                            )}></span>
                            {stockStatus.text}: {product.stock}
                          </Badge>
                          <Badge className={cn(
                            "flex items-center gap-1",
                            product.isPublished !== false 
                              ? "bg-green-100 text-green-800 hover:bg-green-200" 
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          )}>
                            <Eye className="h-3 w-3" />
                            {product.isPublished !== false ? "Publicado" : "No publicado"}
                          </Badge>
                          {product.lastModified && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 ml-2">
                              <CustomClock className="h-3 w-3 mr-1 opacity-70" />
                              {new Date(product.lastModified.toDate?.() || product.lastModified).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(product)}
                              className="hover:bg-blue-50 hover:border-blue-300 transition-colors text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="bg-blue-600">
                            <p className="text-xs">{liberta === "si" ? "Editar producto" : "Enviar cambios a revisión"}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const newWindow = window.open(`/producto/${product.id}`, '_blank');
                                newWindow?.focus();
                              }}
                              className="hover:bg-sky-50 hover:border-sky-300 transition-colors text-sky-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="bg-sky-600">
                            <p className="text-xs">Ver producto</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                              {liberta === "si" ? "¿Eliminar producto?" : "¿Enviar solicitud de eliminación?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {liberta === "si" ? 
                                `Esta acción es irreversible y eliminará el producto "${product.name}" del sistema.` :
                                `Se enviará una solicitud para eliminar el producto "${product.name}" que requerirá aprobación del administrador.`
                              }
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(product.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              {liberta === "si" ? "Eliminar" : "Enviar solicitud"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMoreProducts && (
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={loadMoreProducts} 
                  variant="outline" 
                  className="border-sky-200 text-sky-700 hover:bg-sky-50"
                  disabled={loadingMoreProducts}
                >
                  {loadingMoreProducts ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Cargar más productos
                    </>
                  )}
                </Button>
              </div>
            )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
