import React from 'react';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1600&q=80';

const PROMO_ITEMS = [
  'ENVÍO GRATIS SUPERANDO $150.000',
  '6 CUOTAS SIN INTERÉS',
  '25% OFF TRANSFERENCIA',
  '30% OFF EFECTIVO',
];

interface CategoryBannerProps {
  name: string;
  image?: string | null;
}

export const CategoryBanner: React.FC<CategoryBannerProps> = ({ name, image }) => {
  const bgImage = image || DEFAULT_IMAGE;

  return (
    <section className="relative w-full min-h-[160px] sm:min-h-[200px] md:min-h-[240px] lg:min-h-[280px] overflow-hidden bg-gray-900">
      <img
        src={bgImage}
        alt=""
        width="1600"
        height="300"
        className="absolute inset-0 w-full h-full object-cover opacity-80"
        loading="eager"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20"
        aria-hidden
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white uppercase tracking-wide drop-shadow-lg px-4 text-center">
          {name}
        </h1>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gray-900/95 text-white z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20">
          {PROMO_ITEMS.map((text, i) => (
            <div
              key={i}
              className="py-2.5 md:py-3 px-3 md:px-4 text-center text-[10px] sm:text-xs md:text-sm font-medium"
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
