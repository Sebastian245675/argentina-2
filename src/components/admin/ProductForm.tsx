import React, { useEffect, useState, useMemo, useRef } from 'react';
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
  ShieldCheck, Award, Wand2, ChevronDown, Calendar, Clock, Filter, RefreshCw, Tags, History, 
  SlidersHorizontal, Loader2, Eye
} from 'lucide-react';
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
import { collection, addDoc, getDocs, updateDoc, doc, setDoc, getDoc, query, orderBy, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";

export const ProductForm: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
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
    colors: [] as { name: string, hexCode: string, image: string }[]
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
      const querySnapshot = await getDocs(collection(db, "products"));
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingProducts(false);
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
            setLiberta("yes");
          } else {
            const adminDoc = await getDoc(doc(db, "admins", user.email));
            if (adminDoc.exists() && adminDoc.data().liberta === "yes") {
              setLiberta("yes");
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
    
    const numericPrice = parseFloat(formData.price);
    const numericStock = parseInt(formData.stock, 10);
    
    if (isNaN(numericPrice) || isNaN(numericStock)) {
      toast({
        variant: "destructive",
        title: "Error al guardar producto",
        description: "El precio y stock deben ser valores numéricos."
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
      stock: numericStock,
      originalPrice: formData.isOffer ? parseFloat(formData.originalPrice) : numericPrice,
      discount: formData.isOffer ? parseFloat(formData.discount) : 0,
      isOffer: formData.isOffer,
      categoryName, // Agregar nombres descriptivos
      subcategoryName,
      terceraCategoriaName,
      lastModified: new Date(),
    };
    
    try {
      if (isEditing && editingId) {
        // Si liberta="no", los cambios van a revisión
        if (liberta === "no") {
          await addDoc(collection(db, "revisiones"), {
            type: "edit",
            originalId: editingId,
            productData: productData,
            status: "pendiente",
            createdAt: new Date(),
            editorEmail: user?.email || "unknown"
          });
          
          toast({
            title: "Cambios enviados a revisión",
            description: "Los cambios han sido enviados para aprobación del administrador."
          });
          resetForm();
        } else {
          // Si tiene libertad, actualiza directamente
          await updateDoc(doc(db, "products", editingId), productData);
          toast({
            title: "Producto actualizado",
            description: "El producto ha sido actualizado exitosamente."
          });
          resetForm();
          
          // Actualizar la lista de productos
          const updatedProducts = products.map(product => 
            product.id === editingId ? { id: editingId, ...productData } : product
          );
          setProducts(updatedProducts);
        }
      } else {
        // Si liberta="no", los cambios van a revisión
        if (liberta === "no") {
          await addDoc(collection(db, "revisiones"), {
            type: "add",
            productData: productData,
            status: "pendiente",
            createdAt: new Date(),
            editorEmail: user?.email || "unknown"
          });
          
          toast({
            title: "Producto enviado a revisión",
            description: "El producto ha sido enviado para aprobación del administrador."
          });
          resetForm();
        } else {
          // Si tiene libertad, crea directamente
          const docRef = await addDoc(collection(db, "products"), productData);
          toast({
            title: "Producto agregado",
            description: "El producto ha sido agregado exitosamente."
          });
          resetForm();
          
          // Actualizar la lista de productos
          setProducts([...products, { id: docRef.id, ...productData }]);
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
    
    // Convertir valores numéricos a string para el formulario
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: String(product.price) || '',
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
      colors: product.colors || []
    });
    
    // Scroll al formulario
    document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (productId: string) => {
    try {
      if (liberta === "yes") {
        // Si tiene libertad, elimina directamente
        await setDoc(doc(db, "products", productId), {
          deleted: true,
          deletedAt: new Date(),
          deletedBy: user?.email || "unknown"
        }, { merge: true });
        
        toast({
          title: "Producto eliminado",
          description: "El producto ha sido eliminado exitosamente."
        });
        
        // Actualizar la lista de productos (no mostramos los marcados como eliminados)
        setProducts(products.filter(product => product.id !== productId));
      } else {
        // Si no tiene libertad, envía a revisión
        await addDoc(collection(db, "revisiones"), {
          type: "delete",
          productId: productId,
          status: "pendiente",
          createdAt: new Date(),
          editorEmail: user?.email || "unknown"
        });
        
        toast({
          title: "Solicitud enviada a revisión",
          description: "La solicitud de eliminación ha sido enviada para aprobación del administrador."
        });
      }
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
    setFormData({
      name: '',
      description: '',
      price: '',
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
      colors: []
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock > 10) {
      return { text: "En Stock", color: "bg-green-100 text-green-800 hover:bg-green-200" };
    } else if (stock > 0) {
      return { text: "Stock Bajo", color: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" };
    } else {
      return { text: "Agotado", color: "bg-red-100 text-red-800 hover:bg-red-200" };
    }
  };

  // State for sorting
  const [sortOrder, setSortOrder] = useState<'recent' | 'oldest' | 'price-high' | 'price-low' | 'name-asc' | 'name-desc'>('recent');
  
  // Filter products based on search term and category
  const filteredProducts = useMemo(() => {
    let filtered = [...products];
    
    // Filter by search term if present
    if (searchTerm.trim()) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(product => 
        (product.name && product.name.toLowerCase().includes(lowercasedTerm)) || 
        (product.description && product.description.toLowerCase().includes(lowercasedTerm)) ||
        (product.category && product.category.toLowerCase().includes(lowercasedTerm)) ||
        (product.price && String(product.price).includes(lowercasedTerm))
      );
    }
    
    // Filter by category if selected
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.category === selectedCategory ||
        product.subcategory === selectedCategory ||
        product.terceraCategoria === selectedCategory
      );
    }
    
    return filtered;
  }, [searchTerm, selectedCategory, products]);
  
  // Sort products based on selected order
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortOrder) {
        case 'recent':
          // Handle timestamps or fallback to Date objects or current time as default
          const bModified = b.lastModified?.toDate?.() || b.updatedAt || new Date();
          const aModified = a.lastModified?.toDate?.() || a.updatedAt || new Date();
          return bModified.getTime() - aModified.getTime();
        case 'oldest':
          const aModifiedOld = a.lastModified?.toDate?.() || a.updatedAt || new Date();
          const bModifiedOld = b.lastModified?.toDate?.() || b.updatedAt || new Date();
          return aModifiedOld.getTime() - bModifiedOld.getTime();
        case 'price-high':
          return (parseFloat(String(b.price)) || 0) - (parseFloat(String(a.price)) || 0);
        case 'price-low':
          return (parseFloat(String(a.price)) || 0) - (parseFloat(String(b.price)) || 0);
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        default:
          return 0;
      }
    });
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

  // Initialize expandable sections based on form data
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
      {/* Aviso si no tiene libertad */}
      {liberta === "no" && (
        <div className="p-4 mb-4 bg-sky-100 border-l-4 border-sky-400 text-sky-800 rounded-lg shadow-sm">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-sky-600" />
            <p className="font-medium">Tu cuenta no tiene permisos para publicar cambios directos. Los cambios que realices serán enviados a revisión del administrador.</p>
          </div>
        </div>
      )}

      {/* Formulario para agregar/editar productos */}
      <Card id="product-form" className="shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-t-lg border-b border-sky-100">
          <CardTitle className="flex items-center gap-3 text-lg">
            {isEditing ? (
              <>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Edit className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-blue-700">Editar Producto</span>
              </>
            ) : (
              <>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-green-700">Agregar Nuevo Producto</span>
              </>
            )}
          </CardTitle>
          <CardDescription className="text-sky-700/70">
            Complete todos los campos requeridos para {isEditing ? 'actualizar' : 'crear'} un producto
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">
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
                  Precio <span className="text-red-500">*</span>
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
                <Label htmlFor="description" className="text-sm font-semibold">
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
              
              <div className="space-y-2">
                <Label htmlFor="image" className="text-sm font-semibold flex items-center">
                  Imagen Principal
                  <div className="ml-1 px-2 py-0.5 bg-sky-50 text-sky-600 rounded-full text-xs font-medium">URL</div>
                </Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="h-11"
                />
                {formData.image && (
                  <div className="mt-2 w-full max-w-[120px] h-[80px] rounded-md overflow-hidden border shadow-sm">
                    <img 
                      src={formData.image} 
                      alt="Vista previa" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/120x80?text=Error';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Oferta */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-medium">
                    Oferta
                  </Badge>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isOffer"
                      checked={formData.isOffer}
                      onChange={(e) => setFormData({...formData, isOffer: e.target.checked})}
                      className="w-4 h-4 rounded text-sky-600"
                    />
                    <span className="text-sm text-gray-500">Activar oferta</span>
                  </div>
                </Label>
                
                {formData.isOffer && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <Label htmlFor="originalPrice" className="text-sm text-gray-500">
                        Precio original
                      </Label>
                      <Input
                        id="originalPrice"
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                        placeholder="Ej: 15000"
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label htmlFor="discount" className="text-sm text-gray-500">
                        Descuento (%)
                      </Label>
                      <Input
                        id="discount"
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData({...formData, discount: e.target.value})}
                        placeholder="Ej: 20"
                        className="h-10"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Imágenes adicionales */}
              <div className="space-y-4 md:col-span-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <div className="p-1 bg-blue-50 rounded">
                    <Image className="h-4 w-4 text-blue-600" />
                  </div>
                  Imágenes Adicionales
                  <span className="text-xs text-gray-500">(Opcional)</span>
                </Label>
                
                <div className="grid gap-4">
                  {formData.additionalImages.map((url, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Input
                        value={url}
                        onChange={(e) => {
                          const newImages = [...formData.additionalImages];
                          newImages[index] = e.target.value;
                          setFormData({...formData, additionalImages: newImages});
                        }}
                        placeholder={`URL de imagen adicional ${index + 1}`}
                        className="h-10 flex-1"
                      />
                      
                      {url && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden border border-gray-200">
                          <img 
                            src={url} 
                            alt={`Imagen adicional ${index + 1}`} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Especificaciones */}
              <div className="space-y-4 md:col-span-2">
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
                
                <div id="colorsSection" className="space-y-4 border rounded-lg p-4 bg-gray-50">
                  {formData.colors.map((color, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-center">
                      {/* Nombre del color */}
                      <div className="sm:col-span-2">
                        <Input
                          value={color.name}
                          onChange={(e) => {
                            const newColors = [...formData.colors];
                            newColors[index] = { ...newColors[index], name: e.target.value };
                            setFormData({...formData, colors: newColors});
                          }}
                          placeholder="Nombre del color"
                          className="h-10"
                        />
                      </div>
                      
                      {/* Código Hex */}
                      <div className="flex items-center gap-2">
                        <div>
                          <input
                            type="color"
                            value={color.hexCode}
                            onChange={(e) => {
                              const newColors = [...formData.colors];
                              newColors[index] = { ...newColors[index], hexCode: e.target.value };
                              setFormData({...formData, colors: newColors});
                            }}
                            className="w-10 h-10 rounded border border-gray-200 p-1 bg-white"
                          />
                        </div>
                        <div>
                          <Input
                            value={color.hexCode}
                            onChange={(e) => {
                              const newColors = [...formData.colors];
                              newColors[index] = { ...newColors[index], hexCode: e.target.value };
                              setFormData({...formData, colors: newColors});
                            }}
                            placeholder="#000000"
                            className="h-10 w-24"
                          />
                        </div>
                      </div>
                    
                      {/* URL de la imagen para este color */}
                      <div className="sm:col-span-3">
                        <div className="flex items-center gap-2">
                          <Input
                            value={color.image}
                            onChange={(e) => {
                              const newColors = [...formData.colors];
                              newColors[index] = { ...newColors[index], image: e.target.value };
                              setFormData({...formData, colors: newColors});
                            }}
                            placeholder="URL de imagen para este color"
                            className="h-10"
                          />
                          
                          {/* Previsualización de la imagen */}
                          {color.image && (
                            <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden border border-gray-200">
                              <img 
                                src={color.image} 
                                alt={`Color ${color.name}`} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          
                          {/* Botón para eliminar este color */}
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
                              className="h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
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
              
              {/* Beneficios del Producto */}
              <div className="space-y-4 md:col-span-2">
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

            <div className="flex gap-3 pt-6 mt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                onClick={() => {
                  setFormData({
                    ...formData,
                    name: "Indefinido",
                    price: "4444",
                    stock: "50",
                    description: "Hola, este es un producto con datos de prueba."
                  });
                }}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Auto-Rellenar
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:opacity-90 transition-all shadow-lg"
                disabled={liberta === "no" && isEditing} // Solo permite agregar, no editar directo
              >
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Actualizar Producto' : 'Agregar Producto'}
              </Button>
              {isEditing && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Lista de productos existentes */}
      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-blue-700">Inventario de Productos ({sortedProducts.length})</span>
            </CardTitle>
            
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
                    <Clock className="h-4 w-4 mr-2 opacity-70" /> Más recientes
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
                            e.currentTarget.src = 'https://via.placeholder.com/80?text=No+Image';
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
                          {product.lastModified && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 ml-2">
                              <Clock className="h-3 w-3 mr-1 opacity-70" />
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
                              disabled={liberta === "no"}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="bg-blue-600">
                            <p className="text-xs">Editar producto</p>
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
                                const newWindow = window.open(product.image, '_blank');
                                newWindow?.focus();
                              }}
                              className="hover:bg-sky-50 hover:border-sky-300 transition-colors text-sky-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="bg-sky-600">
                            <p className="text-xs">Ver imagen</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                            disabled={liberta === "no"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                              ¿Eliminar producto?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción es irreversible y eliminará el producto <strong>"{product.name}"</strong> del sistema.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(product.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={liberta === "no"}
                            >
                              Eliminar
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
