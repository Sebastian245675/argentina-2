import React from 'react';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1600&q=80';

const PROMO_ITEMS = [
  '3 DECANTS x $25.000',
  '3 CUOTAS SIN INTERÉS',
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
    <section className="relative w-full min-h-[160px] sm:min-h-[200px] md:min-h-[240px] lg:min-h-[280px] overflow-hidden bg-gray-100">
      <img
        src={bgImage}
        alt=""
        width="1600"
        height="300"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />

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
