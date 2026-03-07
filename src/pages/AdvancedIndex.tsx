import React, { useState, useEffect } from "react";
import { TopPromoBar } from "@/components/layout/TopPromoBar";
import { AdvancedHeader } from "@/components/layout/AdvancedHeader";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { Footer } from "@/components/layout/Footer";
import { ProductsSection } from "@/components/products/ProductsSection";
import { StoreStructuredData } from "@/components/seo/StructuredData";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useCategories } from "@/hooks/use-categories";

const AdvancedIndex = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [promoVisible, setPromoVisible] = useState(true);
  const {
    categories,
    setCategories,
    mainCategories,
    subcategoriesByParent,
    thirdLevelBySubcategory,
  } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");

  const params = new URLSearchParams(location.search);
  const categoryParam = params.get("category");
  const searchParam = params.get("search");

  useEffect(() => {
    if (searchParam) setSearchTerm(searchParam);
    else setSearchTerm("");
  }, [searchParam]);

  const setSelectedCategory = (cat: string) => {
    if (cat === "Todos") {
      navigate("/");
      return;
    }
    navigate(`/categoria/${encodeURIComponent(cat)}`);
  };

  const whatsappNumber = "+541126711308";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;

  if (categoryParam) {
    return <Navigate to={`/categoria/${encodeURIComponent(categoryParam)}`} replace />;
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 overflow-x-hidden font-sans">
      <StoreStructuredData
        name="VISFUM"
        description="Tienda online de electrodomésticos, regalería y perfumes importados con envíos a todo el país."
      />

      <h1 className="sr-only">VISFUM - Perfumes Importados y Decants Originales</h1>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all hover:scale-110"
        aria-label="Contactar por WhatsApp"
        title="Contactar por WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-8 h-8"
          aria-hidden="true"
        >
          <path d="M21.67 20.29l-1.2-4.28A8.94 8.94 0 0 0 12 3a9 9 0 0 0-9 9c0 2.39.93 4.58 2.62 6.29l-1.2 4.28a1 1 0 0 0 1.28 1.28l4.28-1.2A8.94 8.94 0 0 0 21 21a1 1 0 0 0 .67-1.71z" />
          <path d="M16.24 11.06a4 4 0 0 1-4.24 4.24" />
        </svg>
      </a>

      <div className="w-full">
        <TopPromoBar setPromoVisible={setPromoVisible} />
      </div>
      <AdvancedHeader
        categories={categories}
        selectedCategory="Todos"
        setSelectedCategory={setSelectedCategory}
        promoVisible={promoVisible}
        mainCategories={mainCategories}
        subcategoriesByParent={subcategoriesByParent}
        thirdLevelBySubcategory={thirdLevelBySubcategory}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />

      <HeroBanner />

      <main className="relative z-10 w-full pt-4">
        <ProductsSection
          selectedCategory="Todos"
          setSelectedCategory={setSelectedCategory}
          setCategories={setCategories}
          initialSearchTerm={searchTerm}
        />
      </main>

      <Footer />
    </div>
  );
};

export default AdvancedIndex;
