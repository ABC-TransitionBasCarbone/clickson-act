import React from "react";
import ActionCard from "./ActionCard";
import { Action } from "@/types/Action";
import { useTranslations } from "next-intl";

const ActionList: React.FC<{
  actions: Action[];
  selectedActions: string[];
  onActionSelect: (id: string) => void;
  onAddToMonitoring?: (actionId: string) => void;
  showMonitoringButton?: boolean;
  addingToMonitoring?: Set<string>;
  calculateDisplayReduction?: (action: Action) => number;
}> = ({
  actions,
  selectedActions,
  onActionSelect,
  onAddToMonitoring,
  showMonitoringButton = false,
  addingToMonitoring = new Set(),
  calculateDisplayReduction,
}) => {
  const t = useTranslations("StudentCalculator");

  // console.log("ActionList rendering with:", {
  //   actionsCount: actions.length,
  //   actionTitles: actions.map((a) => a.title),
  //   selectedActions,
  // });

  return (
    <div className="grid gap-4">
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
            onAddToMonitoring={onAddToMonitoring}
            showMonitoringButton={showMonitoringButton}
            isAddingToMonitoring={addingToMonitoring.has(action.id)}
            calculatedReduction={calculatedReduction}
          />
        );
      })}
      {actions.length === 0 && t("no_actions")}
    </div>
  );
};

export default ActionList;
