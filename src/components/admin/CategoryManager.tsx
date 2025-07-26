import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Edit } from "lucide-react";
import { db } from "@/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export const CategoryManager = () => {
  // Actualizamos el modelo para incluir parentId (categoría padre)
  const [categories, setCategoriesState] = useState<{ 
    id: string; 
    name: string; 
    image?: string;
    parentId?: string | null;
  }[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newParentId, setNewParentId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingImage, setEditingImage] = useState("");
  const [editingParentId, setEditingParentId] = useState<string | null>(null);
  
  // Filtrado de categorías
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Separamos las categorías principales (sin padre) de las subcategorías
  const mainCategories = categories.filter(cat => !cat.parentId);
  const subCategories = categories.filter(cat => cat.parentId);

  const fetchCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    const categoryList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    setCategoriesState(categoryList);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    
    // Si es una subcategoría (tiene parentId), no necesitamos guardar imagen
    // Si es categoría principal, guardamos la imagen
    if (newParentId && newParentId !== "tercera") {
      // Es una subcategoría o tercera categoría
      await addDoc(collection(db, "categories"), { 
        name: newCategory.trim(),
        parentId: newParentId,
        // Obtenemos el nombre del padre para facilitar filtrado
        parentName: categories.find(cat => cat.id === newParentId)?.name || ''
      });
    } else {
      // Es una categoría principal
      await addDoc(collection(db, "categories"), { 
        name: newCategory.trim(), 
        image: newImage.trim(),
        parentId: null
      });
    }
    
    setNewCategory("");
    setNewImage("");
    setNewParentId(null);
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    // Primero verificamos si hay subcategorías que dependen de esta categoría
    const subCats = categories.filter(cat => cat.parentId === id);
    
    if (subCats.length > 0) {
      // Si hay subcategorías, podríamos mostrar un mensaje de advertencia o manejar esto automáticamente
      if (!window.confirm(`Esta categoría tiene ${subCats.length} subcategoría(s). Si la eliminas, las subcategorías se convertirán en categorías principales. ¿Deseas continuar?`)) {
        return;
      }
      
      // Actualizar las subcategorías para que no tengan padre
      for (const subCat of subCats) {
        await updateDoc(doc(db, "categories", subCat.id), { parentId: null });
      }
    }
    
    await deleteDoc(doc(db, "categories", id));
    fetchCategories();
  };

  const handleEdit = async (id: string) => {
    if (!editingName.trim()) return;
    
    // Verificar que no estemos creando un ciclo (una categoría no puede ser hija de sí misma o de sus descendientes)
    if (editingParentId === id) {
      alert("Una categoría no puede ser subcategoría de sí misma.");
      return;
    }
    
    // Verificar si editingParentId es descendiente de id (evitar ciclos)
    let currentParentId = editingParentId;
    while (currentParentId) {
      const parent = categories.find(cat => cat.id === currentParentId);
      if (parent?.id === id) {
        alert("No se puede crear un ciclo en la jerarquía de categorías.");
        return;
      }
      currentParentId = parent?.parentId || null;
    }
    
    const updateData: any = { 
      name: editingName.trim(),
      parentId: editingParentId
    };
    
    // Si es una categoría principal (sin padre), guardamos la imagen
    if (!editingParentId) {
      updateData.image = editingImage.trim();
    } else {
      // Es una subcategoría - no requiere imagen
      // Obtenemos el nombre del padre para facilitar filtrado
      updateData.parentName = categories.find(cat => cat.id === editingParentId)?.name || '';
    }
    
    await updateDoc(doc(db, "categories", id), updateData);
    
    setEditingId(null);
    setEditingName("");
    setEditingImage("");
    setEditingParentId(null);
    fetchCategories();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorías de Productos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-6 border rounded-lg p-4 bg-gray-50">
          <h3 className="font-medium text-lg mb-2">Agregar nueva categoría</h3>
          
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Tipo de categoría</label>
            <Select
              value={
                newParentId === null ? "main"
                : subCategories.some(cat => cat.id === newParentId) ? "tercera"
                : newParentId === "" ? "sub"
                : "sub"
              }
              onValueChange={(value) => {
                if (value === "main") {
                  setNewParentId(null);
                } else if (value === "sub") {
                  setNewParentId("");
                } else if (value === "tercera") {
                  setNewParentId("tercera"); // Marcador temporal para indicar que es tercera categoría
                }
              }}
            >
              <SelectTrigger className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 mb-3">
                <SelectValue placeholder="Seleccione tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Categoría Principal</SelectItem>
                <SelectItem value="sub">Subcategoría</SelectItem>
                <SelectItem value="tercera">Tercera Categoría</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Solo mostrar selector de padre si estamos creando una subcategoría o tercera categoría */}
          {(newParentId !== null && newParentId !== undefined) && (
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                {subCategories.some(cat => cat.id === newParentId) ? "Seleccionar subcategoría padre" : "Seleccionar categoría padre"}
              </label>
              <Select
                value={newParentId === "tercera" ? "pending" : newParentId || "pending"}
                onValueChange={(value) => setNewParentId(value !== "pending" ? value : "")}
              >
                <SelectTrigger className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 mb-3">
                  <SelectValue placeholder={newParentId === "tercera" ? "Seleccione subcategoría padre" : "Seleccione categoría padre"} />
                </SelectTrigger>
                <SelectContent>
                  {newParentId === "tercera" ? (
                    subCategories.length > 0 ? (
                      subCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name} (Subcategoría de {categories.find(c => c.id === category.parentId)?.name})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="pending" disabled>
                        No hay subcategorías disponibles
                      </SelectItem>
                    )
                  ) : (
                    mainCategories.length > 0 ? (
                      mainCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="pending" disabled>
                        No hay categorías principales disponibles
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Nombre de categoría</label>
            <Input
              placeholder="Nombre de categoría"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="mb-3"
            />
          </div>
          
          {/* Solo mostrar campo de imagen para categorías principales */}
          {!newParentId && (
            <div>
              <label className="text-sm text-gray-600 mb-1 block">URL de imagen (solo categorías principales)</label>
              <Input
                placeholder="URL de imagen"
                value={newImage}
                onChange={e => setNewImage(e.target.value)}
                className="mb-3"
              />
            </div>
          )}
          
          <Button 
            onClick={handleAdd} 
            className="w-full gradient-orange" 
            disabled={!newCategory.trim() || (newParentId === "") || (newParentId === "tercera")}
          >
            <Plus className="h-4 w-4 mr-2" /> 
            {newParentId === null ? "Crear Categoría Principal" : 
             newParentId === "" ? "Seleccione una categoría padre" : 
             newParentId === "tercera" ? "Seleccione una subcategoría padre" :
             `Crear ${subCategories.some(sub => sub.id === newParentId) ? "Tercera Categoría" : "Subcategoría"} en ${categories.find(cat => cat.id === newParentId)?.name || ""}`}
          </Button>
        </div>
        
        <h3 className="font-medium text-lg mb-3">Filtrar categorías</h3>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-60 border-orange-200 focus:border-orange-400 focus:ring-orange-400">
            <Filter className="h-4 w-4 mr-2 text-orange-500" />
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            <SelectItem value="main">Solo categorías principales</SelectItem>
            <SelectItem value="sub">Solo subcategorías</SelectItem>
            <SelectItem value="tercera">Solo terceras categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name} {category.parentId && subCategories.some(sub => sub.id === category.parentId) ? '(tercera)' : category.parentId ? '(subcategoría)' : '(principal)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Lista de categorías filtradas */}
        <div className="mt-6">
          <h3 className="font-medium text-lg mb-3">Categorías</h3>
          
          {/* Categorías principales */}
          <div className="space-y-6">
            {/* Filtrar las categorías según la selección */}
            {(selectedCategory === "all" || selectedCategory === "main" ? mainCategories : [])
              .filter(cat => selectedCategory === "all" || selectedCategory === "main" || cat.id === selectedCategory)
              .map(cat => (
                <div key={cat.id} className="border rounded-lg overflow-hidden">
                  <div className="bg-white p-4">
                    {editingId === cat.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            placeholder="Nombre de categoría"
                          />
                          {/* Solo mostrar campo de imagen si estamos editando una categoría principal */}
                          {!editingParentId && (
                            <Input
                              value={editingImage}
                              onChange={e => setEditingImage(e.target.value)}
                              placeholder="URL de imagen (solo categorías principales)"
                            />
                          )}
                        </div>
                        
                        <div>
                          <label className="text-sm text-gray-600 mb-1 block">Categoría padre (opcional)</label>
                          <Select 
                            value={editingParentId || "none"} 
                            onValueChange={(value) => setEditingParentId(value !== "none" ? value : null)}
                          >
                            <SelectTrigger className="border-orange-200 focus:border-orange-400 focus:ring-orange-400">
                              <SelectValue placeholder="Ninguna (categoría principal)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Ninguna (categoría principal)</SelectItem>
                              {mainCategories
                                .filter(mainCat => mainCat.id !== cat.id) // No mostrar la categoría actual
                                .map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex justify-end gap-2 mt-2">
                          <Button size="sm" onClick={() => handleEdit(cat.id)}>Guardar</Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setEditingId(null);
                              setEditingName("");
                              setEditingImage("");
                              setEditingParentId(null);
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={cat.image || "https://via.placeholder.com/40x40?text=?"}
                            alt={cat.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                          <div>
                            <h4 className="font-medium text-lg">{cat.name}</h4>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              Categoría principal
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setEditingId(cat.id);
                              setEditingName(cat.name);
                              setEditingImage(cat.image || "");
                              setEditingParentId(cat.parentId || null);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600" 
                            onClick={() => handleDelete(cat.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Subcategorías relacionadas */}
                  {!editingId && categories
                    .filter(subCat => subCat.parentId === cat.id && 
                             (selectedCategory === "all" || selectedCategory === cat.id || selectedCategory === "sub"))
                    .length > 0 && (
                    <div className="bg-gray-50 p-4 border-t">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Subcategorías:</h5>
                      <ul className="space-y-2">
                        {categories
                          .filter(subCat => subCat.parentId === cat.id && 
                                  (selectedCategory === "all" || selectedCategory === cat.id || selectedCategory === "sub"))
                          .map(subCat => (
                            <li key={subCat.id} className="flex flex-col bg-white rounded border">
                              <div className={`flex items-center justify-between p-2 ${categories.some(thirdCat => thirdCat.parentId === subCat.id) ? 'border-b border-dashed' : ''}`}>
                                {editingId === subCat.id ? (
                                  <div className="w-full space-y-3">
                                    <div className="grid grid-cols-1 gap-3">
                                      <Input
                                        value={editingName}
                                        onChange={e => setEditingName(e.target.value)}
                                        placeholder="Nombre de subcategoría"
                                      />
                                    </div>
                                    
                                    <div>
                                      <label className="text-sm text-gray-600 mb-1 block">Categoría padre</label>
                                      <Select 
                                        value={editingParentId || "none"} 
                                        onValueChange={(value) => setEditingParentId(value !== "none" ? value : null)}
                                      >
                                        <SelectTrigger className="border-orange-200 focus:border-orange-400 focus:ring-orange-400">
                                          <SelectValue placeholder="Ninguna (categoría principal)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="none">Ninguna (categoría principal)</SelectItem>
                                          {categories
                                            .filter(category => category.id !== subCat.id)
                                            .map((category) => (
                                              <SelectItem key={category.id} value={category.id}>
                                                {category.name} {category.parentId ? '(Subcategoría)' : '(Principal)'}
                                              </SelectItem>
                                            ))
                                          }
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div className="flex justify-end gap-2 mt-2">
                                      <Button size="sm" onClick={() => handleEdit(subCat.id)}>Guardar</Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => {
                                          setEditingId(null);
                                          setEditingName("");
                                          setEditingImage("");
                                          setEditingParentId(null);
                                        }}
                                      >
                                        Cancelar
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2">
                                      {/* No mostramos imagen para subcategorías, solo un icono o indicador */}
                                      <div className="w-8 h-8 flex items-center justify-center bg-orange-100 text-orange-600 rounded">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                      </div>
                                      <div>
                                        <span className="font-medium text-sm">{subCat.name}</span>
                                        <div className="text-xs text-gray-500">Subcategoría de {cat.name}</div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex gap-1">
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-8 w-8 p-0"
                                        onClick={() => {
                                          setEditingId(subCat.id);
                                          setEditingName(subCat.name);
                                          // No necesitamos cargar la imagen para subcategorías
                                          setEditingImage("");
                                          setEditingParentId(subCat.parentId || null);
                                        }}
                                      >
                                        <Edit className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="ghost" 
                                        className="h-8 w-8 p-0 text-red-600" 
                                        onClick={() => handleDelete(subCat.id)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </>
                                )}
                              </div>
                              
                              {/* Mostrar terceras categorías debajo de cada subcategoría */}
                              {!editingId && categories.filter(thirdCat => thirdCat.parentId === subCat.id).length > 0 && (
                                <div className="pl-5 pr-2 py-1 bg-gray-50">
                                  <h6 className="text-xs text-gray-500 mb-1">Terceras categorías:</h6>
                                  <ul className="space-y-1">
                                    {categories
                                      .filter(thirdCat => thirdCat.parentId === subCat.id)
                                      .map(thirdCat => (
                                        <li key={thirdCat.id} className="flex items-center justify-between bg-white p-1.5 rounded border border-orange-100">
                                          {editingId === thirdCat.id ? (
                                            <div className="w-full space-y-2 p-2">
                                              <Input
                                                value={editingName}
                                                onChange={e => setEditingName(e.target.value)}
                                                placeholder="Nombre de categoría"
                                                className="text-sm h-8"
                                              />
                                              <div>
                                                <label className="text-xs text-gray-600 mb-1 block">Categoría padre</label>
                                                <Select 
                                                  value={editingParentId || "none"} 
                                                  onValueChange={(value) => setEditingParentId(value !== "none" ? value : null)}
                                                >
                                                  <SelectTrigger className="border-orange-200 text-sm focus:border-orange-400 focus:ring-orange-400">
                                                    <SelectValue placeholder="Seleccione categoría padre" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectItem value="none">Ninguna (categoría principal)</SelectItem>
                                                    {categories
                                                      .filter(cat => cat.id !== thirdCat.id)
                                                      .map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id}>
                                                          {cat.name} {cat.parentId ? cat.parentId === subCat.parentId ? '(Subcategoría)' : '(Tercera categoría)' : '(Principal)'}
                                                        </SelectItem>
                                                      ))}
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div className="flex justify-end gap-1 mt-2">
                                                <Button size="sm" onClick={() => handleEdit(thirdCat.id)}>Guardar</Button>
                                                <Button 
                                                  size="sm" 
                                                  variant="outline" 
                                                  onClick={() => {
                                                    setEditingId(null);
                                                    setEditingName("");
                                                    setEditingImage("");
                                                    setEditingParentId(null);
                                                  }}
                                                >
                                                  Cancelar
                                                </Button>
                                              </div>
                                            </div>
                                          ) : (
                                            <>
                                              <div className="flex items-center gap-1">
                                                <div className="w-6 h-6 flex items-center justify-center bg-orange-50 text-orange-500 rounded">
                                                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                                </div>
                                                <div>
                                                  <span className="text-xs font-medium">{thirdCat.name}</span>
                                                </div>
                                              </div>
                                              <div className="flex gap-1">
                                                <Button 
                                                  size="sm" 
                                                  variant="ghost" 
                                                  className="h-6 w-6 p-0"
                                                  onClick={() => {
                                                    setEditingId(thirdCat.id);
                                                    setEditingName(thirdCat.name);
                                                    setEditingImage("");
                                                    setEditingParentId(thirdCat.parentId || null);
                                                  }}
                                                >
                                                  <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button 
                                                  size="sm" 
                                                  variant="ghost" 
                                                  className="h-6 w-6 p-0 text-red-600" 
                                                  onClick={() => handleDelete(thirdCat.id)}
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </>
                                          )}
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                              )}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            }
            
            {/* Terceras categorías (cuando se filtran solo terceras categorías) */}
            {selectedCategory === "tercera" && (
              <div className="border rounded-lg p-4 bg-gray-50 mt-4">
                <h5 className="font-medium mb-3">Todas las terceras categorías</h5>
                {categories.filter(cat => subCategories.some(subCat => subCat.id === cat.parentId)).length > 0 ? (
                  <ul className="space-y-3">
                    {categories
                      .filter(cat => subCategories.some(subCat => subCat.id === cat.parentId))
                      .map(thirdCat => (
                        <li key={thirdCat.id} className="flex items-center justify-between bg-white p-3 rounded border border-orange-100">
                          {editingId === thirdCat.id ? (
                            <div className="w-full space-y-3">
                              <div className="grid grid-cols-1 gap-3">
                                <Input
                                  value={editingName}
                                  onChange={e => setEditingName(e.target.value)}
                                  placeholder="Nombre de categoría"
                                />
                              </div>
                              
                              <div>
                                <label className="text-sm text-gray-600 mb-1 block">Categoría padre</label>
                                <Select 
                                  value={editingParentId || "none"} 
                                  onValueChange={(value) => setEditingParentId(value !== "none" ? value : null)}
                                >
                                  <SelectTrigger className="border-orange-200 focus:border-orange-400 focus:ring-orange-400">
                                    <SelectValue placeholder="Seleccione categoría padre" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">Ninguna (categoría principal)</SelectItem>
                                    {categories
                                      .filter(cat => cat.id !== thirdCat.id)
                                      .map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                          {cat.name} {cat.parentId ? cat.parentId === thirdCat.parentId ? '(Subcategoría)' : '(Tercera categoría)' : '(Principal)'}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="flex justify-end gap-2 mt-2">
                                <Button size="sm" onClick={() => handleEdit(thirdCat.id)}>Guardar</Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditingName("");
                                    setEditingImage("");
                                    setEditingParentId(null);
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 flex items-center justify-center bg-orange-50 text-orange-600 rounded">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                </div>
                                <div>
                                  <span className="font-medium">{thirdCat.name}</span>
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="text-xs text-gray-500">Categoría padre:</span>
                                    <span className="text-xs font-medium">
                                      {categories.find(c => c.id === thirdCat.parentId)?.name || "N/A"}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-1">→</span>
                                    <span className="text-xs font-medium">
                                      {categories.find(c => c.id === categories.find(c => c.id === thirdCat.parentId)?.parentId)?.name || ""}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => {
                                    setEditingId(thirdCat.id);
                                    setEditingName(thirdCat.name);
                                    setEditingImage("");
                                    setEditingParentId(thirdCat.parentId || null);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-red-600" 
                                  onClick={() => handleDelete(thirdCat.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </>
                          )}
                        </li>
                      ))}
                  </ul>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-3">No hay terceras categorías creadas</p>
                    <Button variant="outline" onClick={() => setSelectedCategory("all")}>
                      Ver todas las categorías
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {/* Subcategorías independientes (cuando se filtran solo subcategorías) */}
            {selectedCategory === "sub" && (
              <div className="border rounded-lg p-4 bg-gray-50 mt-4">
                <h5 className="font-medium mb-3">Todas las subcategorías</h5>
                <ul className="space-y-2">
                  {subCategories.map(subCat => (
                    <li key={subCat.id} className="flex flex-col bg-white rounded border mb-2">
                      <div className={`flex items-center justify-between p-3 ${categories.some(thirdCat => thirdCat.parentId === subCat.id) ? 'border-b border-dashed' : ''}`}>
                        {editingId === subCat.id ? (
                          <div className="w-full space-y-3">
                            <div className="grid grid-cols-1 gap-3">
                              <Input
                                value={editingName}
                                onChange={e => setEditingName(e.target.value)}
                                placeholder="Nombre de subcategoría"
                              />
                            </div>
                            
                            <div>
                              <label className="text-sm text-gray-600 mb-1 block">Categoría padre</label>
                              <Select 
                                value={editingParentId || "none"} 
                                onValueChange={(value) => setEditingParentId(value !== "none" ? value : null)}
                              >
                                <SelectTrigger className="border-orange-200 focus:border-orange-400 focus:ring-orange-400">
                                  <SelectValue placeholder="Ninguna (categoría principal)" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Ninguna (categoría principal)</SelectItem>
                                  {categories
                                    .filter(cat => cat.id !== subCat.id)
                                    .map((cat) => (
                                      <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name} {cat.parentId ? '(Subcategoría)' : '(Principal)'}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="flex justify-end gap-2 mt-2">
                              <Button size="sm" onClick={() => handleEdit(subCat.id)}>Guardar</Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  setEditingId(null);
                                  setEditingName("");
                                  setEditingImage("");
                                  setEditingParentId(null);
                                }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              {/* Icono para subcategorías en lugar de imagen */}
                              <div className="w-10 h-10 flex items-center justify-center bg-orange-100 text-orange-600 rounded">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                              </div>
                              <div>
                                <span className="font-medium">{subCat.name}</span>
                                <div className="flex items-center gap-1 mt-1">
                                  <span className="text-xs text-gray-500">Categoría padre:</span>
                                  <span className="text-xs font-medium">
                                    {categories.find(c => c.id === subCat.parentId)?.name || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  setEditingId(subCat.id);
                                  setEditingName(subCat.name);
                                  // No cargamos imágenes para subcategorías
                                  setEditingImage("");
                                  setEditingParentId(subCat.parentId || null);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-600" 
                                onClick={() => handleDelete(subCat.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                      
                      {/* Mostrar terceras categorías debajo de cada subcategoría en la vista de "Solo subcategorías" */}
                      {!editingId && categories.filter(thirdCat => thirdCat.parentId === subCat.id).length > 0 && (
                        <div className="pl-5 pr-2 py-2 bg-gray-50">
                          <h6 className="text-xs font-medium text-gray-600 mb-1">Terceras categorías:</h6>
                          <ul className="space-y-1">
                            {categories
                              .filter(thirdCat => thirdCat.parentId === subCat.id)
                              .map(thirdCat => (
                                <li key={thirdCat.id} className="flex items-center justify-between bg-white p-2 rounded border border-orange-100">
                                  {editingId === thirdCat.id ? (
                                    <div className="w-full space-y-2 p-2">
                                      <Input
                                        value={editingName}
                                        onChange={e => setEditingName(e.target.value)}
                                        placeholder="Nombre de categoría"
                                        className="text-sm"
                                      />
                                      <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Categoría padre</label>
                                        <Select 
                                          value={editingParentId || "none"} 
                                          onValueChange={(value) => setEditingParentId(value !== "none" ? value : null)}
                                        >
                                          <SelectTrigger className="border-orange-200 text-sm focus:border-orange-400 focus:ring-orange-400">
                                            <SelectValue placeholder="Seleccione categoría padre" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="none">Ninguna (categoría principal)</SelectItem>
                                            {categories
                                              .filter(cat => cat.id !== thirdCat.id)
                                              .map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                  {cat.name} {cat.parentId ? '(Subcategoría)' : '(Principal)'}
                                                </SelectItem>
                                              ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="flex justify-end gap-1 mt-2">
                                        <Button size="sm" onClick={() => handleEdit(thirdCat.id)}>Guardar</Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          onClick={() => {
                                            setEditingId(null);
                                            setEditingName("");
                                            setEditingImage("");
                                            setEditingParentId(null);
                                          }}
                                        >
                                          Cancelar
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 flex items-center justify-center bg-orange-50 text-orange-500 rounded">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                        </div>
                                        <span className="text-xs font-medium">{thirdCat.name}</span>
                                      </div>
                                      <div className="flex gap-1">
                                        <Button 
                                          size="sm" 
                                          variant="ghost" 
                                          className="h-7 w-7 p-0"
                                          onClick={() => {
                                            setEditingId(thirdCat.id);
                                            setEditingName(thirdCat.name);
                                            setEditingImage("");
                                            setEditingParentId(thirdCat.parentId || null);
                                          }}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="ghost" 
                                          className="h-7 w-7 p-0 text-red-600" 
                                          onClick={() => handleDelete(thirdCat.id)}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </>
                                  )}
                                </li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Mensaje cuando no hay categorías */}
            {(selectedCategory === "all" && categories.length === 0) || 
             (selectedCategory === "main" && mainCategories.length === 0) ||
             (selectedCategory === "sub" && subCategories.length === 0) || 
             (selectedCategory === "tercera" && !categories.some(cat => subCategories.some(subCat => subCat.id === cat.parentId))) ||
             (selectedCategory !== "all" && selectedCategory !== "main" && selectedCategory !== "sub" && selectedCategory !== "tercera" && !categories.find(cat => cat.id === selectedCategory)) && (
              <div className="text-center py-10 border rounded-lg">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </div>
                <h3 className="font-medium text-lg mb-1">No hay categorías</h3>
                <p className="text-gray-500 mb-4">No se encontraron categorías con los criterios seleccionados</p>
                {selectedCategory !== "all" && (
                  <Button variant="outline" onClick={() => setSelectedCategory("all")}>
                    Ver todas las categorías
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
