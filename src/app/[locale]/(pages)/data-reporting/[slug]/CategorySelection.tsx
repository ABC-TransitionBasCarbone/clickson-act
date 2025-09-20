import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { ProcessedEmissionCategory } from "@/hooks/useEmissionCategories";
import { ProcessedSchoolEmissionCategory } from "@/hooks/useSchoolEmissionData";

// Common interface for what we actually need from categories
interface CategoryForSelection {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategories: {
    id: string;
    name: string;
    description?: string;
  }[];
}

interface CategorySelectionProps {
  categories: CategoryForSelection[];
  onCategorySelect: (categoryId: string) => void;
  selectedCategory: string | null;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({
  categories,
  onCategorySelect,
  selectedCategory,
}) => {
  const t = useTranslations("StudentCalculator");

  return (
    <div className="mb-8 card">
      <h3 className="font-bold text-2xl">{t("selectCategoryTitle")}</h3>
      <p className="text-gray-400">{t("selectCategoryDescription")}</p>

      <div className="gap-4 grid lg:grid-cols-2 mt-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
              selectedCategory === category.category
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => onCategorySelect(category.category)}
          >
            <h4 className="font-semibold text-lg">{category.name}</h4>
            {category.description && (
              <p className="mt-2 text-gray-600 text-sm">
                {category.description}
              </p>
            )}
            <div className="flex items-center mt-3 text-gray-500 text-sm">
              <span>
                {category.subcategories.length} {t("subcategoriesAvailable")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="py-8 text-gray-500 text-center">
          <p>{t("noCategoriesAvailable")}</p>
        </div>
      )}
    </div>
  );
};

export default CategorySelection;
