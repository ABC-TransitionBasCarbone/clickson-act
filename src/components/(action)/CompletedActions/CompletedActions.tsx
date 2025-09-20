import React from "react";
import { Check, ChevronRight } from "lucide-react";
import { Action } from "@/types/Action";

interface CustomAction extends Action {
  selected: boolean;
}

interface CompletedActionsProps {
  completedActions: CustomAction[];
  onEdit: (action: CustomAction) => void;
}

const CompletedActions: React.FC<CompletedActionsProps> = ({
  completedActions,
  onEdit,
}) => {
  return (
    <div className="p-6 card">
      <div className="flex justify-between items-center pb-2">
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <h2 className="font-bold text-xl">Completed Actions</h2>
        </div>
        <span className="bg-primary-100 px-2 py-1 rounded-full text-primary-800 text-xs">
          {completedActions.length} actions
        </span>
      </div>
      <p className="text-gray-600">
        Actions completed since the project started
      </p>
      <div className="space-y-4 mt-4">
        {completedActions.map((action) => (
          <div
            key={action.id}
            className="flex justify-between pb-3 border-gray-100 last:border-0 border-b cursor-pointer"
            onClick={() => onEdit(action)}
          >
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">{action.title}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(action.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-green-600">
                -{action.reduction}%
              </span>
              <ChevronRight className="w-4 h-4 text-gray-600 cursor-pointer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedActions;
