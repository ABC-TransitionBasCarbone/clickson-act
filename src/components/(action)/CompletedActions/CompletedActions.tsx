import React from "react";
import { Check, ChevronRight } from "lucide-react";
import { Action } from "@/types/Action";
import { useTranslations } from "next-intl";
import { ProjectActionReductionBadge } from "@/components/(action)/ActionReductionBadge";
import { type SubcategoryKgLookup } from "@/lib/subcategoryEmissionsKg";

interface CustomAction extends Action {
  selected: boolean;
  calculatedReduction?: number;
  status?: "Completed" | "Selected" | "Available" | "In Progress";
  categoryContext?: {
    categoryId?: string;
    subcategoryData?: Array<{ id?: string; name?: string; value?: string }>;
  };
}

interface CompletedActionsProps {
  completedActions: CustomAction[];
  /** Opens the action in view-only mode (completed actions are not editable). */
  onView: (action: CustomAction) => void;
  subcategoryEmissionsKg?: SubcategoryKgLookup;
  schoolTotalEmissions?: number;
}

const CompletedActions: React.FC<CompletedActionsProps> = ({
  completedActions,
  onView,
  subcategoryEmissionsKg,
  schoolTotalEmissions,
}) => {
  const t = useTranslations("currentActions");

  return (
    <div className="p-6 card">
      <div className="flex justify-between items-center pb-2">
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-green-600" />
          <h2 className="font-bold text-xl">Completed Actions</h2>
        </div>
        <span className="bg-primary-100 px-2 py-1 rounded-full text-primary-800 text-xs">
          {completedActions.length} {t("actions")}
        </span>
      </div>
      <p className="text-gray-600">
        Actions completed since the project started
      </p>
      <div className="space-y-4 mt-4">
        {completedActions.map((action) => (
          <div
            key={action.id}
            className="flex justify-between pb-3 border-gray-100 last:border-0 border-b cursor-pointer hover:bg-gray-50/50 rounded-md px-1 -mx-1 transition-colors"
            onClick={() => onView(action)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onView(action);
              }
            }}
          >
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="font-medium">{action.title}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(action.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ProjectActionReductionBadge
                action={action}
                subcategoryEmissionsKg={subcategoryEmissionsKg}
                schoolTotalEmissions={schoolTotalEmissions}
              />
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedActions;
