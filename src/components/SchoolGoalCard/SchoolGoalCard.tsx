import React from "react";
import { Target } from "lucide-react";
import { useTranslations } from "next-intl";

const SchoolGoalCard: React.FC<{
  schoolGoal: number;
  currentReduction?: number;
  totalReduction: number;
}> = ({ schoolGoal, currentReduction, totalReduction }) => {
  const t = useTranslations("StudentCalculator");
  const progressPercentage = Math.ceil((totalReduction / schoolGoal) * 100);
  const currentProgressPercentage = currentReduction
    ? Math.ceil((currentReduction / schoolGoal) * 100)
    : null;

  return (
    <div className="card border-primary-200! bg-primary-50! mb-8">
      <div className="pb-2">
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-bold lg:text-2xl">
            <Target className="text-primary-600 h-5 w-5" />
            {t("schoolGoalTitle")}
          </h3>
          <span className="text-primary-700 text-md font-bold lg:text-xl">
            {schoolGoal}% {t("schoolGoalReduction")}
          </span>
        </div>
        <p>{t("schoolGoalDescription")}</p>
      </div>
      <div className="mb-1 flex h-4 w-full rounded-full bg-gray-200">
        <div
          className="bg-primary-600 z-1 h-4 rounded-full transition-all duration-500"
          style={{
            width: `${progressPercentage > 100 ? 100 : progressPercentage}%`,
          }}
        ></div>
        {currentProgressPercentage && (
          <div
            className="-ml-3 h-4 rounded-full bg-orange-400 transition-all duration-500"
            style={{
              width: `${currentProgressPercentage > 100 ? 100 : currentProgressPercentage}%`,
            }}
          ></div>
        )}
      </div>
      <div className="text-muted-foreground flex justify-between text-sm">
        <span>
          {t("schoolGoalProgress")}: {totalReduction}%
        </span>
        {currentProgressPercentage && (
          <span>
            {t("schoolCurrentProgress")}: {currentProgressPercentage}%
          </span>
        )}
        <span>
          {t("schoolGoalGoal")}: {schoolGoal}%
        </span>
      </div>
    </div>
  );
};

export default SchoolGoalCard;
