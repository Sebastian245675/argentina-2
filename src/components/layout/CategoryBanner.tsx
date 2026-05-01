import React from 'react';

/* ─── Configuración por categoría ───────────────────────────────────── */
interface CategoryConfig {
  image: string;
  tagline: string;
  title: string;
  subtitle: string;
  description: string;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  'arabe': {
    image: '/arabe_banner.png',
    tagline: 'EXPERIENCIA SENSORIAL ÚNICA',
    title: 'La Esencia de la',
    subtitle: 'Sofisticación',
    description: 'Descubre fragancias orientales premium que definen tu presencia con cada nota.',
  },
  'árabe': {
    image: '/arabe_banner.png',
    tagline: 'EXPERIENCIA SENSORIAL ÚNICA',
    title: 'La Esencia de la',
    subtitle: 'Sofisticación',
    description: 'Descubre fragancias orientales premium que definen tu presencia con cada nota.',
  },
  'nicho': {
    image: '/nicho_banner.png',
    tagline: 'ARTE LÍQUIDO EN ESTADO PURO',
    title: 'Fragancias de',
    subtitle: 'Autor',
    description: 'Creaciones únicas para quienes buscan ir más allá de lo convencional.',
  },
  'diseñador': {
    image: '/disenador_banner.png',
    tagline: 'ÍCONOS DEL LUJO MUNDIAL',
    title: 'El Arte de la',
    subtitle: 'Elegancia',
    description: 'Las grandes maisons del mundo. Clásicos atemporales para espíritus distinguidos.',
  },
  'decants': {
    image: '/decants_banner.png',
    tagline: 'PROBÁ ANTES DE ELEGIR',
    title: 'Tu próximo',
    subtitle: 'Favorito',
    description: 'Explorá el universo de fragancias premium en pequeñas dosis sin compromiso.',
  },
};

const DEFAULT_CONFIG: CategoryConfig = {
  image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=1600&q=80',
  tagline: 'COLECCIÓN PREMIUM',
  title: 'Descubrí',
  subtitle: 'Tu Fragancia',
  description: 'Una selección curada de los mejores perfumes del mundo.',
};

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

export const CategoryBanner: React.FC<CategoryBannerProps> = ({ name }) => {
  const key = name.toLowerCase();
  const config = CATEGORY_CONFIG[key] ?? DEFAULT_CONFIG;

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ minHeight: '200px', height: 'clamp(200px, 28vw, 360px)', backgroundColor: '#f8f5f0' }}
    >
      {/* Imagen de fondo — LCP: fetchPriority high, eager */}
      <img
        src={config.image}
        srcSet={`${config.image}?w=640 640w, ${config.image} 1600w`}
        sizes="100vw"
        alt={name}
        width="1600"
        height="900"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
        fetchPriority="high"
      />



      {/* ─── Texto superpuesto — totalmente responsive ─────── */}
      <div
        className="absolute inset-0 flex flex-col justify-center z-20"
        style={{
          padding: 'clamp(0.5rem,2vw,1.5rem) 0 clamp(3rem,5vw,4rem) clamp(0.75rem,3vw,3rem)',
        }}
      >
        {/* Tagline con línea dorada */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
          <div style={{ height: '1px', width: '16px', backgroundColor: 'hsl(214,100%,15%)', flexShrink: 0 }} />
          <span
            style={{
              color: 'hsl(214,100%,15%)',
              fontSize: 'clamp(7px, 1.6vw, 9px)',
              letterSpacing: '0.2em',
              fontWeight: 700,
              textTransform: 'uppercase',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {config.tagline}
          </span>
        </div>

        {/* Título principal */}
        <h1
          style={{
            color: '#1a1a2e',
            fontSize: 'clamp(1rem, 2.8vw, 1.9rem)',
            fontWeight: 300,
            lineHeight: 1.15,
            fontFamily: "'Outfit', sans-serif",
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          {config.title}
        </h1>

        {/* Subtítulo dorado itálico */}
        <span
          style={{
            color: 'hsl(214,100%,15%)',
            fontSize: 'clamp(1rem, 2.8vw, 1.9rem)',
            fontWeight: 600,
            fontStyle: 'italic',
            fontFamily: "'Cormorant Garamond', serif",
            lineHeight: 1.2,
            display: 'block',
            marginBottom: '6px',
          }}
        >
          {config.subtitle}
        </span>

        {/* Línea separadora dorada */}
        <div style={{ width: '20px', height: '2px', backgroundColor: 'hsl(214,100%,15%)', marginBottom: '6px' }} />

        {/* Descripción — visible solo en pantallas ≥sm */}
        <p
          className="hidden sm:block"
          style={{
            color: '#3d3d3d',
            fontSize: 'clamp(0.58rem, 0.9vw, 0.72rem)',
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 400,
            maxWidth: '240px',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {config.description}
        </p>
      </div>

      {/* ─── Barra de promos inferior ───────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-20"
        style={{ backgroundColor: 'rgba(8,8,8,0.88)', backdropFilter: 'blur(4px)' }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {PROMO_ITEMS.map((text, i) => (
            <div
              key={i}
              className="py-1.5 md:py-2 px-2 md:px-4 text-center font-medium tracking-wide"
              style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(8px, 2vw, 10px)' }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
