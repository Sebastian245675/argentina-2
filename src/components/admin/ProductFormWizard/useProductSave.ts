import { toast } from '@/hooks/use-toast';
import { db } from '@/firebase';
import { ProductFormData } from './types';

interface SaveProductParams {
  formData: ProductFormData;
  categories: Array<{ id: string; name: string; parentId?: string | null }>;
  user: any;
  liberta: string;
  isEditing?: boolean;
  editingId?: string | null;
  onSuccess?: () => void;
}

export const useProductSave = () => {
  const isSupabase = typeof (db as any)?.from === 'function';

  const saveProduct = async ({
    formData,
    categories,
    user,
    liberta,
    isEditing = false,
    editingId = null,
    onSuccess
  }: SaveProductParams): Promise<void> => {
    // Validación
    if (!formData.name || !formData.price || !formData.stock || !formData.category) {
      toast({
        variant: "destructive",
        title: "Error al guardar producto",
        description: "Por favor completa los campos obligatorios."
      });
      throw new Error("Campos obligatorios incompletos");
    }

    const numericPrice = parseFloat(formData.price);
    const numericStock = parseInt(formData.stock, 10);
    const numericCost = formData.cost ? parseFloat(formData.cost) : null;

    if (isNaN(numericPrice) || isNaN(numericStock) || (formData.cost && isNaN(numericCost as number))) {
      toast({
        variant: "destructive",
        title: "Error al guardar producto",
        description: "El precio, costo y stock deben ser valores numéricos."
      });
      throw new Error("Valores numéricos inválidos");
    }

    // Obtener nombres de categorías
    const categoryName = categories.find(cat => cat.id === formData.category)?.name || "";
    const subcategoryName = formData.subcategory
      ? categories.find(cat => cat.id === formData.subcategory)?.name || ""
      : "";
    const terceraCategoriaName = formData.terceraCategoria
      ? categories.find(cat => cat.id === formData.terceraCategoria)?.name || ""
      : "";

    const now = new Date().toISOString();

    if (isSupabase) {
      const supabasePayload: any = {
        name: formData.name,
        description: formData.description,
        price: numericPrice,
        original_price: formData.isOffer ? parseFloat(formData.originalPrice) : numericPrice,
        image: formData.image || null,
        additional_images: formData.additionalImages?.filter(Boolean) ?? [],
        category: formData.category,
        category_name: categoryName || null,
        subcategory: formData.subcategory || null,
        subcategory_name: subcategoryName || null,
        tercera_categoria: formData.terceraCategoria || null,
        tercera_categoria_name: terceraCategoriaName || null,
        stock: numericStock,
        cost: numericCost,
        is_published: formData.isPublished,
        is_offer: formData.isOffer,
        discount: formData.isOffer ? parseFloat(formData.discount) : 0,
        benefits: formData.benefits ?? [],
        warranties: formData.warranties ?? [],
        payment_methods: formData.paymentMethods ?? [],
        colors: formData.colors ?? [],
        // Guardar opciones de filtros dentro de specifications
        specifications: formData.specifications ?? [],
        is_decant: formData.isDecant || false,
        decant_options: formData.isDecant ? (formData.decantOptions || null) : null,
        last_modified_by: user?.email || "unknown",
      };

      // Agregar opciones de filtros a specifications si existen
      if (formData.filterOptions && Object.keys(formData.filterOptions).length > 0) {
        // Agregar las opciones de filtros como una especificación especial
        const filterOptionsSpec = {
          name: '_filter_options',
          value: JSON.stringify(formData.filterOptions)
        };
        supabasePayload.specifications = [
          ...(supabasePayload.specifications || []),
          filterOptionsSpec
        ];
      }

      try {
        if (isEditing && editingId) {
          if (liberta === "si") {
            const { error } = await (db as any)
              .from("products")
              .update({ ...supabasePayload })
              .eq("id", editingId);

            if (error) throw error;

            toast({
              title: "Producto actualizado",
              description: "El producto ha sido actualizado exitosamente."
            });
          } else {
            // Enviar a revisión
            const { error } = await (db as any).from("revision").insert([{
              type: "edit",
              data: { ...supabasePayload, id: editingId },
              status: "pendiente",
              timestamp: now,
              editorEmail: user?.email || "unknown",
              userName: user?.name || user?.email || "unknown"
            }]);

            if (error) throw error;

            toast({
              title: "Cambios enviados a revisión",
              description: "Los cambios han sido enviados para aprobación del administrador."
            });
          }
        } else {
          let newProductId: string | null = null;

          if (liberta === "si") {
            const { data: inserted, error } = await (db as any)
              .from("products")
              .insert([{ ...supabasePayload, created_by: user?.email || "unknown" }])
              .select()
              .single();

            if (error) throw error;

            newProductId = inserted?.id || null;

            toast({
              title: "Producto agregado",
              description: "El producto ha sido agregado exitosamente."
            });
          } else {
            // Enviar a revisión
            const { error } = await (db as any).from("revision").insert([{
              type: "add",
              data: supabasePayload,
              status: "pendiente",
              timestamp: now,
              editorEmail: user?.email || "unknown",
              userName: user?.name || user?.email || "unknown"
            }]);

            if (error) throw error;

            toast({
              title: "Producto enviado a revisión",
              description: "El producto ha sido enviado para aprobación del administrador."
            });
          }

          // Guardar grupos de filtros si existen (solo si se creó directamente, no en revisión)
          if (formData.filterGroups && formData.filterGroups.length > 0 && newProductId) {
            const filterGroupRelations = formData.filterGroups.map((groupId: string) => ({
              product_id: newProductId,
              filter_group_id: groupId
            }));

            await (db as any)
              .from("product_filter_groups")
              .insert(filterGroupRelations);
          }
        }

        // Guardar grupos de filtros para productos editados
        if (isEditing && editingId && formData.filterGroups && formData.filterGroups.length >= 0) {
          // Primero eliminar relaciones existentes
          await (db as any)
            .from("product_filter_groups")
            .delete()
            .eq("product_id", editingId);

          // Luego insertar las nuevas relaciones si hay grupos seleccionados
          if (formData.filterGroups.length > 0) {
            const filterGroupRelations = formData.filterGroups.map((groupId: string) => ({
              product_id: editingId,
              filter_group_id: groupId
            }));

            await (db as any)
              .from("product_filter_groups")
              .insert(filterGroupRelations);
          }
        }

        onSuccess?.();
      } catch (error: any) {
        console.error("Error al guardar producto:", error);
        toast({
          variant: "destructive",
          title: "Error al guardar producto",
          description: error?.message || "Ocurrió un error al guardar el producto."
        });
        throw error;
      }
    } else {
      // Fallback a Firestore si es necesario
      toast({
        variant: "destructive",
        title: "No disponible",
        description: "Esta funcionalidad requiere Supabase configurado."
      });
      throw new Error("Supabase no disponible");
    }
  };

  return { saveProduct };
};
