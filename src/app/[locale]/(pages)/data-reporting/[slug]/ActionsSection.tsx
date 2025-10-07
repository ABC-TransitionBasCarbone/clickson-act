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
  calculateDisplayReduction?: (action: Action) => number;
  projectId?: string;
  categories?: { value: string; label: string }[];
  effortCategories?: { value: string; label: string }[];
  subcategoryOptions?: { value: string; label: string; categoryId?: string }[];
};

export const ActionsSection: React.FC<ActionsSectionProps> = ({
  filteredActions,
  selectedActions,
  onActionSelect,
  onAddActionClick,
  showAddButton,
  t,
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
  // console.log("ActionsSection rendering with:", {
  //   filteredActionsCount: filteredActions.length,
  //   filteredActionTitles: filteredActions.map((a) => a.title),
  //   showAddButton,
  // });

  return (
    <>
      <div className="flex justify-between items-center mt-6 mb-4">
        <h2 className="font-semibold text-xl">{t("availableActions")}</h2>
        {showAddButton && (
          <button className="btn btn-soft-primary" onClick={onAddActionClick}>
            {t("addActionButton")}
          </button>
        )}
      </div>

      <div className="gap-4 grid mb-8">
        {filteredActions.length === 0 ? (
          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current w-6 h-6 shrink-0"
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
            calculateDisplayReduction={calculateDisplayReduction}
            projectId={projectId}
            categories={categories}
            effortCategories={effortCategories}
            subcategoryOptions={subcategoryOptions}
          />
        )}
      </div>
    </>
  );
};
