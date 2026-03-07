import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { StepComponentProps } from '../types';

export const OffersStep: React.FC<StepComponentProps> = ({ 
  formData, 
  setFormData 
}) => {
  const discountPercentage = formData.originalPrice && formData.price && parseFloat(formData.originalPrice) > parseFloat(formData.price)
    ? Math.round((1 - (parseFloat(formData.price) / parseFloat(formData.originalPrice))) * 100)
    : formData.discount ? parseFloat(formData.discount) : 0;

  return (
    <div className="space-y-6">
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-900">
          <strong>Ofertas y Promociones</strong>
        </p>
        <p className="text-sm text-green-700 mt-1">
          Configura descuentos y ofertas especiales para este producto
        </p>
      </div>

      {/* Activar Oferta */}
      <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
        <input
          type="checkbox"
          id="isOffer"
          checked={formData.isOffer}
          onChange={(e) => setFormData({ ...formData, isOffer: e.target.checked })}
          className="w-5 h-5 rounded text-green-600 focus:ring-2 focus:ring-green-500"
        />
        <Label htmlFor="isOffer" className="text-base font-semibold cursor-pointer flex items-center gap-2">
          Activar oferta especial
          <Badge variant="outline" className={formData.isOffer ? 'bg-green-50 text-green-700 border-green-200' : ''}>
            {formData.isOffer ? 'Activo' : 'Inactivo'}
          </Badge>
        </Label>
      </div>

      {/* Campos de Oferta */}
      {formData.isOffer && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="space-y-2">
            <Label htmlFor="originalPrice" className="text-sm font-semibold text-gray-700">
              Precio Original
            </Label>
            <Input
              id="originalPrice"
              type="number"
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
              placeholder="Ej: 15000"
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount" className="text-sm font-semibold text-gray-700">
              Descuento (%)
            </Label>
            <Input
              id="discount"
              type="number"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              placeholder="Ej: 20"
              className="h-11"
            />
          </div>

          {/* Vista Previa */}
          {formData.originalPrice && formData.price && (
            <div className="md:col-span-2 p-3 bg-white border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</p>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400 line-through">
                  ${parseFloat(formData.originalPrice).toLocaleString('es-AR')}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  ${parseFloat(formData.price).toLocaleString('es-AR')}
                </span>
                {discountPercentage > 0 && (
                  <Badge className="bg-red-600">
                    -{discountPercentage}% OFF
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
