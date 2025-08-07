import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, addDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Eye, Trash2, FilePlus2, Edit2, XCircle } from "lucide-react";

export const RevisionList: React.FC = () => {
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  const fetchRevisions = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "revision"));
    setRevisions(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  useEffect(() => {
    fetchRevisions();
  }, []);

  const handleApprove = async (revision: any) => {
    try {
      // Para productos
      if (revision.type === "add") {
        await addDoc(collection(db, "products"), revision.data);
      } else if (revision.type === "edit" && revision.data.id) {
        await updateDoc(doc(db, "products", revision.data.id), revision.data);
      } else if (revision.type === "delete" && revision.data.id) {
        await updateDoc(doc(db, "products", revision.data.id), { deleted: true });
      } 
      // Para info sections
      else if (revision.type === "info_edit" && revision.sectionId) {
        await updateDoc(doc(db, "infoSections", revision.sectionId), {
          content: revision.data.content,
          lastEdited: Timestamp.now()
        });
      } else if (revision.type === "info_toggle" && revision.sectionId) {
        await updateDoc(doc(db, "infoSections", revision.sectionId), {
          enabled: revision.data.enabled,
          lastEdited: Timestamp.now()
        });
      }
      
      await deleteDoc(doc(db, "revision", revision.id));
      toast({ title: "Cambio aplicado", description: "La revisión fue aprobada y aplicada." });
      fetchRevisions();
      setSelected(null);
    } catch (e) {
      console.error("Error al aprobar revisión:", e);
      toast({ title: "Error", description: "No se pudo aprobar la revisión.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "revision", id));
    toast({ title: "Revisión eliminada", description: "La revisión fue eliminada." });
    fetchRevisions();
    setSelected(null);
  };

  const typeBadge = (type: string) => {
    switch (type) {
      case "add":
        return <Badge className="bg-green-100 text-green-700 border-green-300"><FilePlus2 className="inline w-4 h-4 mr-1" />Alta</Badge>;
      case "edit":
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300"><Edit2 className="inline w-4 h-4 mr-1" />Edición</Badge>;
      case "delete":
        return <Badge className="bg-red-100 text-red-700 border-red-300"><Trash2 className="inline w-4 h-4 mr-1" />Eliminación</Badge>;
      case "info_edit":
        return <Badge className="bg-blue-100 text-blue-700 border-blue-300"><Edit2 className="inline w-4 h-4 mr-1" />Edición Info</Badge>;
      case "info_toggle":
        return <Badge className="bg-purple-100 text-purple-700 border-purple-300"><CheckCircle className="inline w-4 h-4 mr-1" />Estado Info</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revisiones Pendientes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Cargando...</div>
        ) : revisions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No hay revisiones pendientes.</div>
        ) : (
          <div className="space-y-4">
            {revisions.map(rev => (
              <div
                key={rev.id}
                className={`border p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3 transition-all hover:shadow-lg ${
                  selected?.id === rev.id ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    {typeBadge(rev.type)}
                    <Badge variant="outline" className="ml-2">{rev.entity}</Badge>
                    <span className="text-xs text-gray-400 ml-2">
                      {rev.userId ? `Solicitado por: ${rev.userId}` : ""}
                    </span>
                  </div>
                  <div className="text-sm text-gray-700">
                    {rev.type === "add" && <>Nuevo producto: <b>{rev.data?.name}</b></>}
                    {rev.type === "edit" && <>Editar producto: <b>{rev.data?.name}</b></>}
                    {rev.type === "delete" && <>Eliminar producto: <b>{rev.data?.name}</b></>}
                    {rev.type === "info_edit" && <>Editar sección: <b>{rev.sectionTitle}</b></>}
                    {rev.type === "info_toggle" && <>
                      {rev.data?.enabled ? "Habilitar" : "Deshabilitar"} sección: <b>{rev.sectionTitle}</b>
                    </>}
                  </div>
                  {selected?.id === rev.id && (
                    <div className="mt-3 bg-gray-50 rounded-lg p-4 border border-orange-200">
                      <div className="font-semibold text-sm mb-2 text-orange-700 flex items-center gap-2">
                        <Eye className="w-4 h-4" /> Detalles de la revisión
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {/* Para productos */}
                        {rev.data?.name && (
                          <div>
                            <span className="font-medium text-gray-600">Nombre:</span>{" "}
                            <span className="text-gray-800">{rev.data.name}</span>
                          </div>
                        )}
                        {rev.data?.category && (
                          <div>
                            <span className="font-medium text-gray-600">Categoría:</span>{" "}
                            <span className="text-gray-800">{rev.data.category}</span>
                          </div>
                        )}
                        {rev.data?.price !== undefined && (
                          <div>
                            <span className="font-medium text-gray-600">Precio:</span>{" "}
                            <span className="text-gray-800">${rev.data.price}</span>
                          </div>
                        )}
                        {rev.data?.stock !== undefined && (
                          <div>
                            <span className="font-medium text-gray-600">Stock:</span>{" "}
                            <span className="text-gray-800">{rev.data.stock}</span>
                          </div>
                        )}
                        {rev.data?.description && !rev.type.includes("info") && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-600">Descripción:</span>{" "}
                            <span className="text-gray-800">{rev.data.description}</span>
                          </div>
                        )}
                        {rev.data?.image && (
                          <div className="md:col-span-2 flex items-center gap-2 mt-2">
                            <img
                              src={rev.data.image}
                              alt="Imagen"
                              className="w-16 h-16 object-cover rounded border"
                              onError={e => (e.currentTarget.style.display = "none")}
                            />
                            <span className="text-xs text-gray-400">{rev.data.image}</span>
                          </div>
                        )}
                        
                        {/* Para Info Sections */}
                        {rev.type === "info_edit" && rev.data?.content && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-600">Contenido:</span>{" "}
                            <div className="text-gray-800 bg-gray-50 p-2 rounded mt-1 max-h-60 overflow-auto">
                              {rev.data.content}
                            </div>
                          </div>
                        )}
                        {rev.type === "info_toggle" && (
                          <div className="md:col-span-2">
                            <span className="font-medium text-gray-600">Estado:</span>{" "}
                            <span className={`font-medium ${rev.data.enabled ? "text-green-600" : "text-red-600"}`}>
                              {rev.data.enabled ? "Habilitar" : "Deshabilitar"}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              Estado anterior: {rev.data.previousEnabled ? "Habilitado" : "Deshabilitado"}
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Si hay campos extra, muestra el JSON */}
                      {Object.keys(rev.data || {}).length > 7 && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-xs text-gray-500">Ver JSON completo</summary>
                          <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mt-1">{JSON.stringify(rev.data, null, 2)}</pre>
                        </details>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 items-center">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-400 text-green-700 hover:bg-green-50"
                    onClick={() => handleApprove(rev)}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" /> Aceptar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-400 text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(rev.id)}
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Eliminar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-blue-400 text-blue-700 hover:bg-blue-50"
                    onClick={() => setSelected(selected?.id === rev.id ? null : rev)}
                  >
                    <Eye className="w-4 h-4 mr-1" /> {selected?.id === rev.id ? "Ocultar" : "Ver"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};