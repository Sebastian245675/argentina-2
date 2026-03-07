import React, { useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { TopPromoBar } from "@/components/layout/TopPromoBar";
import { AdvancedHeader } from "@/components/layout/AdvancedHeader";
import { CategoryBanner } from "@/components/layout/CategoryBanner";
import { CategoryBreadcrumbs } from "@/components/layout/CategoryBreadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { ProductsSection } from "@/components/products/ProductsSection";
import { useCategories } from "@/hooks/use-categories";

const CategoryViewPage = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const [promoVisible, setPromoVisible] = React.useState(true);
  const {
    categories,
    setCategories,
    mainCategories,
    subcategoriesByParent,
    thirdLevelBySubcategory,
    getCategoryByName,
    getBreadcrumbPath,
  } = useCategories();

  const categoryName = categorySlug ? decodeURIComponent(categorySlug) : "";
  const currentCategory = categoryName ? getCategoryByName(categoryName) : undefined;
  const breadcrumbPath = categoryName ? getBreadcrumbPath(categoryName) : [];

  const setSelectedCategory = (cat: string) => {
    if (cat === "Todos") {
      navigate("/");
      return;
    }
    navigate(`/categoria/${encodeURIComponent(cat)}`);
  };

  useEffect(() => {
    if (categoryName) window.scrollTo(0, 0);
  }, [categoryName]);

  const whatsappNumber = "+541126711308";
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;

  if (!categoryName) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-white text-neutral-900 overflow-x-hidden font-sans">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all hover:scale-110"
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
        selectedCategory={categoryName}
        setSelectedCategory={setSelectedCategory}
        promoVisible={promoVisible}
        mainCategories={mainCategories}
        subcategoriesByParent={subcategoriesByParent}
        thirdLevelBySubcategory={thirdLevelBySubcategory}
      />

      <CategoryBanner name={categoryName} image={currentCategory?.image} />
      <CategoryBreadcrumbs path={breadcrumbPath} />

      <main className="relative z-10 w-full pt-4">
        <ProductsSection
          selectedCategory={categoryName}
          setSelectedCategory={setSelectedCategory}
          setCategories={setCategories}
        />
      </main>

      <Footer />
    </div>
  );
};

export default CategoryViewPage;
