import React from "react";
import ActionCard from "./ActionCard";
import { Action } from "@/types/Action";

const ActionList: React.FC<{
  actions: Action[];
  selectedActions: string[];
  schoolGoal: number;
  onActionSelect: (id: string) => void;
}> = ({ actions, selectedActions, schoolGoal, onActionSelect }) => {
  return (
    <div className="grid gap-4">
      {actions.map((action) => (
        <ActionCard
          key={action.id}
          action={action}
          schoolGoal={schoolGoal}
          isSelected={selectedActions.includes(action.id)}
          onSelect={() => onActionSelect(action.id)}
        />
      ))}
    </div>
  );
};

export default ActionList;
