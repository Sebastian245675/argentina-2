import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, Timestamp, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface SectionInfo {
  id: string;
  title: string;
  content: string;
  enabled: boolean;
  lastEdited: Timestamp | null;
}

const defaultSections = [
  { id: 'about', title: 'Sobre Nosotros', content: '', enabled: false, lastEdited: null },
  { id: 'envios', title: 'Envíos', content: '', enabled: false, lastEdited: null },
  { id: 'retiros', title: 'Retiros', content: '', enabled: false, lastEdited: null },
];

export const InfoManager: React.FC = () => {
  const [sections, setSections] = useState<SectionInfo[]>(defaultSections);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const { user } = useAuth();
  const [liberta, setLiberta] = useState("no");

  // Verificar permisos del usuario
  useEffect(() => {
    const fetchLiberta = async () => {
      if (user && (user as any).email) {
        // Verificamos si es el usuario admin principal
        if ((user as any).email === "admin@gmail.com" || (user as any).email === "admin@tienda.com" || (user as any).isAdmin === true) {
          setLiberta("si"); // El admin siempre tiene permisos
          console.log("Usuario identificado como administrador, tiene permisos completos");
          return;
        }
        
        // Busca el usuario por email en la colección users
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        // Por defecto, las subcuentas no tienen libertad
        let foundLiberta = "no";
        
        querySnapshot.forEach((docu) => {
          const data = docu.data();
          if (data.email === (user as any).email) {
            // Sólo si explícitamente se ha configurado como "si", se otorga libertad
            foundLiberta = data.liberta === "si" ? "si" : "no";
          }
        });
        setLiberta(foundLiberta);
      }
    };
    fetchLiberta();
  }, [user]);

  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'infoSections'));
      const infos: SectionInfo[] = defaultSections.map(s => ({ ...s }));
      querySnapshot.forEach(docSnap => {
        const data = docSnap.data();
        const idx = infos.findIndex(s => s.id === docSnap.id);
        if (idx !== -1) {
          infos[idx] = {
            ...infos[idx],
            content: data.content || '',
            enabled: data.enabled ?? false,
            lastEdited: data.lastEdited || null,
          };
        }
      });
      setSections(infos);
      setLoading(false);
    };
    fetchSections();
  }, []);

  const handleEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleSave = async (id: string) => {
    setLoading(true);
    try {
      // Si el usuario tiene liberta o es administrador, realiza cambios directamente
      if (liberta === "si") {
        await setDoc(doc(db, 'infoSections', id), {
          content: editContent,
          enabled: true,
          lastEdited: Timestamp.now(),
        }, { merge: true });
        
        toast({
          title: "Sección actualizada",
          description: `La sección ${sections.find(s => s.id === id)?.title} ha sido actualizada exitosamente.`,
        });
      } else {
        // Si no tiene libertad, enviar a revisión
        const section = sections.find(s => s.id === id);
        
        await addDoc(collection(db, "revision"), {
          type: "info_edit",
          entity: "infoSections",
          sectionId: id,
          sectionTitle: section?.title,
          data: {
            content: editContent,
            enabled: true,
            previousContent: section?.content || ""
          },
          userId: (user as any)?.uid || (user as any)?.email || "desconocido",
          createdAt: Timestamp.now(),
        });
        
        toast({
          title: "Solicitud enviada",
          description: `Tu edición de la sección "${section?.title}" fue enviada para revisión del administrador.`,
        });
      }
      
      setEditingId(null);
      setEditContent('');
      
      // Refresh
      const querySnapshot = await getDocs(collection(db, 'infoSections'));
      const infos: SectionInfo[] = defaultSections.map(s => ({ ...s }));
      querySnapshot.forEach(docSnap => {
        const data = docSnap.data();
        const idx = infos.findIndex(s => s.id === docSnap.id);
        if (idx !== -1) {
          infos[idx] = {
            ...infos[idx],
            content: data.content || '',
            enabled: data.enabled ?? false,
            lastEdited: data.lastEdited || null,
          };
        }
      });
      setSections(infos);
    } catch (error) {
      console.error("Error al guardar:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la información. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnableToggle = async (id: string, enabled: boolean) => {
    setLoading(true);
    try {
      // Si el usuario tiene liberta o es administrador, realiza cambios directamente
      if (liberta === "si") {
        await updateDoc(doc(db, 'infoSections', id), {
          enabled,
          lastEdited: Timestamp.now(),
        });
        
        setSections(sections.map(s => s.id === id ? { ...s, enabled } : s));
        
        toast({
          title: `Sección ${enabled ? 'habilitada' : 'deshabilitada'}`,
          description: `La sección ${sections.find(s => s.id === id)?.title} ha sido ${enabled ? 'habilitada' : 'deshabilitada'} exitosamente.`,
        });
      } else {
        // Si no tiene libertad, enviar a revisión
        const section = sections.find(s => s.id === id);
        
        await addDoc(collection(db, "revision"), {
          type: "info_toggle",
          entity: "infoSections",
          sectionId: id,
          sectionTitle: section?.title,
          data: {
            enabled,
            previousEnabled: section?.enabled
          },
          userId: (user as any)?.uid || (user as any)?.email || "desconocido",
          createdAt: Timestamp.now(),
        });
        
        toast({
          title: "Solicitud enviada",
          description: `Tu solicitud para ${enabled ? 'habilitar' : 'deshabilitar'} la sección "${section?.title}" fue enviada para revisión del administrador.`,
        });
      }
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de la sección. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Información de Secciones</h2>
        
        {liberta !== "si" && (
          <div className="flex items-center bg-amber-50 text-amber-700 border border-amber-200 px-3 py-2 rounded-md text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Tus cambios requieren aprobación
          </div>
        )}
      </div>
      {loading && <div className="mb-4 text-blue-600">Cargando...</div>}
      <div className="space-y-6">
        {sections.map(section => (
          <div key={section.id} className="border-b pb-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">{section.title}</h3>
              <label className="flex items-center gap-2">
                <span className="text-sm">Habilitado</span>
                <input type="checkbox" checked={section.enabled} onChange={e => handleEnableToggle(section.id, e.target.checked)} />
              </label>
            </div>
            <div className="mb-2 text-sm text-gray-500">
              Última edición: {section.lastEdited ? section.lastEdited.toDate().toLocaleString() : 'Nunca'}
            </div>
            {editingId === section.id ? (
              <div>
                <textarea
                  className="w-full border rounded p-2 mb-2"
                  rows={4}
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                />
                <Button onClick={() => handleSave(section.id)} disabled={loading} className="mr-2">Guardar</Button>
                <Button variant="outline" onClick={() => setEditingId(null)} disabled={loading}>Cancelar</Button>
              </div>
            ) : (
              <div>
                <div className="mb-2 p-2 bg-slate-50 rounded min-h-[48px]">{section.content || <span className="text-gray-400">Sin información personalizada</span>}</div>
                <Button onClick={() => handleEdit(section.id, section.content)} disabled={loading}>Editar</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default InfoManager;
