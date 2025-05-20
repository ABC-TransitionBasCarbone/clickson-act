import React from "react";
import { Star, ChevronRight } from "lucide-react";
import { Action } from "@/types/Action";

interface CustomAction extends Action {
  selected: boolean;
}

interface AvailableActionsProps {
  availableActions: CustomAction[];
  onEdit: (action: CustomAction) => void;
  onViewAll: () => void;
}

const AvailableActions: React.FC<AvailableActionsProps> = ({
  availableActions,
  onEdit,
  onViewAll,
}) => {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-bold">Available Actions</h2>
        </div>
        <span className="bg-primary-100 text-primary-800 rounded-full px-2 py-1 text-xs">
          {availableActions.length} options
        </span>
      </div>
      <p className="text-gray-600">Recommended actions to reduce emissions</p>
      <div className="mt-4 space-y-4">
        {availableActions.map((action) => (
          <div
            key={action.id}
            className="flex cursor-pointer justify-between border-b border-gray-100 pb-3 last:border-0"
            onClick={() => onEdit(action)}
          >
            <div>
              <p className="font-medium">{action.title}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  action.effort === "Low"
                    ? "bg-green-100 text-green-800"
                    : action.effort === "Medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {action.effort} effort
              </span>
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
        View All Available Actions
      </button>
    </div>
  );
};

export default AvailableActions;
