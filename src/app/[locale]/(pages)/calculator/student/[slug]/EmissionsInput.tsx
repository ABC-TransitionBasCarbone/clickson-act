import React from "react";
import { useTranslations } from "next-intl";

interface EmissionsInputProps {
  emissions: { label: string; value: string }[];
  setEmissions: (index: number, value: string) => void;
}

const EmissionsInput: React.FC<EmissionsInputProps> = ({
  emissions,
  setEmissions,
}) => {
  const t = useTranslations("StudentCalculator");

  return (
    <div className="card mb-8">
      <h3 className="text-2xl font-bold">{t("currentEmissionsTitle")}</h3>
      <p className="text-gray-400">{t("currentEmissionsDescription")}</p>

      <div className="mt-10 mb-5 grid gap-4 lg:grid-cols-2">
        {emissions.map((emission, index) => (
          <div key={index} className="flex w-full flex-col">
            <label>{emission.label}</label>
            <input
              type="number"
              placeholder={t("currentEmissionsPlaceholder")}
              value={emission.value}
              onChange={(e) => setEmissions(index, e.target.value)}
              className="input w-full"
            />
          </div>
        ))}
        <button className="btn-outline btn btn-primary self-end">
          {t("calculateButton")}
        </button>
      </div>
    </div>
  );
};

export default EmissionsInput;
