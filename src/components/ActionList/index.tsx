"use client";

import React from "react";
import { Check, CheckCircle2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface CompletedAction {
  id: number;
  name: string;
  date: string;
  reduction: number;
}

interface CompletedActionsListProps {
  actions: CompletedAction[];
  viewAllLink: string;
}

const CompletedActionsList: React.FC<CompletedActionsListProps> = ({
  actions,
  viewAllLink,
}) => {
  const router = useRouter();
  const t = useTranslations("MonitoringPage");

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-bold">{t("completedActionsTitle")}</h2>
        </div>
        <span className="bg-primary-100 text-primary-800 rounded-full px-2 py-1 text-xs">
          {t("completedActionsCount", { count: actions.length })}
        </span>
      </div>
      <p className="text-gray-600">{t("completedActionsDescription")}</p>
      <div className="mt-4 space-y-4">
        {actions.map((action) => (
          <div
            key={action.id}
            className="flex justify-between border-b border-gray-100 pb-3 last:border-0"
          >
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium">{action.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(action.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className="font-medium text-green-600">
              -{action.reduction}%
            </span>
          </div>
        ))}
      </div>
      <button
        className="btn btn-soft mt-auto w-fit self-center bg-white"
        onClick={() => router.push(viewAllLink)}
      >
        {t("completedActionsViewAll")}
      </button>
    </div>
  );
};

export default CompletedActionsList;
