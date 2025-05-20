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
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-1">
      {values.map((val, idx) => (
        <div key={idx} className="flex w-full flex-col">
          <label className="mb-1 font-medium">
            {subcategoryTitles[idx] || `Subcategory ${idx + 1}`}
          </label>
          <input
            type="text"
            className="input w-full"
            value={val}
            onChange={(e) => onChange(idx, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};

export default SubcategoryInputs;
