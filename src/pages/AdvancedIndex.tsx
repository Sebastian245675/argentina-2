import React, { useState, useEffect } from "react";
import { TopPromoBar } from "@/components/layout/TopPromoBar";
import { AdvancedHeader } from "@/components/layout/AdvancedHeader";
import { HeroBanner } from "@/components/layout/HeroBanner";
import { StoreStructuredData } from "@/components/seo/StructuredData";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useCategories } from "@/hooks/use-categories";

const Footer = React.lazy(() => import("@/components/layout/Footer").then(m => ({ default: m.Footer })));
const FloatingActionButtons = React.lazy(() => import("@/components/layout/FloatingActionButtons").then(m => ({ default: m.FloatingActionButtons })));
const ProductsSection = React.lazy(() => import("@/components/products/ProductsSection").then(m => ({ default: m.ProductsSection })));

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
        description="Tienda online de perfumería, regalería y perfumes importados con envíos a todo el país."
      />

      <h1 className="sr-only">VISFUM - Perfumes Importados y Decants Originales</h1>

      <React.Suspense fallback={null}>
        <FloatingActionButtons />
      </React.Suspense>

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
        <React.Suspense fallback={<div className="h-96 flex items-center justify-center">Cargando productos...</div>}>
          <ProductsSection
            selectedCategory="Todos"
            setSelectedCategory={setSelectedCategory}
            setCategories={setCategories}
            initialSearchTerm={searchTerm}
          />
        </React.Suspense>
      </main>

      <React.Suspense fallback={null}>
        <Footer />
      </React.Suspense>
    </div>
  );
};

export default AdvancedIndex;
