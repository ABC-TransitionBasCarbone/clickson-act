import React from "react";
import { Star, ChevronRight } from "lucide-react";
import { PlusCircle } from "lucide-react";

import { Action } from "@/types/Action";
import { useTranslations } from "next-intl";
import { useUser } from "@/context/UserContext";

interface CustomAction extends Action {
  selected: boolean;
}

interface CurrentActionsProps {
  currentActions: CustomAction[];
  onEdit: (action: CustomAction) => void;
  onAddAction: () => void;
}

const CurrentActions: React.FC<CurrentActionsProps> = ({
  currentActions,
  onEdit,
  onAddAction,
}) => {
  const t = useTranslations();
  const { user } = useUser();

  // Check if user is a teacher (has role "teacher" or "admin")
  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  return (
    <div className="p-6 card">
      <div className="flex justify-between items-center pb-2">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <h2 className="font-bold text-xl">{t("currentActions.title")}</h2>
        </div>
        <span className="bg-primary-100 px-2 py-1 rounded-full text-primary-800 text-xs">
          {currentActions.length} {t("currentActions.actions")}
        </span>
      </div>
      <p className="text-gray-600">{t("currentActions.description")}</p>
      <div className="space-y-4 mt-4">
        {currentActions.map((action) => (
          <div
            key={action.id}
            className="flex justify-between pb-3 border-gray-100 last:border-0 border-b cursor-pointer"
            onClick={() => onEdit(action)}
          >
            <div>
              <p className="font-medium">{action.title}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${(() => {
                  switch (action.effort.toLowerCase()) {
                    case "low":
                    case "easy":
                      return "bg-green-100 text-green-800";
                    case "medium":
                      return "bg-yellow-100 text-yellow-800";
                    case "high":
                    case "hard":
                      return "bg-red-100 text-red-800";
                    default:
                      return "bg-gray-100 text-gray-800";
                  }
                })()}`}
              >
                {t(`effort.${action.effort.toLowerCase()}`)}{" "}
                {t("currentActions.effort")}
              </span>
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
      {isTeacher && (
        <div className="flex justify-center mt-4">
          <button
            className="flex items-center gap-2 bg-white w-fit btn btn-soft"
            onClick={onAddAction}
          >
            <PlusCircle className="w-4 h-4" />
            {t("StudentCalculator.addActionButton")}
          </button>
        </div>
      )}
    </div>
  );
};

export default CurrentActions;
