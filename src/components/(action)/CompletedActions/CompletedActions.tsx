import React from "react";
import { Check, ChevronRight } from "lucide-react";
import { Action } from "@/types/Action";

interface CustomAction extends Action {
  selected: boolean;
}

interface CompletedActionsProps {
  completedActions: CustomAction[];
  onEdit: (action: CustomAction) => void;
  onViewAll: () => void;
}

const CompletedActions: React.FC<CompletedActionsProps> = ({
  completedActions,
  onEdit,
  onViewAll,
}) => {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-bold">Completed Actions</h2>
        </div>
        <span className="bg-primary-100 text-primary-800 rounded-full px-2 py-1 text-xs">
          {completedActions.length} actions
        </span>
      </div>
      <p className="text-gray-600">
        Actions completed since the project started
      </p>
      <div className="mt-4 space-y-4">
        {completedActions.map((action) => (
          <div
            key={action.id}
            className="flex cursor-pointer justify-between border-b border-gray-100 pb-3 last:border-0"
            onClick={() => onEdit(action)}
          >
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">{action.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(action.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-green-600">
                -{action.reduction}%
              </span>
              <ChevronRight className="h-4 w-4 cursor-pointer text-gray-600" />
            </div>
          </div>
        ))}
      </div>
      <button
        className="btn btn-soft mt-auto w-fit self-center bg-white"
        onClick={onViewAll}
      >
        View All Actions
      </button>
    </div>
  );
};

export default CompletedActions;
