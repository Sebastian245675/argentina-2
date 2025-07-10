import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Edit } from "lucide-react";
import { db } from "@/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchCategories = async () => {
    const querySnapshot = await getDocs(collection(db, "categories"));
    setCategories(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!newCategory.trim()) return;
    await addDoc(collection(db, "categories"), { name: newCategory.trim() });
    setNewCategory("");
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "categories", id));
    fetchCategories();
  };

  const handleEdit = async (id: string) => {
    if (!editingName.trim()) return;
    await updateDoc(doc(db, "categories", id), { name: editingName.trim() });
    setEditingId(null);
    setEditingName("");
    fetchCategories();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categorías de Productos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Nueva categoría"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
          />
          <Button onClick={handleAdd} className="gradient-orange">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48 border-orange-200 focus:border-orange-400 focus:ring-orange-400">
            <Filter className="h-4 w-4 mr-2 text-orange-500" />
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ul className="space-y-2 mt-4">
          {categories.map(cat => (
            <li key={cat.id} className="flex items-center gap-2">
              {editingId === cat.id ? (
                <>
                  <Input
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    className="w-40"
                  />
                  <Button size="sm" onClick={() => handleEdit(cat.id)}>Guardar</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancelar</Button>
                </>
              ) : (
                <>
                  <span className="font-medium">{cat.name}</span>
                  <Button size="sm" variant="outline" onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDelete(cat.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};