import React, { useEffect, useState } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, doc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    await setDoc(doc(db, 'infoSections', id), {
      content: editContent,
      enabled: true,
      lastEdited: Timestamp.now(),
    }, { merge: true });
    setEditingId(null);
    setEditContent('');
    setLoading(false);
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
  };

  const handleEnableToggle = async (id: string, enabled: boolean) => {
    setLoading(true);
    await updateDoc(doc(db, 'infoSections', id), {
      enabled,
      lastEdited: Timestamp.now(),
    });
    setLoading(false);
    setSections(sections.map(s => s.id === id ? { ...s, enabled } : s));
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6">Gestión de Información de Secciones</h2>
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
