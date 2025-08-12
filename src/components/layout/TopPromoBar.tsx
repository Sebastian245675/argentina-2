import React, { useEffect, useRef, useState } from "react";

const promos = [
  "— ELECTRODOMÉSTICOS — REGALERÍA —",
  "🔥 10% de descuento en tu primera compra con el código: ULTRA10",
  "🚚 Envío en pedidos superiores a $70.000",
  "🎁 Regalo sorpresa en compras premium",
  "💳 Paga fácil con Nequi, Daviplata y tarjetas",
  "📍 Visitanos en Olavarría 610 (esquina San Luis)"
];

export const TopPromoBar: React.FC<{ setPromoVisible?: (v: boolean) => void }> = ({ setPromoVisible }) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const lastScroll = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % promos.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 40 && window.scrollY > lastScroll.current) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScroll.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (setPromoVisible) {
      setPromoVisible(visible);
    }
  }, [visible, setPromoVisible]);

  return (
    <div
      className={`fixed top-0 left-0 w-full z-[100] transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      } bg-gradient-to-r from-blue-600 via-blue-500 to-red-500 border-b border-blue-900 text-white text-base font-semibold tracking-wide h-14 flex items-center justify-center shadow-md`}
      style={{ fontFamily: "'Montserrat', 'Inter', Arial, sans-serif", letterSpacing: "0.05em" }}
    >
      <div className="w-full max-w-6xl mx-auto overflow-hidden">
        <div className="whitespace-nowrap animate-marquee text-lg font-bold">
          {promos[index] === "— ELECTRODOMÉSTICOS — REGALERÍA —" ? 
            <span className="text-white font-black uppercase">{promos[index]}</span> : 
            promos[index]}
        </div>
      </div>
    </div>
  );
};