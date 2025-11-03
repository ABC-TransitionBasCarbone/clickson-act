import { useTranslations } from "next-intl";
import React from "react";

interface SubcategoryInputsProps {
  values: string[];
  onChange: (index: number, value: string) => void;
  subcategoryTitles: string[];
}

const SubcategoryInputs: React.FC<SubcategoryInputsProps> = ({
  values,
  onChange,
  subcategoryTitles,
}) => {
  const t = useTranslations("StudentCalculator");
  
  // Handle input change with comma/period conversion
  const handleInputChange = (index: number, value: string) => {
    // Replace comma with period for decimal separator
    const normalizedValue = value.replace(/,/g, '.');
    onChange(index, normalizedValue);
  };
  
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-1">
      {values.map((val, idx) => (
        <div key={idx} className="flex w-full flex-col">
          <label className="mb-1 font-medium">
            {subcategoryTitles[idx] &&
            subcategoryTitles[idx].startsWith("subcat")
              ? t(subcategoryTitles[idx])
              : subcategoryTitles[idx]}
          </label>
          <input
            type="text"
            inputMode="decimal"
            className="input w-full"
            value={val}
            onChange={(e) => handleInputChange(idx, e.target.value)}
            pattern="[0-9]*[.,]?[0-9]*"
            placeholder="0"
          />
        </div>
      ))}
    </div>
  );
};

export default SubcategoryInputs;
