import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-20 pt-16 pb-8">
      <div className="w-full max-w-[1800px] mx-auto px-4 md:px-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Column 1: About/Logo */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img src="/logo%20vifum.png" alt="VISFUM" width="40" height="40" className="h-10 w-auto object-contain" />
              <span className="text-lg font-black tracking-tighter uppercase">VISFUM</span>
            </div>
            <p className="text-[13px] text-gray-700 leading-relaxed max-w-[240px]">
              Tu destino premium para fragancias, decants y productos de belleza de las mejores marcas del mundo.
            </p>
            <div className="flex gap-5">
              <a href="https://www.instagram.com/visfum?igsh=b3c1ZzIyOWw2MG95" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors bg-white p-2 rounded-full border border-gray-200" aria-label="Síguenos en Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors bg-white p-2 rounded-full border border-gray-200" aria-label="Síguenos en Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@visfumarg" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors bg-white p-2 rounded-full border border-gray-200" aria-label="Síguenos en TikTok">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.16z"/>
                </svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors bg-white p-2 rounded-full border border-gray-200" aria-label="Síguenos en Youtube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-900 border-b border-gray-200 pb-2">
              Categorías
            </h3>
            <ul className="space-y-4">
              <li><Link to="/categoria/Fragancias" className="text-gray-700 hover:text-blue-600 text-[14px] font-bold transition-colors py-1 block">Fragancias</Link></li>
              <li><Link to="/categoria/Decants" className="text-gray-700 hover:text-blue-600 text-[14px] font-bold transition-colors py-1 block">Decants</Link></li>
              <li><Link to="/categoria/Combos%20Decants" className="text-gray-700 hover:text-blue-600 text-[14px] font-bold transition-colors py-1 block">Combos Decants</Link></li>
              <li><Link to="/categoria/Sprays%20(2x1)" className="text-gray-700 hover:text-blue-600 text-[14px] font-bold transition-colors py-1 block">Sprays (2x1)</Link></li>
              <li><Link to="/categoria/Marcas" className="text-gray-700 hover:text-blue-600 text-[14px] font-bold transition-colors py-1 block">Marcas</Link></li>
              <li><Link to="/categoria/Beauty" className="text-gray-700 hover:text-blue-600 text-[14px] font-bold transition-colors py-1 block">Beauty</Link></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-900 border-b border-gray-200 pb-2">
              Ayuda y Contacto
            </h3>
            <ul className="space-y-4">
              <li>
                <a href="https://wa.me/541126711308" target="_blank" rel="noopener noreferrer" className="flex flex-col group py-1">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">Asesor comercial 1</span>
                  <span className="text-[13px] font-black text-gray-900">+54 11 2671-1308</span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/5493872228571" target="_blank" rel="noopener noreferrer" className="flex flex-col group py-1">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">Asesor comercial 2</span>
                  <span className="text-[13px] font-black text-gray-900">+54 9 387 222-8571</span>
                </a>
              </li>
              <li>
                <a href="mailto:visfumarg@gmail.com" className="flex flex-col group py-1">
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1 group-hover:text-blue-600 transition-colors">Email</span>
                  <span className="text-[13px] font-black text-gray-900">visfumarg@gmail.com</span>
                </a>
              </li>
              <li>
                <Link to="/preguntas-frecuentes" className="text-gray-600 hover:text-blue-600 text-[13px] font-semibold transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-900 border-b border-gray-200 pb-2">
              Newsletter
            </h3>
            <p className="text-[13px] text-gray-700 leading-relaxed">
              Recibe las mejores ofertas y novedades directamente en tu email.
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm placeholder:text-gray-500"
                aria-label="Correo electrónico para newsletter"
              />
              <button
                className="w-full py-3 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-blue-700 shadow-md active:scale-[0.98] transition-all"
                aria-label="Suscribirme al newsletter"
              >
                Suscribirme ahora
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <img src="/icons/visa.svg" alt="Visa" width="40" height="20" className="h-5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <img src="/icons/mastercard.svg" alt="Mastercard" width="40" height="20" className="h-5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <img src="/icons/mercadopago.svg" alt="Mercado Pago" width="60" height="20" className="h-5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">Y más...</span>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-[11px] font-bold text-gray-900">
              VISFUM © {new Date().getFullYear()}. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6 text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em]">
              <Link to="/terminos" className="hover:text-blue-600 transition-colors py-2">Términos</Link>
              <Link to="/privacidad" className="hover:text-blue-600 transition-colors py-2">Privacidad</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
