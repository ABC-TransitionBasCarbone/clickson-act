import React from "react";
import { Star, ChevronRight } from "lucide-react";
import { PlusCircle } from "lucide-react";

import { Action } from "@/types/Action";
import { useTranslations } from "next-intl";

interface CustomAction extends Action {
  selected: boolean;
}

interface CurrentActionsProps {
  currentActions: CustomAction[];
  onEdit: (action: CustomAction) => void;
  onViewAll: () => void;
  onAddAction: () => void;
}

const CurrentActions: React.FC<CurrentActionsProps> = ({
  currentActions,
  onEdit,
  onViewAll,
  onAddAction,
}) => {
  const t = useTranslations();

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-bold">{t("currentActions.title")}</h2>
        </div>
        <span className="bg-primary-100 text-primary-800 rounded-full px-2 py-1 text-xs">
          {currentActions.length} {t("currentActions.actions")}
        </span>
      </div>
      <p className="text-gray-600">{t("currentActions.description")}</p>
      <div className="mt-4 space-y-4">
        {currentActions.map((action) => (
          <div
            key={action.id}
            className="flex cursor-pointer justify-between border-b border-gray-100 pb-3 last:border-0"
            onClick={() => onEdit(action)}
          >
            <div>
              <p className="font-medium">{action.title}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${(() => {
                  switch (action.effort.toLowerCase()) {
                    case "low":
                      return "bg-green-100 text-green-800";
                    case "medium":
                      return "bg-yellow-100 text-yellow-800";
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
              <ChevronRight className="h-4 w-4 cursor-pointer text-gray-600" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2.5">
        <button
          className="btn btn-soft mt-auto w-fit self-center bg-white"
          onClick={onViewAll}
        >
          {t("currentActions.viewAll")}
        </button>
        <button
          className="btn btn-soft mt-auto w-fit self-center bg-white"
          onClick={onViewAll}
        >
          {t("currentActions.viewAllAvailable")}
        </button>
        <button
          className="btn btn-soft mt-auto flex w-fit items-center gap-2 self-center bg-white"
          onClick={onAddAction}
        >
          <PlusCircle className="h-4 w-4" />
          {t("StudentCalculator.addActionButton")}
        </button>
      </div>
    </div>
  );
};

export default CurrentActions;
