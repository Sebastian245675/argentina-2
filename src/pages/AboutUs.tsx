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
                Somos La Mueblería Online
              </h1>
              {loading ? (
                <div className="text-center text-blue-500">Cargando información...</div>
              ) : infoEnabled && customInfo ? (
                <div className="text-lg md:text-xl text-gray-700 mb-8 font-normal leading-relaxed w-full max-w-none whitespace-pre-line">
                  {customInfo}
                </div>
              ) : (
                <>
                  <h2 className="text-2xl md:text-3xl font-serif font-semibold text-black mb-10 w-full">¡Hola! Somos La Mueblería Online</h2>
                  <p className="text-lg md:text-xl text-gray-700 mb-8 font-normal leading-relaxed w-full max-w-none">
                    Somos una pyme familiar que nació en 2007 con la idea de ofrecer muebles modernos, funcionales y de calidad a todos los hogares de Argentina. Nos entusiasma ser parte de cada rincón especial de tu casa y, después de la pandemia, decidimos abrir un local físico en  para acercarnos aún más a ustedes y brindarles una atención personalizada. Nuestra misión es ayudarte a crear el hogar que siempre soñaste, con productos que combinen diseño, comodidad y precio justo, sin perder calidad. ¡Queremos que disfrutes de tu espacio con muebles que sean tan únicos como vos!
                  </p>
                  <h3 className="text-2xl font-bold font-serif text-black mb-4 mt-8 w-full">¿Qué ofrecemos?</h3>
                  <p className="text-base md:text-lg text-gray-700 mb-6 w-full max-w-none">
                    Fabricamos muebles para todos los ambientes de tu hogar con maderas de alta calidad como paraíso, kiri y petiribi, creando piezas perfectas para el comedor, living, dormitorio, escritorios y galerías semi cubiertas. Además, contamos con fábrica propia y enviamos productos a CABA y GBA con logística propia. Si estás fuera de la zona, tenemos opciones de embalaje para larga distancia y servicio de envío especializado. Contamos también con una línea de productos en stock permanente, disponibles para entrega inmediata. Además, te ofrecemos atención personalizada tanto en nuestro local como por WhatsApp, Instagram y tienda online, para resolver todas tus dudas y ayudarte en lo que necesites.
                  </p>
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
                <li>WhatsApp: +57 300 123 4567</li>
                <li>Email: contacto@regalaalgo.com</li>
                <li>Horario: 8AM - 8PM</li>
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

