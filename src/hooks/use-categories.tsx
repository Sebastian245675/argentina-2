import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

export interface Category {
  id?: string;
  name: string;
  image?: string;
  parentId?: string;
  parentName?: string;
  isMain?: boolean;
}

export function useCategories() {
  const [categories, setCategories] = useState<string[]>(["Todos"]);
  const [categoriesData, setCategoriesData] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        // Obtener todas las categorías y procesarlas
        const todosCategory = { 
          id: "todos", 
          name: "Todos", 
          image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=facearea&w=96&q=80",
          isMain: true 
        };

        const firebaseCats = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            image: data.image,
            parentId: data.parentId,
            parentName: data.parentName,
            // Es categoría principal si no tiene parentId o está vacío
            isMain: !data.parentId || data.parentId === ""
          };
        });

        const processedCats = [todosCategory, ...firebaseCats];

        setCategoriesData(processedCats);
        
        // Solo incluir en el array de strings las categorías principales
        const mainCategories = processedCats
          .filter(cat => cat.isMain)
          .map(cat => cat.name);
        
        setCategories(mainCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Categorías principales solamente
  const mainCategories = useMemo(() => {
    return categoriesData.filter(cat => cat.isMain);
  }, [categoriesData]);

  // Subcategorías agrupadas por categoría principal
  const subcategoriesByParent = useMemo(() => {
    const result: Record<string, Category[]> = {};
    
    categoriesData.forEach(cat => {
      if (cat.parentId && cat.parentName) {
        if (!result[cat.parentName]) {
          result[cat.parentName] = [];
        }
        result[cat.parentName].push(cat);
      }
    });
    
    return result;
  }, [categoriesData]);

  return { 
    categories, 
    categoriesData, 
    mainCategories,
    subcategoriesByParent,
    loading, 
    setCategories 
  };
}
