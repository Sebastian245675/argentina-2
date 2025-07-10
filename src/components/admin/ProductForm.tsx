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
import { Plus, Package, Edit, Trash2, Search, Save, X, Image, AlertTriangle } from 'lucide-react';
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
import { collection, addDoc, getDocs, updateDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase";

export const ProductForm: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: ''
  });
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

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

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "categories"));
      setCategories(querySnapshot.docs.map(doc => doc.data().name));
    };
    fetchCategories();
  }, []);

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
      if (isEditing && editingId) {
        // Actualizar producto existente
        await updateDoc(doc(db, "products", editingId), {
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
        });
        toast({
          title: "✅ Producto actualizado",
          description: `${formData.name} ha sido actualizado exitosamente.`,
        });
      } else {
        // Agregar nuevo producto
        await addDoc(collection(db, "products"), {
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
          createdAt: new Date(),
        });
        toast({
          title: "✅ Producto agregado",
          description: `${formData.name} ha sido agregado exitosamente al inventario.`,
        });
      }
      resetForm();
      // Opcional: recargar productos desde Firestore aquí si tienes un estado global/local
    } catch (error) {
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
      stock: '',
      image: ''
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
      stock: product.stock.toString(),
      image: product.image
    });
    setIsEditing(true);
    setEditingId(product.id);
    
    // Scroll suave al formulario
    document.getElementById('product-form')?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };

  const handleDelete = (productId: string, productName: string) => {
    // Aquí se eliminaría el producto de la base de datos
    toast({
      title: "🗑️ Producto eliminado",
      description: `${productName} ha sido eliminado del inventario`,
      variant: "destructive"
    });
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { color: 'bg-red-100 text-red-800', text: 'Sin stock' };
    if (stock <= 5) return { color: 'bg-yellow-100 text-yellow-800', text: 'Bajo stock' };
    return { color: 'bg-green-100 text-green-800', text: 'En stock' };
  };

  return (
    <div className="space-y-8">
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
                  Categoría <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-semibold flex items-center gap-2">
                <Image className="h-4 w-4" />
                URL de la Imagen <span className="text-red-500">*</span>
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
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button 
                type="submit" 
                className="gradient-orange hover:opacity-90 transition-all shadow-lg"
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
                          <Badge variant="outline" className="font-medium">
                            {product.category}
                          </Badge>
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
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
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
