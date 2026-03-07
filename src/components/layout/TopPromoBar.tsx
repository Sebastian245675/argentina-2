import React, { useState } from "react";

export const TopPromoBar: React.FC<{ setPromoVisible?: (v: boolean) => void }> = ({ setPromoVisible }) => {
  return (
    <div className="bg-white text-black text-[11px] md:text-xs font-semibold tracking-wide py-2.5 text-center w-full z-[60] relative border-b border-gray-200">
      <div className="max-w-[1800px] mx-auto px-4 hidden md:block">
        6 CUOTAS SIN INTERES | 25% OFF TRANSFERENCIA | 30% OFF EFECTIVO | ENVIO GRATIS SUPERANDO $150.000
      </div>
      <div className="md:hidden px-2">
        30% OFF EFECTIVO | 6 CUOTAS SIN INTERES
      </div>
    </div>
  );
};