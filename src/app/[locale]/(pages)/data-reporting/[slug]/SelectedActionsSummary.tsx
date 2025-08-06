import React from "react";

type SelectedActionsSummaryProps = {
  selectedActionsCount: number;
  totalReductionPercent: number;
  t: (key: string) => string;
};

export const SelectedActionsSummary: React.FC<SelectedActionsSummaryProps> = ({
  selectedActionsCount,
  totalReductionPercent,
  t,
}) => {
  return (
    <div className="mb-8">
      <div className="bg-primary/10! border-primary-200! card">
        <div className="p-2.5 pb-5 lg:p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {t("totalReductionTitle")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("totalReductionDescription")} {selectedActionsCount}{" "}
                {t("totalReductionDescriptionActions")}
              </p>
            </div>
            <div className="text-3xl font-bold text-green-600">
              -{totalReductionPercent}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
