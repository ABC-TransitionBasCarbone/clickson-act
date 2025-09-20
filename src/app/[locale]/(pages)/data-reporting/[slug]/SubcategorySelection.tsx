import React from "react";

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

type SubcategorySelectionProps = {
  category: CategoryForSelection;
  selectedSubcategories: string[];
  onSubcategoryToggle: (subcategoryId: string) => void;
  onProceed: () => void;
  onBack: () => void;
  t: (key: string) => string;
};

export const SubcategorySelection: React.FC<SubcategorySelectionProps> = ({
  category,
  selectedSubcategories,
  onSubcategoryToggle,
  onProceed,
  onBack,
  t,
}) => {
  return (
    <div className="mt-6 card">
      <h3 className="font-bold text-2xl">{t("selectSubcategoriesTitle")}</h3>
      <p className="mb-4 text-gray-400">
        {t("selectSubcategoriesDescription").replace(
          "{categoryName}",
          category.name,
        )}
      </p>

      {/* Category Summary */}
      {category.amount !== undefined && category.amount > 0 && (
        <div className="bg-primary-50 mb-6 p-4 border border-primary-200 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-primary-600">
              {category.name} Total Emissions:
            </span>
            <div className="text-right">
              <div className="font-bold text-primary-900">
                {category.amount.toLocaleString()} kg CO₂e
              </div>
              {category.percentage !== undefined && (
                <div className="text-primary-600 text-sm">
                  {category.percentage.toFixed(1)}% of school total
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="gap-3 grid">
        {category.subcategories.map((subcategory) => (
          <label
            key={subcategory.id}
            className={`flex cursor-pointer items-center rounded-lg border p-4 hover:bg-gray-50 ${selectedSubcategories.includes(subcategory.id) ? "bg-primary-100 border-primary-500" : ""}`}
          >
            <input
              type="checkbox"
              className="mr-3 checkbox checkbox-primary"
              checked={selectedSubcategories.includes(subcategory.id)}
              onChange={() => onSubcategoryToggle(subcategory.id)}
            />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="font-semibold">{subcategory.name}</h4>
                  {subcategory.description && (
                    <p className="mt-1 text-gray-600 text-sm">
                      {subcategory.description}
                    </p>
                  )}
                </div>

                {/* Display emission values if available */}
                {subcategory.amount !== undefined && subcategory.amount > 0 && (
                  <div className="ml-4 text-right">
                    <div className="font-medium text-sm">
                      {subcategory.amount.toLocaleString()} kg CO₂e
                    </div>
                    {subcategory.percentage !== undefined && (
                      <div className="text-primary text-xs">
                        {subcategory.percentage.toFixed(1)}% of category
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="flex gap-3 mt-6">
        <button className="btn-outline btn" onClick={onBack}>
          ← Back to Categories
        </button>
        <button
          className="flex-1 btn btn-primary"
          onClick={onProceed}
          disabled={selectedSubcategories.length === 0}
        >
          {t("proceedToActionsButton")}
        </button>
      </div>
    </div>
  );
};
