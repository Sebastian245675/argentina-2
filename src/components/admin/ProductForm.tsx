import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { Plus, Package, Edit, Trash2, Search, Save, X, Image, AlertTriangle, Check, CreditCard, ShieldCheck, Award, Wand2 } from 'lucide-react';
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
import { collection, addDoc, getDocs, updateDoc, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext"; // Asegúrate de tener acceso al usuario

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
  const [categories, setCategories] = useState<{ id: string; name: string; parentId?: string | null; }[]>([]);
  const { user } = useAuth();
  const [liberta, setLiberta] = useState("si");

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

  const filteredProducts = sampleProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      const querySnapshot = await getDocs(collection(db, "products"));
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingProducts(false);
    };
    fetchProducts();
  }, []);

  // Añadimos un estado para las subcategorías
  const [subcategory, setSubcategory] = useState<string>("");
  
  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const categoriesList = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as { id: string; name: string; parentId?: string | null; }));
      
      setCategories(categoriesList);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchLiberta = async () => {
      if (user && (user as any).email) {
        // Busca el usuario por email en la colección users
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        let foundLiberta = "si";
        querySnapshot.forEach((docu) => {
          const data = docu.data();
          if (data.email === (user as any).email) {
            foundLiberta = data.liberta || "si";
          }
        });
        setLiberta(foundLiberta);
      }
    };
    fetchLiberta();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category || !formData.stock) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    try {
      if (liberta === "si") {
        // Permitir cambios directos
        if (isEditing && editingId) {
          // Filter out empty additional images
          const filteredAdditionalImages = formData.additionalImages.filter(img => img.trim() !== '');
          
          // Filter out empty specifications
          const filteredSpecifications = formData.specifications.filter(
            spec => spec.name.trim() !== '' || spec.value.trim() !== ''
          );
          
          // Filter out colors with empty names
          const filteredColors = formData.colors.filter(
            color => color.name.trim() !== '' && color.image.trim() !== ''
          );
          
          // Obtener los nombres de categoría, subcategoría y tercera categoría para una mejor visualización
          const categoryName = categories.find(cat => cat.id === formData.category)?.name || '';
          const subcategoryName = formData.subcategory ? 
            (categories.find(cat => cat.id === formData.subcategory)?.name || '') : '';
          const terceraCategoriaName = formData.terceraCategoria ? 
            (categories.find(cat => cat.id === formData.terceraCategoria)?.name || '') : '';
          
          await updateDoc(doc(db, "products", editingId), {
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
            isOffer: Boolean(formData.isOffer),
            discount: formData.discount ? Number(formData.discount) : null,
            originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
            additionalImages: filteredAdditionalImages,
            specifications: filteredSpecifications,
            benefits: formData.benefits,
            warranties: formData.warranties,
            paymentMethods: formData.paymentMethods,
            colors: filteredColors,
            // Guardamos tanto el ID como el nombre para facilitar búsquedas y visualización
            categoryName: categoryName,
            subcategoryName: subcategoryName,
            terceraCategoriaName: terceraCategoriaName
          });
          toast({
            title: "✅ Producto actualizado",
            description: `${formData.name} ha sido actualizado exitosamente.`,
          });
        } else {
          // Filter out empty additional images
          const filteredAdditionalImages = formData.additionalImages.filter(img => img.trim() !== '');
          
          // Filter out empty specifications
          const filteredSpecifications = formData.specifications.filter(
            spec => spec.name.trim() !== '' || spec.value.trim() !== ''
          );
          
          // Filter out colors with empty names
          const filteredColors = formData.colors.filter(
            color => color.name.trim() !== '' && color.image.trim() !== ''
          );
          
          // Obtener los nombres de categoría, subcategoría y tercera categoría para una mejor visualización
          const categoryName = categories.find(cat => cat.id === formData.category)?.name || '';
          const subcategoryName = formData.subcategory ? 
            (categories.find(cat => cat.id === formData.subcategory)?.name || '') : '';
          const terceraCategoriaName = formData.terceraCategoria ? 
            (categories.find(cat => cat.id === formData.terceraCategoria)?.name || '') : '';
          
          await addDoc(collection(db, "products"), {
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
            isOffer: Boolean(formData.isOffer),
            discount: formData.discount ? Number(formData.discount) : null,
            originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
            additionalImages: filteredAdditionalImages,
            specifications: filteredSpecifications,
            benefits: formData.benefits,
            warranties: formData.warranties,
            paymentMethods: formData.paymentMethods,
            colors: filteredColors,
            // Guardamos tanto el ID como el nombre para facilitar búsquedas y visualización
            categoryName: categoryName,
            subcategoryName: subcategoryName,
            terceraCategoriaName: terceraCategoriaName,
            createdAt: new Date(),
          });
          toast({
            title: "✅ Producto agregado",
            description: `${formData.name} ha sido agregado exitosamente al inventario.`,
          });
        }
      } else {
        // Siempre enviar a revisión si liberta es "no"
        await addDoc(collection(db, "revision"), {
          type: isEditing ? "edit" : "add",
          data: {
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
            isOffer: Boolean(formData.isOffer),
            discount: formData.discount ? Number(formData.discount) : null,
            originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
            ...(isEditing && { id: editingId }),
          },
          entity: "products",
          userId: (user as any)?.uid || (user as any)?.email || "desconocido",
          createdAt: new Date(),
        });
        toast({
          title: "Solicitud enviada",
          description: "Tu cambio fue enviado para revisión del administrador.",
        });
      }
      resetForm();
    } catch (error) {
      console.error("Error al guardar:", error); // <-- Agrega esto
      toast({
        title: "Error",
        description: "No se pudo guardar el producto. Intenta de nuevo.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      subcategory: '',  // Se mostrará como "none" en la UI
      terceraCategoria: '', // Se mostrará como "none" en la UI cuando no hay tercera categoría
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
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      subcategory: product.subcategory || '',  // Se mostrará como "none" en la UI si está vacío
      terceraCategoria: product.terceraCategoria || '', // Se mostrará como "none" en la UI si está vacío
      stock: product.stock.toString(),
      image: product.image,
      additionalImages: product.additionalImages || ['', '', ''],
      specifications: product.specifications || [{ name: '', value: '' }],
      isOffer: product.isOffer || false,
      discount: product.discount?.toString() || '',
      originalPrice: product.originalPrice?.toString() || '',
      benefits: product.benefits || [],
      warranties: product.warranties || [],
      paymentMethods: product.paymentMethods || [],
      colors: product.colors || []
    });
    setIsEditing(true);
    setEditingId(product.id);
    
    // Scroll suave al formulario
    document.getElementById('product-form')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (liberta === "si") {
      // Eliminar realmente el producto de Firestore
      try {
        await import('firebase/firestore').then(async ({ deleteDoc, doc }) => {
          await deleteDoc(doc(db, "products", productId));
        });
        toast({
          title: "🗑️ Producto eliminado",
          description: `${productName} ha sido eliminado del inventario`,
          variant: "destructive"
        });
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        toast({
          title: "Error al eliminar",
          description: "No se pudo eliminar el producto. Intenta de nuevo.",
          variant: "destructive"
        });
      }
    } else {
      // Enviar solicitud de eliminación a revisión
      await addDoc(collection(db, "revision"), {
        type: "delete",
        data: { id: productId, name: productName },
        entity: "products",
        userId: (user as any)?.uid || (user as any)?.email || "desconocido",
        createdAt: new Date(),
      });
      toast({
        title: "Solicitud enviada",
        description: "La solicitud de eliminación fue enviada para revisión del administrador.",
      });
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'bg-red-100 text-red-800', text: 'Sin stock' };
    if (stock <= 5) return { color: 'bg-yellow-100 text-yellow-800', text: 'Bajo stock' };
    return { color: 'bg-green-100 text-green-800', text: 'En stock' };
  };

  return (
    <div className="space-y-8">
      {/* Aviso si no tiene libertad */}
      {liberta === "no" && (
        <div className="p-4 mb-4 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 rounded">
          Tu cuenta no tiene permisos para publicar cambios directos. Los cambios que realices serán enviados a revisión del administrador.
        </div>
      )}

      {/* Formulario para agregar/editar productos */}
      <Card id="product-form" className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            {isEditing ? (
              <>
                <Edit className="h-6 w-6 text-orange-600" />
                <span className="text-orange-600">Editar Producto</span>
              </>
            ) : (
              <>
                <Plus className="h-6 w-6 text-green-600" />
                <span className="text-green-600">Agregar Nuevo Producto</span>
              </>
            )}
          </CardTitle>
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
                  
                  {/* Tercera categoría (opcional) - solo mostrada si se ha seleccionado una subcategoría */}
                  {formData.subcategory && formData.subcategory !== "none" && (
                    <div className="mt-4 space-y-2">
                      <Label htmlFor="terceraCategoria" className="text-sm font-semibold flex items-center">
                        Tercera categoría <span className="ml-1 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-xs font-medium">Opcional</span>
                      </Label>
                      <Select 
                        value={formData.terceraCategoria || "none"} 
                        onValueChange={(value) => setFormData({...formData, terceraCategoria: value === "none" ? "" : value})}
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
                    </div>
                  )}
                  
                  {/* Mostrar la clasificación completa */}
                  {formData.subcategory && formData.subcategory !== "none" && (
                    <div className="mt-2 text-xs text-blue-600 font-medium">
                      Clasificación: {categories.find(cat => cat.id === formData.category)?.name || ''} 
                      {' > '} 
                      {categories.find(cat => cat.id === formData.subcategory)?.name || ''}
                      {formData.terceraCategoria && formData.terceraCategoria !== "none" && (
                        <>
                          {' > '} 
                          {categories.find(cat => cat.id === formData.terceraCategoria)?.name || ''}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-semibold">
                  Precio (COP) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="3500"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock" className="text-sm font-semibold">
                  Stock Inicial <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  placeholder="50"
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="isOffer" className="text-sm font-semibold flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="isOffer"
                      className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 mr-2"
                      checked={!!formData.isOffer}
                      onChange={(e) => setFormData({
                        ...formData,
                        isOffer: e.target.checked
                      })}
                    />
                    <span>Marcar como oferta</span>
                  </Label>
                </div>
              </div>
              
              {!!formData.isOffer && (
                <div className="space-y-2">
                  <Label htmlFor="discount" className="text-sm font-semibold">
                    Porcentaje de descuento
                  </Label>
                  <div className="flex items-center">
                    <Input
                      id="discount"
                      type="number"
                      min="1"
                      max="99"
                      value={formData.discount || ''}
                      onChange={(e) => {
                        const discount = parseInt(e.target.value);
                        const price = parseFloat(formData.price);
                        // Calcular originalPrice si hay descuento
                        const originalPrice = discount > 0 ? 
                          Math.round(price / (1 - discount/100)) : 
                          price;
                          
                        setFormData({
                          ...formData,
                          discount: e.target.value,
                          originalPrice: originalPrice.toString()
                        });
                      }}
                      placeholder="10"
                      className="h-11 mr-2"
                    />
                    <span className="text-lg font-bold">%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descripción detallada del producto, beneficios, ingredientes..."
                rows={4}
                className="resize-none"
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Especificaciones Técnicas
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
              
              <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={spec.name}
                      onChange={(e) => {
                        const newSpecs = [...formData.specifications];
                        newSpecs[index] = { ...newSpecs[index], name: e.target.value };
                        setFormData({...formData, specifications: newSpecs});
                      }}
                      placeholder="Nombre (ej: Peso, Material)"
                      className="h-10"
                    />
                    <Input
                      value={spec.value}
                      onChange={(e) => {
                        const newSpecs = [...formData.specifications];
                        newSpecs[index] = { ...newSpecs[index], value: e.target.value };
                        setFormData({...formData, specifications: newSpecs});
                      }}
                      placeholder="Valor (ej: 500g, Algodón)"
                      className="h-10"
                    />
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
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-semibold flex items-center gap-2">
                <Image className="h-4 w-4" />
                URL de la Imagen Principal <span className="text-red-500">*</span>
              </Label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                placeholder="https://ejemplo.com/imagen.jpg"
                required
                className="h-11"
              />
              {formData.image && (
                <div className="mt-2">
                  <img 
                    src={formData.image} 
                    alt="Preview" 
                    className="w-20 h-20 object-cover rounded-lg border-2 border-orange-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="mt-6">
                <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
                  <Image className="h-4 w-4" />
                  Imágenes Adicionales (Máximo 3)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formData.additionalImages.map((img, index) => (
                    <div key={index} className="space-y-2">
                      <Input
                        type="url"
                        value={img}
                        onChange={(e) => {
                          const newImages = [...formData.additionalImages];
                          newImages[index] = e.target.value;
                          setFormData({...formData, additionalImages: newImages});
                        }}
                        placeholder={`Imagen adicional ${index + 1}`}
                        className="h-11"
                      />
                      {img && (
                        <div className="mt-2">
                          <img 
                            src={img} 
                            alt={`Preview ${index + 1}`} 
                            className="w-20 h-20 object-cover rounded-lg border-2 border-orange-200"
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
            </div>

            {/* Sección para colores del producto */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Colores del Producto (Opcional)
                </Label>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={() => setFormData({
                    ...formData, 
                    colors: [...formData.colors, { name: '', hexCode: '#ffffff', image: '' }]
                  })}
                  className="flex items-center gap-1 text-xs h-7"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Añadir color
                </Button>
              </div>
              
              <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                {formData.colors.map((color, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    {/* Nombre del color */}
                    <div className="col-span-3">
                      <Input
                        value={color.name}
                        onChange={(e) => {
                          const newColors = [...formData.colors];
                          newColors[index] = { ...newColors[index], name: e.target.value };
                          setFormData({...formData, colors: newColors});
                        }}
                        placeholder="Nombre (ej: Rojo)"
                        className="h-10"
                      />
                    </div>
                    
                    {/* Código hexadecimal del color */}
                    <div className="col-span-2">
                      <div className="flex items-center">
                        <input 
                          type="color"
                          value={color.hexCode}
                          onChange={(e) => {
                            const newColors = [...formData.colors];
                            newColors[index] = { ...newColors[index], hexCode: e.target.value };
                            setFormData({...formData, colors: newColors});
                          }}
                          className="h-10 w-10 p-0 cursor-pointer rounded border border-gray-200"
                        />
                        <Input
                          value={color.hexCode}
                          onChange={(e) => {
                            const newColors = [...formData.colors];
                            newColors[index] = { ...newColors[index], hexCode: e.target.value };
                            setFormData({...formData, colors: newColors});
                          }}
                          placeholder="#RRGGBB"
                          className="h-10 ml-2"
                        />
                      </div>
                    </div>
                    
                    {/* URL de la imagen para este color */}
                    <div className="col-span-6">
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
                  <div className="text-center py-3 text-gray-500 text-sm">
                    No hay colores añadidos. Haz clic en "Añadir color" para incluir variantes de color para este producto.
                  </div>
                )}
              </div>
            </div>

            {/* Nuevas secciones para beneficios, garantías y métodos de pago */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Beneficios
                </Label>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={() => setFormData({
                    ...formData, 
                    benefits: [...formData.benefits, '']
                  })}
                  className="flex items-center gap-1 text-xs h-7"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Añadir beneficio
                </Button>
              </div>
              
              <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={benefit}
                      onChange={(e) => {
                        const newBenefits = [...formData.benefits];
                        newBenefits[index] = e.target.value;
                        setFormData({...formData, benefits: newBenefits});
                      }}
                      placeholder="Beneficio (ej: Envío gratis, 2 años de garantía)"
                      className="h-10"
                    />
                    {formData.benefits.length > 1 && (
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          const newBenefits = [...formData.benefits];
                          newBenefits.splice(index, 1);
                          setFormData({...formData, benefits: newBenefits});
                        }}
                        className="h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Garantías
                </Label>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={() => setFormData({
                    ...formData, 
                    warranties: [...formData.warranties, '']
                  })}
                  className="flex items-center gap-1 text-xs h-7"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Añadir garantía
                </Button>
              </div>
              
              <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                {formData.warranties.map((warranty, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={warranty}
                      onChange={(e) => {
                        const newWarranties = [...formData.warranties];
                        newWarranties[index] = e.target.value;
                        setFormData({...formData, warranties: newWarranties});
                      }}
                      placeholder="Garantía (ej: 6 meses, 1 año)"
                      className="h-10"
                    />
                    {formData.warranties.length > 1 && (
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          const newWarranties = [...formData.warranties];
                          newWarranties.splice(index, 1);
                          setFormData({...formData, warranties: newWarranties});
                        }}
                        className="h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Métodos de Pago
                </Label>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={() => setFormData({
                    ...formData, 
                    paymentMethods: [...formData.paymentMethods, '']
                  })}
                  className="flex items-center gap-1 text-xs h-7"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Añadir método de pago
                </Button>
              </div>
              
              <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
                {formData.paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={method}
                      onChange={(e) => {
                        const newMethods = [...formData.paymentMethods];
                        newMethods[index] = e.target.value;
                        setFormData({...formData, paymentMethods: newMethods});
                      }}
                      placeholder="Método de pago (ej: Efectivo, Tarjeta de crédito)"
                      className="h-10"
                    />
                    {formData.paymentMethods.length > 1 && (
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          const newMethods = [...formData.paymentMethods];
                          newMethods.splice(index, 1);
                          setFormData({...formData, paymentMethods: newMethods});
                        }}
                        className="h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Beneficios del Producto */}
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <Award className="h-4 w-4 text-blue-600" />
                  Beneficios del Producto
                </Label>
              </div>
              
              <div className="border rounded-lg p-4 bg-slate-50">
                <div className="flex flex-wrap gap-2">
                  {predefinedBenefits.map((benefit) => (
                    <Badge 
                      key={benefit} 
                      variant={formData.benefits.includes(benefit) ? "default" : "outline"}
                      className={`cursor-pointer py-1.5 px-3 ${
                        formData.benefits.includes(benefit) 
                          ? "bg-blue-500 hover:bg-blue-600" 
                          : "hover:bg-slate-100"
                      }`}
                      onClick={() => {
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
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  Garantías y Respaldo
                </Label>
              </div>
              
              <div className="border rounded-lg p-4 bg-slate-50">
                <div className="flex flex-wrap gap-2">
                  {predefinedWarranties.map((warranty) => (
                    <Badge 
                      key={warranty} 
                      variant={formData.warranties.includes(warranty) ? "default" : "outline"}
                      className={`cursor-pointer py-1.5 px-3 ${
                        formData.warranties.includes(warranty) 
                          ? "bg-green-500 hover:bg-green-600" 
                          : "hover:bg-slate-100"
                      }`}
                      onClick={() => {
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

            {/* Medios de pago */}
            <div className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  Medios de Pago Aceptados
                </Label>
              </div>
              
              <div className="border rounded-lg p-4 bg-slate-50">
                <div className="flex flex-wrap gap-2">
                  {predefinedPaymentMethods.map((method) => (
                    <Badge 
                      key={method} 
                      variant={formData.paymentMethods.includes(method) ? "default" : "outline"}
                      className={`cursor-pointer py-1.5 px-3 ${
                        formData.paymentMethods.includes(method) 
                          ? "bg-purple-500 hover:bg-purple-600" 
                          : "hover:bg-slate-100"
                      }`}
                      onClick={() => {
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
                className="gradient-orange hover:opacity-90 transition-all shadow-lg"
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
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-600" />
            <span className="text-blue-600">Inventario de Productos ({filteredProducts.length})</span>
          </CardTitle>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar productos por nombre o categoría..."
              className="pl-10 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loadingProducts ? (
            <div className="text-center py-8 text-muted-foreground">Cargando productos...</div>
          ) : (
            <div className="grid gap-4">
              {products.map((product) => {
                const stockStatus = getStockStatus(product.stock);
                return (
                  <div key={product.id} className="flex items-center justify-between p-5 border rounded-xl hover:shadow-lg transition-all duration-200 hover:border-orange-200">
                    <div className="flex items-center gap-5">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-xl shadow-md"
                      />
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
                          <Badge className={stockStatus.color}>
                            {stockStatus.text}: {product.stock}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                        className="hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        disabled={liberta === "no"}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
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
                              ¿Estás seguro de que quieres eliminar "{product.name}"? Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(product.id, product.name)}
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
          )}

          {filteredProducts.length === 0 && !loadingProducts && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No se encontraron productos</p>
              <p className="text-sm text-muted-foreground">Prueba con otros términos de búsqueda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
