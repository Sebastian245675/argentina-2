import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Plus,
  Download,
  MoreVertical,
  Search,
  Filter,
  ArrowUpDown,
  Settings,
  List,
  Users,
  Building2,
  RotateCcw,
  CheckSquare,
  Mail,
  Phone,
  Calendar,
  Tag as TagIcon,
  User,
  History,
  Trash2,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from '@/hooks/use-toast';
import { db } from '@/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

// Mocks para evitar errores de compilación ya que Firebase fue removido
const getDocs = (...args: any[]) => ({ forEach: () => { } }) as any;
const collection = (...args: any[]) => ({}) as any;
const query = (...args: any[]) => ({}) as any;
const orderBy = (...args: any[]) => ({}) as any;

interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  createdAt: Date;
  lastActivity?: Date;
  tags?: string[];
  avatar?: string;
}

export const ContactsManager: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('smart-lists');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '', company: '' });
  const isSupabase = typeof (db as any)?.from === 'function';

  useEffect(() => {
    loadContacts();
  }, []);

  const handleExportContacts = () => {
    toast({ title: 'Exportar Contactos', description: 'Función en desarrollo.' });
  };

  const handleDeleteSelected = () => {
    toast({ title: 'Eliminar Contactos', description: 'Función en desarrollo.' });
  };

  const handleAddContact = async () => {
    if (!newContact.name.trim()) {
      toast({ title: 'Error', description: 'El nombre es obligatorio', variant: 'destructive' });
      return;
    }

    setSavingContact(true);
    try {
      if (isSupabase) {
        const { data, error } = await (db as any).from('contacts').insert([
          {
            name: newContact.name,
            phone: newContact.phone,
            email: newContact.email,
            company: newContact.company,
            created_at: new Date().toISOString()
          }
        ]).select();
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const newSavedContact = {
            id: data[0].id,
            name: data[0].name || '',
            phone: data[0].phone || '',
            email: data[0].email || '',
            company: data[0].company || '',
            createdAt: new Date(data[0].created_at),
            tags: data[0].tags || [],
            avatar: data[0].avatar || ''
          };
          setContacts(prev => [newSavedContact, ...prev]);
        }
      } else {
        toast({ title: 'Error', description: 'No se usa Firebase, favor configurar Supabase.', variant: 'destructive'});
      }

      setNewContact({ name: '', phone: '', email: '', company: '' });
      setShowAddDialog(false);
      toast({ title: 'Contacto Agregado', description: 'El contacto ha sido guardado exitosamente.' });
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Error', description: 'No se pudo guardar el contacto.', variant: 'destructive' });
    } finally {
      setSavingContact(false);
    }
  };


  const loadContacts = async () => {
    try {
      setLoading(true);
      if (isSupabase) {
        const { data, error } = await db
          .from('contacts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading contacts:', error);
        } else if (data) {
          setContacts(data.map((contact: any) => ({
            id: contact.id,
            name: contact.name || '',
            phone: contact.phone || '',
            email: contact.email || '',
            company: contact.company || '',
            createdAt: contact.created_at ? new Date(contact.created_at) : new Date(),
            lastActivity: contact.last_activity ? new Date(contact.last_activity) : undefined,
            tags: contact.tags || [],
            avatar: contact.avatar || ''
          })));
        }
      } else {
        // Firebase fallback (MOCKED)
        const contactsRef = collection(db, 'contacts');
        const q = query(contactsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const contactsData: Contact[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          contactsData.push({
            id: doc.id,
            name: data.name || '',
            phone: data.phone || '',
            email: data.email || '',
            company: data.company || '',
            createdAt: data.createdAt?.toDate() || new Date(),
            lastActivity: data.lastActivity?.toDate(),
            tags: data.tags || [],
            avatar: data.avatar || ''
          });
        });
        setContacts(contactsData);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los contactos.'
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-orange-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-ES', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Hace menos de una hora';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} horas`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} días`;
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      contact.phone?.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower) ||
      contact.company?.toLowerCase().includes(searchLower)
    );
  });

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Contactos
          </h1>
          <p className="text-slate-500 mt-1">
            Gestiona tus contactos y listas inteligentes con herramientas avanzadas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-200 shadow-sm hidden sm:flex" onClick={handleExportContacts}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <div className="flex items-center gap-1">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md active:scale-95" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Contacto
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 border border-transparent hover:border-slate-200">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Acciones de gestión</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Gestionar listas inteligentes</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  <span>Restaurar / Restablecer</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleDeleteSelected}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Eliminar seleccionados ({selectedContacts.length})</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-px">
          <TabsList className="bg-transparent p-0 h-auto flex flex-wrap gap-2 sm:gap-6">
            <TabsTrigger
              value="smart-lists"
              className="px-2 py-3 text-sm font-semibold text-slate-500 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none transition-all"
            >
              Listas inteligentes
            </TabsTrigger>
            <TabsTrigger
              value="mass-actions"
              className="px-2 py-3 text-sm font-semibold text-slate-500 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none transition-all"
            >
              Acciones masivas
            </TabsTrigger>
            <TabsTrigger
              value="tasks"
              className="px-2 py-3 text-sm font-semibold text-slate-500 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none transition-all"
            >
              Tareas
            </TabsTrigger>
            <TabsTrigger
              value="companies"
              className="px-2 py-3 text-sm font-semibold text-slate-500 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none transition-all"
            >
              Empresas
            </TabsTrigger>
          </TabsList>

          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600 gap-2 shrink-0 self-start sm:self-auto">
            <Settings className="h-4 w-4" />
            <span>Configuración</span>
          </Button>
        </div>

        {/* Info Message */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-600">
          Las opciones de menú «Gestionar listas inteligentes» y «Restaurar» cambian de sitio. A partir del 29 de enero de 2026, las encontrará en el menú de acciones (:) junto al botón «Añadir contacto».
        </div>

        <TabsContent value="smart-lists" className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">Todos los contactos</h2>
              <div className="flex items-center bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold ring-1 ring-blue-100">
                {filteredContacts.length}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="bg-white border-slate-200 hover:bg-slate-50 shadow-sm">
                <Download className="h-3.5 w-3.5 mr-2 text-slate-500" />
                Importar
              </Button>
              <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600 flex items-center gap-2">
                <Filter className="h-3.5 w-3.5" />
                Filtros
              </Button>
              <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600 flex items-center gap-2">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Ordenar
              </Button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-3 flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg ring-1 ring-slate-200">
                <List className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Vista Predeterminada
                </span>
              </div>
            </div>

            <div className="lg:col-span-6 flex items-center gap-2">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Busca por nombre, email o empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white border-slate-200 rounded-lg shadow-sm focus-visible:ring-blue-500 h-10"
                />
              </div>
            </div>

            <div className="lg:col-span-3 flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" className="h-10 text-slate-600 hover:text-blue-600 border-slate-200 hover:bg-slate-50">
                <Plus className="h-3.5 w-3.5 mr-2" />
                Lista
              </Button>
              <Button variant="outline" size="sm" className="h-10 text-slate-600 hover:text-blue-600 border-slate-200 hover:bg-slate-50">
                <Settings className="h-3.5 w-3.5 mr-2" />
                Campos
              </Button>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {filteredContacts.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-900">Sin contactos</h3>
                <p className="text-slate-500 text-sm">No hay resultados para tu búsqueda.</p>
              </div>
            ) : (
              filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm active:bg-slate-50 transition-colors"
                  onClick={() => toggleContactSelection(contact.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {contact.avatar ? (
                        <img src={contact.avatar} className="w-10 h-10 rounded-full ring-2 ring-blue-50" />
                      ) : (
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold", getAvatarColor(contact.name))}>
                          {getInitials(contact.name)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900">{contact.name}</h4>
                        <p className="text-xs text-slate-500">{contact.company || 'Sin empresa'}</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => { }} // Controlled by parent div click
                      className="rounded text-blue-600 h-4 w-4"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Phone className="h-3 w-3 text-slate-400" />
                      {contact.phone || '-'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Mail className="h-3 w-3 text-slate-400" />
                      <span className="truncate">{contact.email || '-'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex gap-1">
                      {contact.tags?.slice(0, 2).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] bg-slate-100 text-slate-600 border-none">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-400">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Contacts Table - Desktop Only */}
          <Card className="shadow-sm border border-slate-200 hidden lg:block overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50 border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-4 text-left w-10">
                        <input
                          type="checkbox"
                          checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </th>
                      <th className="px-5 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                        <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-800 transition-colors">
                          Contacto
                          <ChevronDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-5 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                        <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-800 transition-colors">
                          Teléfono
                          <ChevronDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-5 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                        <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-800 transition-colors">
                          Email
                          <ChevronDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-5 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                        <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-800 transition-colors">
                          Empresa
                          <ChevronDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-5 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                        <div className="flex items-center gap-1.5 cursor-pointer hover:text-slate-800 transition-colors">
                          Creado
                          <ChevronDown className="h-3 w-3" />
                        </div>
                      </th>
                      <th className="px-5 py-4 text-left text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                        Etiquetas
                      </th>
                      <th className="px-5 py-4 text-right">
                        <Settings className="h-4 w-4 text-slate-300 ml-auto" />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {filteredContacts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-20 text-center">
                          <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                            <div className="bg-slate-50 p-4 rounded-full mb-4">
                              <Users className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-slate-900 font-bold mb-1">No hay contactos</h3>
                            <p className="text-slate-500 text-sm">Prueba a cambiar los filtros o agrega un nuevo contacto para empezar.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredContacts.map((contact) => (
                        <tr key={contact.id} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                          <td className="px-5 py-4">
                            <input
                              type="checkbox"
                              checked={selectedContacts.includes(contact.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleContactSelection(contact.id);
                              }}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {contact.avatar ? (
                                <img
                                  src={contact.avatar}
                                  alt={contact.name}
                                  className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                                />
                              ) : (
                                <div className={cn(
                                  "w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white",
                                  getAvatarColor(contact.name)
                                )}>
                                  {getInitials(contact.name)}
                                </div>
                              )}
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {contact.name || 'Sin nombre'}
                                </span>
                                {contact.tags && contact.tags.length > 0 && (
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {contact.tags[0]}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-700 font-medium">
                            {contact.phone || '-'}
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600">
                            {contact.email ? (
                              <span className="truncate block max-w-[180px] hover:text-blue-600 transition-colors">
                                {contact.email}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-600 font-medium">
                            <div className="flex items-center gap-2">
                              {contact.company ? (
                                <>
                                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                                  <span className="truncate max-w-[140px]">{contact.company}</span>
                                </>
                              ) : '-'}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-700">{formatDate(contact.createdAt).split(',')[0]}</span>
                              <span className="text-[10px]">{formatDate(contact.createdAt).split(',')[1]}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {contact.tags?.slice(0, 2).map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-[10px] bg-slate-100 text-slate-600 border-none font-bold px-2 py-0"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {contact.tags && contact.tags.length > 2 && (
                                <span className="text-[10px] font-bold text-slate-400">+{contact.tags.length - 2}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors opacity-0 group-hover:opacity-100">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Tabs Content */}
        <TabsContent value="mass-actions" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center text-slate-500">
              Acciones masivas
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reset" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center text-slate-500">
              Restablecer
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center text-slate-500">
              Tareas
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center text-slate-500">
              Empresas
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage-lists" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center text-slate-500">
              Gestionar listas inteligentes
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog Agregar Contacto */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800">
              <Plus className="h-5 w-5 text-blue-600" />
              Agregar Contacto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="contact-name" className="text-sm font-semibold">Nombre *</label>
              <Input
                id="contact-name"
                placeholder="Nombre completo"
                value={newContact.name}
                onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-phone" className="text-sm font-semibold">Teléfono</label>
              <Input
                id="contact-phone"
                placeholder="Ej: +54 9 11 1234-5678"
                value={newContact.phone}
                onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-email" className="text-sm font-semibold">Email</label>
              <Input
                id="contact-email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={newContact.email}
                onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-company" className="text-sm font-semibold">Empresa</label>
              <Input
                id="contact-company"
                placeholder="Nombre de la empresa"
                value={newContact.company}
                onChange={(e) => setNewContact(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancelar</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddContact}
              disabled={savingContact}
            >
              {savingContact ? 'Guardando...' : 'Agregar Contacto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
