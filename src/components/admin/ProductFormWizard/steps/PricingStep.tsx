import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StepComponentProps } from '../types';

export const PricingStep: React.FC<StepComponentProps> = ({ 
  formData, 
  setFormData,
  onValidationChange 
}) => {
  // Validación en tiempo real
  React.useEffect(() => {
    const isValid = !!(formData.price && formData.stock);
    onValidationChange?.(isValid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.price, formData.stock]);

  const margin = formData.price && formData.cost && parseFloat(formData.price) > 0 && parseFloat(formData.cost) > 0
    ? Math.round(((parseFloat(formData.price) - parseFloat(formData.cost)) / parseFloat(formData.price)) * 100)
    : null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Precio de Venta */}
        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-semibold">
            Precio de Venta <span className="text-red-500">*</span>
          </Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="Ej: 12500"
            required
            className={cn("h-11", formData.isOffer ? "bg-green-50 border-green-200" : "")}
            readOnly={formData.isOffer}
          />
          {formData.isOffer && (
            <p className="text-xs text-green-600 font-medium">
              ✨ Este precio se calcula automáticamente desde la pestaña de Ofertas ({formData.discount}% de descuento sobre ${parseFloat(formData.originalPrice || '0').toLocaleString('es-AR')})
            </p>
          )}
        </div>

        {/* Costo de Adquisición */}
        <div className="space-y-2">
          <Label htmlFor="cost" className="text-sm font-semibold flex items-center">
            Costo de Adquisición
            <span className="ml-2 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-xs font-medium">
              Uso interno
            </span>
          </Label>
          <Input
            id="cost"
            type="number"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            placeholder="Ej: 8000"
            className="h-11"
          />
          {margin !== null && (
            <div className="mt-2 text-xs">
              <span className="font-medium">Margen: </span>
              <span className="text-green-600 font-medium">{margin}%</span>
            </div>
          )}
        </div>

        {/* Stock */}
        <div className="space-y-2">
          <Label htmlFor="stock" className="text-sm font-semibold">
            Stock <span className="text-red-500">*</span>
          </Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            placeholder="Ej: 100"
            required
            className="h-11"
          />
        </div>

        {/* Estado de Publicación */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Estado de Publicación
          </Label>
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                formData.isPublished ? "bg-green-500" : "bg-gray-400"
              )}></div>
              <span className="text-xs text-gray-600">
                {formData.isPublished ? "Publicado" : "No publicado"}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>
          <p className="text-xs text-gray-500">
            {formData.isPublished 
              ? "✅ Visible para el público" 
              : "🔒 Solo visible internamente"}
          </p>
        </div>
      </div>

      {/* Opciones de Decant */}
      <div className="mt-6 p-4 rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/50 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-purple-800 flex items-center gap-2">
              🧪 ¿Es un Decant?
            </h3>
            <p className="text-xs text-purple-600 mt-0.5">
              Activa esta opción para configurar volúmenes individuales con precios distintos
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isDecant || false}
              onChange={(e) => setFormData({ 
                ...formData, 
                isDecant: e.target.checked,
                decantOptions: e.target.checked ? (formData.decantOptions || {
                  '2.5': { enabled: true, price: '' },
                  '5': { enabled: true, price: '' },
                  '10': { enabled: true, price: '' },
                }) : formData.decantOptions
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
          </label>
        </div>

        {formData.isDecant && (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-purple-700 font-medium">Configura los volúmenes disponibles y su precio:</p>
            
            {(['2.5', '5', '10'] as const).map((ml) => {
              const option = formData.decantOptions?.[ml] || { enabled: false, price: '' };
              return (
                <div key={ml} className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-all",
                  option.enabled 
                    ? "bg-white border-purple-300 shadow-sm" 
                    : "bg-gray-50 border-gray-200 opacity-60"
                )}>
                  {/* Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={option.enabled}
                      onChange={(e) => {
                        const newOptions = { ...(formData.decantOptions || {
                          '2.5': { enabled: false, price: '' },
                          '5': { enabled: false, price: '' },
                          '10': { enabled: false, price: '' },
                        }) };
                        newOptions[ml] = { ...newOptions[ml], enabled: e.target.checked };
                        setFormData({ ...formData, decantOptions: newOptions });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-500"></div>
                  </label>

                  {/* Label */}
                  <div className="flex items-center gap-2 min-w-[80px]">
                    <span className={cn(
                      "text-sm font-bold",
                      option.enabled ? "text-purple-800" : "text-gray-400"
                    )}>
                      {ml === '2.5' ? '2,5' : ml} ml
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex-1 max-w-[200px]">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                      <Input
                        type="number"
                        value={option.price}
                        onChange={(e) => {
                          const newOptions = { ...(formData.decantOptions || {
                            '2.5': { enabled: false, price: '' },
                            '5': { enabled: false, price: '' },
                            '10': { enabled: false, price: '' },
                          }) };
                          newOptions[ml] = { ...newOptions[ml], price: e.target.value };
                          setFormData({ ...formData, decantOptions: newOptions });
                        }}
                        placeholder="Precio"
                        disabled={!option.enabled}
                        className="h-9 pl-7 text-sm"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <span className={cn(
                    "text-xs font-medium px-2 py-1 rounded-full",
                    option.enabled 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-500"
                  )}>
                    {option.enabled ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              );
            })}

            <p className="text-[10px] text-purple-500 italic">
              💡 Solo los volúmenes activos se mostrarán al cliente. El precio principal del producto se usará como referencia si no se asigna precio individual.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
