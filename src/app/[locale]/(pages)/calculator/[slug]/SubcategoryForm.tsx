import React from "react";
import SubcategoryInputs from "./SubcategoryInputs";
import { EmissionType } from "@/types/Emission";

type SubcategoryFormProps = {
  emissions: EmissionType[];
  activeEmissionCategories: string[];
  selectedCategory: string | null;
  subcategoryValues: string[];
  onSelectCategory: (cat: string) => void;
  onSubcategoryChange: (index: number, val: string) => void;
  onCalculate: () => void;
  t: (key: string) => string;
};

export const SubcategoryForm: React.FC<SubcategoryFormProps> = ({
  emissions,
  activeEmissionCategories,
  selectedCategory,
  subcategoryValues,
  onSelectCategory,
  onSubcategoryChange,
  onCalculate,
  t,
}) => {
  return (
    <div className="card mt-6">
      <h3 className="text-2xl font-bold">{t("selectEmissionCategory")}</h3>
      <p className="mb-10 text-gray-400">
        {t("selectEmissionCategoryDescription")}
      </p>
      <select
        className="w-full rounded border p-2"
        value={selectedCategory ?? ""}
        onChange={(e) => onSelectCategory(e.target.value)}
      >
        <option value="" disabled>
          {t("selectCategoryPlaceholder")}
        </option>
        {activeEmissionCategories.map((cat) => {
          const e = emissions.find((x) => x.category === cat)!;
          return (
            <option key={cat} value={cat}>
              {t(e.label)}
            </option>
          );
        })}
      </select>

      {selectedCategory && (
        <>
          <SubcategoryInputs
            values={subcategoryValues}
            onChange={onSubcategoryChange}
            subcategoryTitles={emissions
              .find((x) => x.category === selectedCategory)!
              .subcategories.map(
                (s: { subcategoryTitle: string }) => s.subcategoryTitle,
              )}
          />
          <button
            className="btn btn-primary mt-4"
            onClick={onCalculate}
            disabled={subcategoryValues.some((v) => v.trim() === "")}
          >
            {t("calculateButton")}
          </button>
        </>
      )}
    </div>
  );
};
