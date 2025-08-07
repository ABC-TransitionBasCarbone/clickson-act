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
  onAddToMonitoring?: (actionId: string) => void;
  showMonitoringButton?: boolean;
  addingToMonitoring?: Set<string>;
  calculateDisplayReduction?: (action: Action) => number;
};

export const ActionsSection: React.FC<ActionsSectionProps> = ({
  filteredActions,
  selectedActions,
  onActionSelect,
  onAddActionClick,
  showAddButton,
  t,
  onAddToMonitoring,
  showMonitoringButton = false,
  addingToMonitoring = new Set(),
  calculateDisplayReduction,
}) => {
  // console.log("ActionsSection rendering with:", {
  //   filteredActionsCount: filteredActions.length,
  //   filteredActionTitles: filteredActions.map((a) => a.title),
  //   showAddButton,
  // });

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
        {filteredActions.length === 0 ? (
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-6 w-6 shrink-0 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span>
              No action templates available. Please contact your administrator
              to add action templates to the database.
            </span>
          </div>
        ) : (
          <ActionList
            actions={filteredActions}
            selectedActions={selectedActions}
            onActionSelect={onActionSelect}
            onAddToMonitoring={onAddToMonitoring}
            showMonitoringButton={showMonitoringButton}
            addingToMonitoring={addingToMonitoring}
            calculateDisplayReduction={calculateDisplayReduction}
          />
        )}
      </div>
    </>
  );
};
