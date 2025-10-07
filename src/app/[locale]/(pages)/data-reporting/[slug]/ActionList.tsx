import React from "react";
import ActionCard from "./ActionCard";
import { Action } from "@/types/Action";
import { useTranslations } from "next-intl";

const ActionList: React.FC<{
  actions: Action[];
  selectedActions: string[];
  onActionSelect: (id: string) => void;
  calculateDisplayReduction?: (action: Action) => number;
  projectId?: string;
  categories?: { value: string; label: string }[];
  effortCategories?: { value: string; label: string }[];
  subcategoryOptions?: { value: string; label: string; categoryId?: string }[];
}> = ({
  actions,
  selectedActions,
  onActionSelect,
  calculateDisplayReduction,
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

  // console.log("ActionList rendering with:", {
  //   actionsCount: actions.length,
  //   actionTitles: actions.map((a) => a.title),
  //   selectedActions,
  // });

  return (
    <div className="gap-4 grid">
      {actions.map((action) => {
        const calculatedReduction = calculateDisplayReduction
          ? calculateDisplayReduction(action)
          : undefined;

        // Debug log
        // console.log(`ActionList rendering action "${action.title}":`, {
        //   originalReduction: action.reduction,
        //   calculatedReduction,
        //   actionType: action.type,
        // });

        return (
          <ActionCard
            key={action.id}
            action={action}
            isSelected={selectedActions.includes(action.id)}
            onSelect={() => onActionSelect(action.id)}
            calculatedReduction={calculatedReduction}
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
