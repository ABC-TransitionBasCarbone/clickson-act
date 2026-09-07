"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  formatReductionPct,
  getActionReductionDisplay,
  type SubcategoryKgLookup,
} from "@/lib/subcategoryEmissionsKg";

type ActionReductionBadgeProps = {
  subcategoryPct: number;
  schoolPct?: number | null;
  isIndirect?: boolean;
  size?: "sm" | "md";
};

const ActionReductionBadge: React.FC<ActionReductionBadgeProps> = ({
  subcategoryPct,
  schoolPct = null,
  isIndirect = false,
  size = "sm",
}) => {
  const t = useTranslations("Action");
  const primaryClass =
    size === "md"
      ? "text-lg font-bold text-green-600"
      : "font-medium text-green-600";
  const schoolLabel =
    schoolPct != null ? `-${formatReductionPct(schoolPct)}%` : null;
  const subcategoryLabel = `-${formatReductionPct(subcategoryPct)}%`;

  if (isIndirect) {
    return (
      <div className="flex flex-col items-end text-right">
        <span className={primaryClass}>{schoolLabel ?? subcategoryLabel}</span>
        <span className="text-[10px] leading-tight text-gray-500">
          {t("pctOfSchool")}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end text-right">
      {schoolLabel != null && (
        <>
          <span className={primaryClass}>{schoolLabel}</span>
          <span className="text-[10px] leading-tight text-gray-500">
            {t("pctOfSchool")}
          </span>
        </>
      )}
      <span
        className={
          schoolLabel != null ? "mt-0.5 text-xs text-gray-500" : primaryClass
        }
      >
        {subcategoryLabel}
      </span>
      <span className="text-[10px] leading-tight text-gray-500">
        {t("pctOfSubcategory")}
      </span>
    </div>
  );
};

type ProjectActionForBadge = {
  reduction: number;
  calculatedReduction?: number;
  type?: string;
  category?: string;
  subcategory?: string;
  categoryContext?: {
    categoryId?: string;
    subcategoryData?: Array<{ id?: string; name?: string; value?: string }>;
  };
};

export function ProjectActionReductionBadge({
  action,
  subcategoryEmissionsKg,
  schoolTotalEmissions,
  size = "sm",
}: {
  action: ProjectActionForBadge;
  subcategoryEmissionsKg?: SubcategoryKgLookup;
  schoolTotalEmissions?: number;
  size?: "sm" | "md";
}) {
  const display = getActionReductionDisplay(
    {
      calculatedReduction: action.calculatedReduction ?? action.reduction,
      reduction: action.reduction,
      type: action.type,
      category: action.category,
      subcategory: action.subcategory,
      categoryContext: action.categoryContext,
    },
    subcategoryEmissionsKg,
    schoolTotalEmissions,
  );

  return (
    <ActionReductionBadge
      subcategoryPct={display.subcategoryPct}
      schoolPct={display.schoolPct}
      isIndirect={display.isIndirect}
      size={size}
    />
  );
}

export default ActionReductionBadge;
