import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { User as UserIcon, Mail, Phone, Building, MapPin } from "lucide-react";

export const UserProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    departmentNumber: "",
    address: ""
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Siempre refresca los datos del usuario desde Firestore al entrar
  useEffect(() => {
    const fetchUser = async () => {
      if (user?.id) {
        const userDoc = await getDoc(doc(db, "users", user.id));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFormData({
            name: data.name || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            departmentNumber: data.departmentNumber || data.conjunto || "",
            address: data.address || ""
          });
          console.log("✅ Información de usuario cargada:", data); // <-- LOG DE DEPURACIÓN
        } else {
          console.log("⚠️ No existe documento de usuario en Firestore para este UID");
        }
      }
    };
    fetchUser();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", user.id), {
        name: formData.name,
        phone: formData.phone,
        departmentNumber: formData.departmentNumber,
        address: formData.address
      });
      updateUser(formData); // Actualiza en el contexto
      toast({
        title: "Perfil actualizado",
        description: "Tus datos han sido guardados correctamente."
      });
      setEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar tu perfil.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <Card className="max-w-lg mx-auto mt-12">
        <CardContent className="p-8 text-center">
          <UserIcon className="h-10 w-10 mx-auto mb-4 text-orange-500" />
          <p className="text-muted-foreground">Debes iniciar sesión para ver tu perfil.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto mt-12 shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <UserIcon className="h-6 w-6 text-orange-600" />
          <span className="text-orange-600">Mi Perfil</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Nombre
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={!editing}
            className="h-11 text-gray-900 placeholder-gray-500 bg-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </label>
          <Input
            name="email"
            value={formData.email}
            disabled
            className="h-11 bg-gray-100 text-gray-900"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Teléfono
          </label>
          <Input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={!editing}
            className="h-11 text-gray-900 placeholder-gray-500 bg-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <Building className="h-4 w-4" />
            Apartamento / Conjunto
          </label>
          <Input
            name="departmentNumber"
            value={formData.departmentNumber}
            onChange={handleChange}
            disabled={!editing}
            className="h-11 text-gray-900 placeholder-gray-500 bg-white"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Dirección
          </label>
          <Input
            name="address"
            value={formData.address}
            onChange={handleChange}
            disabled={!editing}
            className="h-11 text-gray-900 placeholder-gray-500 bg-white"
          />
        </div>
        <div className="flex gap-3 pt-4">
          {editing ? (
            <>
              <Button
                onClick={handleSave}
                className="gradient-orange"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditing(false)}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setEditing(true)}
              className="gradient-orange"
            >
              Editar Perfil
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};