import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { ProcessedEmissionCategory } from "@/hooks/useEmissionCategories";

interface EmissionsInputProps {
  emissions: ProcessedEmissionCategory[];
  setEmissions: (index: number, value: string) => void;
  handleCalculateEmissions: () => void;
}

const EmissionsInput: React.FC<EmissionsInputProps> = ({
  emissions,
  setEmissions,
  handleCalculateEmissions,
}) => {
  const t = useTranslations("StudentCalculator");
  const [showWarning, setShowWarning] = useState(false);

  const onSelect = () => {
    const anyFilled = emissions.some((e) => e.value.trim() !== "");
    if (!anyFilled) {
      setShowWarning(true);
      return;
    }
    setShowWarning(false);
    handleCalculateEmissions();
  };

  return (
    <div className="card mb-8">
      <h3 className="text-2xl font-bold">{t("currentEmissionsTitle")}</h3>
      <p className="text-gray-400">{t("currentEmissionsDescription")}</p>

      <div className="mt-10 mb-5 grid gap-4 lg:grid-cols-2">
        {emissions.map((e, i) => (
          <div key={e.id} className="flex w-full flex-col">
            <label>{e.name}</label>
            <input
              type="number"
              placeholder={t("currentEmissionsPlaceholder")}
              value={e.value}
              onChange={(ev) => setEmissions(i, ev.target.value)}
              className="input w-full"
            />
          </div>
        ))}
        <button
          className="btn-outline btn btn-primary self-end"
          onClick={onSelect}
        >
          {t("selectButton")}
        </button>
      </div>

      {showWarning && (
        <div className="mt-2 text-red-500">
          {t("emptyFieldsWarning") ||
            "Please fill in at least one emission field."}
        </div>
      )}
    </div>
  );
};

export default EmissionsInput;
