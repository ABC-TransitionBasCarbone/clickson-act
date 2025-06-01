import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";

type Action = {
  name: string;
  date: string;
  reduction: number;
};

const ActionsCard = ({ actions }: { actions: Action[] }) => {
  const t = useTranslations("ProjectDetails.actions");

  return (
    <div className="card flex-1">
      <span>
        <h3 className="text-2xl font-bold">{t("completedActions")}</h3>
        <div className="text-muted-foreground mb-2.5 text-xs">
          {t("recentActionsDescription")}
        </div>
      </span>
      <div>
        <div className="space-y-4">
          {actions.map((action, index) => (
            <div
              key={index}
              className="flex items-start justify-between border-b border-gray-100 pb-3 last:border-0"
            >
              <div>
                <p className="font-medium">{action.name}</p>
                <p className="text-muted-foreground text-sm">
                  <Clock className="mr-1 inline h-3 w-3" />
                  {new Date(action.date).toLocaleDateString()}
                </p>
              </div>
              <div className="font-medium text-green-600">
                -{action.reduction}%
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center">
        <button className="btn btn-soft mt-auto w-fit bg-white">
          {t("viewAllActions")}
        </button>
      </div>
    </div>
  );
};

export default ActionsCard;
