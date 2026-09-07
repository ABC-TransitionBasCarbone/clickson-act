import React from "react";
import ActionCard from "./ActionCard";
import { Action } from "@/types/Action";
import { useTranslations } from "next-intl";

const ActionList: React.FC<{
  actions: Action[];
  selectedActions: string[];
  onActionSelect: (id: string) => void;
  calculateSchoolPct?: (action: Action) => number | null;
  projectId?: string;
  categories?: { value: string; label: string }[];
  effortCategories?: { value: string; label: string }[];
  subcategoryOptions?: { value: string; label: string; categoryId?: string }[];
}> = ({
  actions,
  selectedActions,
  onActionSelect,
  calculateSchoolPct,
  projectId,
  categories = [],
  effortCategories = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ],
  subcategoryOptions = [],
}) => {
  const t = useTranslations("StudentCalculator");

  return (
    <div className="gap-4 grid">
      {actions.map((action) => {
        return (
          <ActionCard
            key={action.id}
            action={action}
            isSelected={selectedActions.includes(action.id)}
            onSelect={() => onActionSelect(action.id)}
            schoolPct={calculateSchoolPct ? calculateSchoolPct(action) : null}
            projectId={projectId}
            categories={categories}
            effortCategories={effortCategories}
            subcategoryOptions={subcategoryOptions}
          />
        );
      })}
      {actions.length === 0 && t("no_actions")}
    </div>
  );
};

export default ActionList;
