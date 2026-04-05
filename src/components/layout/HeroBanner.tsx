import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1600&q=80',
    alt: 'Fragancias',
  },
  {
    img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1600&q=80',
    alt: 'Perfumes',
  },
  {
    img: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=1600&q=80',
    alt: 'Decants',
  },
];

export const HeroBanner: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const goPrev = () => setCurrent((p) => (p === 0 ? SLIDES.length - 1 : p - 1));
  const goNext = () => setCurrent((p) => (p + 1) % SLIDES.length);

  return (
    <section className="relative w-full min-h-[220px] sm:min-h-[280px] md:min-h-[340px] lg:min-h-[380px] overflow-hidden bg-gray-200">
      {/* Slides */}
      {SLIDES.map((slide, idx) => (
        <div
          key={slide.img}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${current === idx ? 'opacity-100 z-0' : 'opacity-0 z-0'
            }`}
        >
          <img
            src={`${slide.img}&auto=format&fit=crop&w=1200&q=75`}
            alt={slide.alt}
            width="1200"
            height="500"
            className="w-full h-full object-cover"
            draggable={false}
            loading={idx === 0 ? "eager" : "lazy"}
            {...({ fetchpriority: idx === 0 ? "high" : "low" } as any)}
          />
        </div>
      ))}

      {/* Overlay suave para legibilidad */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none z-10"
        aria-hidden
      />

      {/* Contenido central */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
        <img
          src="/logo%20vifum.png"
          alt="VISFUM"
          width="180"
          height="70"
          className="h-10 md:h-14 w-auto object-contain mb-3 md:mb-4 drop-shadow-lg"
        />
        <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white italic drop-shadow-lg tracking-tight">
          ENVÍO GRATIS
        </p>
        <p className="text-base sm:text-lg md:text-xl text-white/95 mt-1 md:mt-2 drop-shadow-md">
          EN FRAGANCIAS ÁRABES
        </p>
      </div>

      {/* Barra promocional inferior */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-gray-900/90 text-white py-2.5 md:py-3 px-4 md:px-6 flex flex-nowrap items-center md:justify-center gap-4 md:gap-6 text-[10px] md:text-sm font-medium z-20 overflow-x-auto touch-pan-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          PROMOS
        </span>
        <span className="text-white/40 shrink-0">|</span>
        <span className="shrink-0">3 DECANTS x $25.000</span>
        <span className="text-white/40 shrink-0">|</span>
        <span className="shrink-0">30% OFF EFECTIVO / 25% OFF TRANSF.</span>
        <span className="text-white/40 shrink-0">|</span>
        <span className="shrink-0">3 CUOTAS (CON COSTO DE SERVICIO)</span>
      </div>

      {/* Flechas */}
      <button
        type="button"
        onClick={goPrev}
        className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-all z-30"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button
        type="button"
        onClick={goNext}
        className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-all z-30"
        aria-label="Siguiente"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-14 md:bottom-16 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrent(idx)}
            className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 transition-all ${current === idx
              ? 'bg-white border-white'
              : 'bg-white/50 border-white/50 hover:bg-white/70 hover:border-white/70'
              }`}
            aria-label={`Ir a imagen ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
