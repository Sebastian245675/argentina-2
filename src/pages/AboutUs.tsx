// ...existing code...

import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useCategories } from "@/hooks/use-categories";
import { TopPromoBar } from "@/components/layout/TopPromoBar";
import { AdvancedHeader } from "@/components/layout/AdvancedHeader";

const AboutUs = () => {
  const { categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [promoVisible, setPromoVisible] = useState(true);
  const [customInfo, setCustomInfo] = useState(null);
  const [infoEnabled, setInfoEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      const docRef = doc(db, "infoSections", "about");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCustomInfo(data.content || null);
        setInfoEnabled(data.enabled ?? false);
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
            <div className="w-full max-w-7xl mx-auto">
              <nav className="w-full text-sm text-gray-500 mb-6">
                <a href="/" className="font-semibold text-black hover:underline">Inicio</a>
                <span className="mx-2">&gt;</span>
                <span className="text-black">Sobre Nosotros</span>
              </nav>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-black mb-4 tracking-tight w-full">
                Sobre Nosotros
              </h1>
              {loading ? (
                <div className="text-center text-blue-500">Cargando información...</div>
              ) : infoEnabled && customInfo ? (
                <div className="text-lg md:text-xl text-gray-700 mb-8 font-normal leading-relaxed w-full max-w-none whitespace-pre-line">
                  {customInfo}
                </div>
              ) : (
                <>
                  <h2 className="text-2xl md:text-3xl font-serif font-semibold text-black mb-10 w-full">¿Quiénes Somos?</h2>
                  <p className="text-lg md:text-xl text-gray-700 mb-8 font-normal leading-relaxed w-full max-w-none">
                    Somos una tienda digital pensada para que encuentres ese regalo ideal que estabas buscando, al mejor precio del mercado.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 mb-8 font-normal leading-relaxed w-full max-w-none">
                    Ofrecemos una amplia variedad de productos: desde peluches, mates parlantes, bicicletas, electrodomésticos, hasta artículos únicos y originales para sorprender o darte un gusto.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 mb-8 font-normal leading-relaxed w-full max-w-none">
                    Nuestra misión es clara: que puedas comprar de forma rápida, segura y con la confianza de que estás haciendo una buena elección.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 mb-8 font-normal leading-relaxed w-full max-w-none">
                    ✨ Porque sabemos que regalar es una forma de decir mucho sin palabras, trabajamos día a día para que en nuestra tienda siempre encuentres algo especial.
                  </p>
                  <p className="text-lg md:text-xl text-gray-700 mb-8 font-normal leading-relaxed w-full max-w-none font-bold">
                    "Encontrá tu regalo ideal al mejor precio" no es solo nuestro eslogan, es un compromiso.
                  </p>
                  
                  <div className="mt-10 mb-8 p-6 border rounded-lg bg-gray-50">
                    <h3 className="text-xl font-bold mb-4">Nuestra Ubicación</h3>
                    <p className="mb-4">📍 Olavarría 610 (esquina San Luis), Salta, Argentina</p>
                    <a href="https://maps.app.goo.gl/gonu6cj9cJnDfJBz5?g_st=aw" 
                       className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
                      <span>📍 Cómo llegar</span>
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-muted/50 py-12 mt-16">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-orange rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="text-lg font-bold gradient-text-orange">REGALA ALGO</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Tu tienda premium con los mejores productos y atención personalizada.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Productos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Electrónicos</li>
                <li>Audio</li>
                <li>Gaming</li>
                <li>Fotografía</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Centro de Ayuda</li>
                <li>Garantías</li>
                <li>Devoluciones</li>
                <li>Contacto</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>📍 Olavarría 610 (esquina San Luis)</li>
                <li>
                  <a href="https://maps.app.goo.gl/gonu6cj9cJnDfJBz5?g_st=aw" 
                     className="text-blue-600 hover:underline">
                    Ver en el mapa
                  </a>
                </li>
                <li>WhatsApp: +54 3873439775</li>
                <li>Instagram: <a href="https://www.instagram.com/regala.algo?igsh=OWk2enhxYzg2eHVq" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">regala.algo</a></li>
                <li>Facebook: Regala Algo</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 REGALA ALGO. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;

