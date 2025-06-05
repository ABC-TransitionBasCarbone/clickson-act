import React from "react";
import ActionCard from "./ActionCard";
import { Action } from "@/types/Action";
import { useTranslations } from "next-intl";

const ActionList: React.FC<{
  actions: Action[];
  selectedActions: string[];
  onActionSelect: (id: string) => void;
}> = ({ actions, selectedActions, onActionSelect }) => {
  const t = useTranslations("StudentCalculator");

  return (
    <div className="grid gap-4">
      {actions.map((action) => (
        <ActionCard
          key={action.id}
          action={action}
          isSelected={selectedActions.includes(action.id)}
          onSelect={() => onActionSelect(action.id)}
        />
      ))}
      {actions.length === 0 && t("no_actions")}
    </div>
  );
};

export default ActionList;
