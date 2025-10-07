import React from "react";
import { useTranslations } from "next-intl";

// Common interface for what we actually need from categories
interface CategoryForSelection {
  id: string;
  name: string;
  description?: string;
  category: string;
  amount?: number; // Emission amount in kgCO2e
  percentage?: number; // Percentage of total emissions
  subcategories: {
    id: string;
    name: string;
    description?: string;
    amount?: number; // Emission amount in kgCO2e
    percentage?: number; // Percentage of category emissions
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
            className={`flex cursor-pointer flex-col rounded-lg border-2 p-4 transition-all hover:shadow-md ${
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

            {/* Display emission values if available */}
            {category.amount !== undefined && category.amount > 0 && (
              <div className="space-y-1 bg-primary-50 mt-3 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-black text-sm">{t("emissions")}</span>
                  <span className="font-medium text-sm">
                    {category.amount.toLocaleString()} kg CO₂e
                  </span>
                </div>
                {category.percentage !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-black text-sm">
                      {t("percentageOfTotal")}
                    </span>
                    <span className="font-medium text-primary text-sm">
                      {category.percentage.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center mt-auto pt-3 text-black text-xs">
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
