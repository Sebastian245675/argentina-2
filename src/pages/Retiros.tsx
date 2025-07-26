import React, { useEffect, useState } from "react";
import { TopPromoBar } from "@/components/layout/TopPromoBar";
import { AdvancedHeader } from "@/components/layout/AdvancedHeader";
import { useCategories } from "@/hooks/use-categories";
import { db } from '@/firebase';
import { getDoc, doc } from 'firebase/firestore';


const Retiros = () => {
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = React.useState("Todos");
  const [promoVisible, setPromoVisible] = React.useState(true);
  const [info, setInfo] = useState<{ content: string; enabled: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      const docRef = doc(db, 'infoSections', 'retiros');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setInfo({
          content: docSnap.data().content || '',
          enabled: docSnap.data().enabled ?? false,
        });
      } else {
        setInfo(null);
      }
      setLoading(false);
    };
    fetchInfo();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {promoVisible && <TopPromoBar setPromoVisible={setPromoVisible} />}
      <AdvancedHeader
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        promoVisible={promoVisible}
      />
      <main className="flex-1 flex flex-col">
        <section className="flex-1 min-h-[calc(100vh-8rem)] w-full flex flex-col justify-center items-center bg-white">
          <div className="flex flex-col w-full items-center pt-40 pb-24 md:pt-56 md:pb-32">
            <div className="w-full max-w-4xl mx-auto">
              <nav className="w-full text-sm text-gray-500 mb-6">
                <a href="/" className="font-semibold text-black hover:underline">Inicio</a>
                <span className="mx-2">&gt;</span>
                <span className="text-black">Retiros</span>
              </nav>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-black mb-4 tracking-tight w-full">
                Retiros
              </h1>
              {loading ? (
                <div className="text-lg text-gray-500">Cargando información...</div>
              ) : info && info.enabled ? (
                <div className="prose prose-lg max-w-none text-gray-800" dangerouslySetInnerHTML={{ __html: info.content.replace(/\n/g, '<br />') }} />
              ) : (
                <div className="prose prose-lg max-w-none text-gray-800">
                  <h2 className="text-2xl md:text-3xl font-serif font-semibold text-black mb-10 w-full flex items-center gap-2">Condiciones de Retiro en Depósito - La Mueblería Online</h2>
                  <p className="text-lg md:text-xl text-gray-700 mb-8 font-normal leading-relaxed w-full max-w-none">
                    Estimado/a Cliente:
                  </p>
                  <p className="text-base md:text-lg text-gray-700 mb-6 w-full max-w-none">
                    Si seleccionaste la opción de retirar tu pedido en nuestro depósito ubicado en <b>Av. Gob. Inocencio Arias 3345, Castelar, GBA</b>, te detallamos las condiciones para garantizar un retiro ágil y seguro:
                  </p>
                  <h3 className="text-2xl font-bold font-serif text-black mb-4 mt-8 w-full">Días y Horarios de Retiro:</h3>
                  <ul className="list-disc pl-6 text-base md:text-lg text-gray-700 mb-6 w-full max-w-none">
                    <li>De lunes a viernes, de 9:00 a 13:00 hs.</li>
                  </ul>
                  <h3 className="text-2xl font-bold font-serif text-black mb-4 mt-8 w-full">Coordinación Previa:</h3>
                  <p className="text-base md:text-lg text-gray-700 mb-6 w-full max-w-none">
                    Es obligatorio coordinar una cita con nuestro equipo antes de retirar tu pedido, para asegurarnos de que esté listo cuando llegues.
                  </p>
                  <h3 className="text-2xl font-bold font-serif text-black mb-4 mt-8 w-full">Personal para Carga:</h3>
                  <p className="text-base md:text-lg text-gray-700 mb-6 w-full max-w-none">
                    No disponemos de personal para carga o descarga en el depósito. Por lo tanto, te sugerimos venir con al menos 2 personas para un retiro seguro.
                  </p>
                  <h3 className="text-2xl font-bold font-serif text-black mb-4 mt-8 w-full">Documentación:</h3>
                  <p className="text-base md:text-lg text-gray-700 mb-6 w-full max-w-none">
                    Traé tu comprobante de compra o DNI para verificar tu identidad en el momento del retiro.
                  </p>
                  <h3 className="text-2xl font-bold font-serif text-black mb-4 mt-8 w-full">Recomendación:</h3>
                  <p className="text-base md:text-lg text-gray-700 mb-6 w-full max-w-none">
                    Si no contás con un vehículo adecuado, te recomendamos contratar un servicio de flete para el traslado de los productos.
                  </p>
                  <h2 className="text-2xl md:text-3xl font-serif font-semibold text-black mb-10 w-full flex items-center gap-2 mt-12">Modalidad TAKE AWAY</h2>
                  <p className="text-base md:text-lg text-gray-700 mb-6 w-full max-w-none">
                    Aplica a algunos productos específicos (no todos) exhibidos en nuestro local de <b>Av. Belgrano 2399, CABA</b>, que podés retirar de manera inmediata luego del pago. El pago puede ser en efectivo, tarjeta de débito o crédito.
                  </p>
                  <div className="mb-6 text-base md:text-lg text-gray-700 w-full max-w-none">
                    <b>Importante:</b>
                    <ul className="list-disc pl-6 mt-2">
                      <li>No contamos con personal para la carga y descarga en el local, por lo que la responsabilidad de la carga y acarreo del producto es exclusivamente del comprador.</li>
                      <li>Además, los productos exhibidos no cuentan con su embalaje original, por lo que recomendamos contratar un flete con experiencia en muebles y que venga preparado con mantas protectoras y al menos dos personas para asegurar una carga segura.</li>
                    </ul>
                  </div>
                  <p className="text-base md:text-lg text-gray-700 mb-8 w-full max-w-none">
                    Quedamos a tu disposición para cualquier consulta.<br />
                    Gracias por elegirnos. ¡Esperamos que disfrutes de tu compra!
                  </p>
                  <div className="mt-10 w-full max-w-none">
                    <span className="block text-lg md:text-xl text-gray-500 mb-2">Saludos cordiales,</span>
                    <span className="block text-2xl md:text-3xl font-semibold font-serif text-black mt-2">La Mueblería Online, Equipo Post-Venta</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      {/* Advanced Footer */}
      <footer className="relative py-20 mt-20 bg-neutral-800">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="w-[95%] mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-12 mb-12">
            <div className="space-y-6 lg:col-span-2">
              <div className="flex items-center space-x-3">
                <img src="/logo-nuevo.png" alt="REGALA ALGO Logo" className="h-16 w-auto" />
              </div>
              <p className="text-gray-300 leading-relaxed">
                La mejor experiencia de compra para encontrar el regalo perfecto. Tecnología de vanguardia al servicio de tu comodidad.
              </p>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/Regalo.Algo" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <svg className="h-7 w-7 text-pink-400 hover:text-pink-600 transition" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://www.facebook.com/RegalaAlgo" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <svg className="h-7 w-7 text-blue-500 hover:text-blue-700 transition" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </a>
                <a href="https://wa.me/573001234567" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                  <svg className="h-7 w-7 text-green-500 hover:text-green-700 transition" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Soporte 24/7</h4>
              <ul className="space-y-4 text-gray-300">
                <li>Atención personalizada por WhatsApp</li>
                <li>Resolvemos tus dudas y consultas</li>
                <li>Seguimiento de pedidos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Contacto</h4>
              <div className="space-y-4 text-gray-300">
                <div>Email: <a href="mailto:info@regalaalgo.com" className="text-blue-400 hover:underline">info@regalaalgo.com</a></div>
                <div>WhatsApp: <a href="https://wa.me/573001234567" className="text-green-400 hover:underline">+57 300 123 4567</a></div>
                <div>Instagram: <a href="https://www.instagram.com/Regalo.Algo" className="text-pink-400 hover:underline">@Regalo.Algo</a></div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 text-lg">Enlaces Rápidos</h4>
              <ul className="space-y-4 text-gray-300">
                <li><a href="/" className="hover:underline">Inicio</a></li>
                <li><a href="/aboutus" className="hover:underline">Sobre Nosotros</a></li>
                <li><a href="/envios" className="hover:underline">Envíos</a></li>
                <li><a href="/retiros" className="hover:underline">Retiros</a></li>
                <li><a href="/" className="hover:underline">Catálogo</a></li>
              </ul>
            </div>
          </div>
          <div className="p-6 bg-neutral-700/80 border-none rounded-2xl shadow-xl mt-8">
            <div className="text-center">
              <p className="text-gray-200">
                &copy; 2025 REGALA ALGO Premium. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Retiros;
