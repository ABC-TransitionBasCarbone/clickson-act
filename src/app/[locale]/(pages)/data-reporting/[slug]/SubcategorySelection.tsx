import React from "react";
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

type SubcategorySelectionProps = {
  category: CategoryForSelection;
  selectedSubcategories: string[];
  onSubcategoryToggle: (subcategoryId: string) => void;
  onProceed: () => void;
  t: (key: string) => string;
};

export const SubcategorySelection: React.FC<SubcategorySelectionProps> = ({
  category,
  selectedSubcategories,
  onSubcategoryToggle,
  onProceed,
  t,
}) => {
  return (
    <div className="mt-6 card">
      <h3 className="font-bold text-2xl">{t("selectSubcategoriesTitle")}</h3>
      <p className="mb-6 text-gray-400">
        {t("selectSubcategoriesDescription").replace(
          "{categoryName}",
          category.name,
        )}
      </p>

      <div className="gap-3 grid">
        {category.subcategories.map((subcategory) => (
          <label
            key={subcategory.id}
            className="flex items-center hover:bg-gray-50 p-4 border rounded-lg cursor-pointer"
          >
            <input
              type="checkbox"
              className="mr-3 checkbox checkbox-primary"
              checked={selectedSubcategories.includes(subcategory.id)}
              onChange={() => onSubcategoryToggle(subcategory.id)}
            />
            <div className="flex-1">
              <h4 className="font-semibold">{subcategory.name}</h4>
              {subcategory.description && (
                <p className="mt-1 text-gray-600 text-sm">
                  {subcategory.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>

      <button
        className="mt-6 btn btn-primary"
        onClick={onProceed}
        disabled={selectedSubcategories.length === 0}
      >
        {t("proceedToActionsButton")}
      </button>
    </div>
  );
};
