import React from "react";
import ActionList from "./ActionList";
import { Action } from "@/types/Action";

type ActionsSectionProps = {
  filteredActions: Action[];
  schoolGoal: number;
  selectedActions: string[];
  onActionSelect: (id: string) => void;
  onAddActionClick: () => void;
  showAddButton: boolean;
  t: (key: string) => string;
};

export const ActionsSection: React.FC<ActionsSectionProps> = ({
  filteredActions,
  schoolGoal,
  selectedActions,
  onActionSelect,
  onAddActionClick,
  showAddButton,
  t,
}) => {
  return (
    <>
      <div className="mt-6 mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t("availableActions")}</h2>
        {showAddButton && (
          <button className="btn btn-soft-primary" onClick={onAddActionClick}>
            {t("addActionButton")}
          </button>
        )}
      </div>

      <div className="mb-8 grid gap-4">
        <ActionList
          actions={filteredActions}
          schoolGoal={schoolGoal}
          selectedActions={selectedActions}
          onActionSelect={onActionSelect}
        />
      </div>
    </>
  );
};
