import React from 'react';
import { useNavigate } from 'react-router-dom';

export const CategoryCards: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'disenador',
      title: 'DISEÑADOR',
      subtitle: 'PERFUMES IMPORTADOS',
      image: '/disenador_banner.png',
      path: '/categoria/Diseñador'
    },
    {
      id: 'arabes',
      title: 'ÁRABES',
      subtitle: 'ORIENTAL & EXÓTICO',
      image: '/arabe_banner.png',
      path: '/categoria/Árabe'
    },
    {
      id: 'nicho',
      title: 'NICHO',
      subtitle: 'AUTOR & EXCLUSIVIDAD',
      image: '/nicho_banner.png',
      path: '/categoria/Nicho'
    },
    {
      id: 'decants',
      title: 'DECANTS',
      subtitle: 'PROBÁ ANTES DE COMPRAR',
      image: '/decants_banner.png',
      path: '/categoria/Decants'
    }
  ];

  return (
    <div className="w-full max-w-[1800px] mx-auto px-4 md:px-6 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div 
            key={cat.id}
            className="relative aspect-[16/9] sm:aspect-[4/3] lg:aspect-[3/4] overflow-hidden rounded-3xl group cursor-pointer"
            onClick={() => navigate(cat.path)}
          >
            {/* Background Image with overlay */}
            <img 
              src={cat.image} 
              alt={cat.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-4 xl:p-6 text-center">
              <h2 className="text-white text-2xl sm:text-3xl md:text-2xl lg:text-xl xl:text-3xl font-black tracking-tighter leading-none mb-1 drop-shadow-lg uppercase">
                {cat.title}
              </h2>
              {cat.subtitle && (
                <h3 className="text-white text-lg sm:text-xl md:text-lg lg:text-sm xl:text-lg font-black tracking-tighter leading-none mb-4 sm:mb-6 drop-shadow-lg uppercase opacity-90">
                  {cat.subtitle}
                </h3>
              )}
              
              <button 
                className="mt-2 sm:mt-4 px-6 py-2.5 sm:px-8 sm:py-3 border-2 border-white text-white text-[11px] sm:text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300 rounded-none shrink-0"
              >
                DESCUBRIR
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
