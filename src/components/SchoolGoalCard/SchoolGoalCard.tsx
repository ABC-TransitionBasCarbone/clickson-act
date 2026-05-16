import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts";
import { Target } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  type SubcategoryKgLookup,
  lookupSubcategoryKg,
} from "@/lib/subcategoryEmissionsKg";

interface ProjectAction {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  reduction: number;
  /** % reduction relative to the subcategory kg base (from inventory or entered values). */
  calculatedReduction: number;
  status: "Available" | "Selected" | "In Progress" | "Completed";
  studentName: string;
  dateAdded: string;
  dateCompleted?: string;
  timeline?: number; // Number of years the action will take place (default: 1)
  categoryContext?: {
    categoryId?: string;
    categoryName?: string;
    subcategoryData?: Array<{ id?: string; name?: string; value?: string }>;
  };
}

type SchoolGoalCardProps = {
  schoolGoal: number;
  subGoal: number;
  subGoalYear: string;
  finalGoalYear: string;
  baseReductionPerYear: number;
  selectedActionReductionPerYear?: number;
  startYear: string;
  currentEmissions?: number;
  /** Emissions base for the chart (project or school). Used for actual-emissions curve when no school total is provided. */
  totalEmissions?: number;
  /** When provided, chart scale and trajectories use this as the total (e.g. full school emissions). Use this if you have school-level total. */
  schoolTotalEmissions?: number;
  totalReduction?: number;
  availableActions?: ProjectAction[];
  completedActions?: ProjectAction[];
  /** kg CO₂e per subcategory (school inventory + project emissions); used to apply % on subcategory, not on school total. */
  subcategoryEmissionsKg?: SubcategoryKgLookup;
};

/** Annual impact: kg removed from total footprint, or legacy %-of-school-total (only when action has no subcategory scope). */
function actionYearlyContribution(
  action: ProjectAction,
  lookup: SubcategoryKgLookup | undefined,
): { kgReduction: number } | { pctOfTotal: number } {
  const pct = action.calculatedReduction;
  const subData = action.categoryContext?.subcategoryData;
  const categoryId =
    action.categoryContext?.categoryId || action.category || undefined;

  const valuesFromRows: number[] = [];
  for (const s of subData || []) {
    if (s.value == null || s.value === "") continue;
    const n = parseFloat(String(s.value));
    if (!Number.isNaN(n)) valuesFromRows.push(n);
  }
  if (valuesFromRows.length > 0) {
    const base = valuesFromRows.reduce((a, b) => a + b, 0);
    return { kgReduction: (pct / 100) * base };
  }

  if (lookup && Object.keys(lookup).length > 0) {
    let base = 0;
    let matched = false;
    if (subData?.length) {
      for (const s of subData) {
        if (!s?.id) continue;
        const v = lookupSubcategoryKg(lookup, String(s.id), categoryId);
        if (v != null && v > 0) {
          base += v;
          matched = true;
        }
      }
    }
    if (!matched && action.subcategory) {
      const v = lookupSubcategoryKg(lookup, action.subcategory, categoryId);
      if (v != null && v > 0) {
        base = v;
        matched = true;
      }
    }
    if (matched) {
      return { kgReduction: (pct / 100) * base };
    }
  }

  const hasSubcategoryScope =
    !!action.categoryContext ||
    !!(action.subcategory && String(action.subcategory).length > 0);
  if (hasSubcategoryScope) {
    return { kgReduction: 0 };
  }

  return { pctOfTotal: pct };
}

const generateChartDataFromActions = (
  startYear: number,
  endYear: number,
  completedActions: ProjectAction[] = [],
   
  _availableActions: ProjectAction[] = [],
  subGoal: number = 0,
  subGoalYear: number = 0,
  finalGoal: number = 0,
  finalGoalYear: number = 0,
  totalEmissions: number = 0,
  subcategoryKgLookup: SubcategoryKgLookup | undefined = undefined,
) => {
  const data = [];

  // Paris Agreement target year (carbon neutrality by 2050)
  const parisAgreementYear = 2050;

  // Cumulative reduction in kg (when action has subcategory data: reduction % applies to subcategory)
  const cumulativeKgReductions = new Map<number, number>();
  // Cumulative reduction as % of total (fallback when no subcategory data)
  const cumulativeReductions = new Map<number, number>();

  for (let year = startYear; year <= endYear; year++) {
    cumulativeKgReductions.set(year, 0);
    cumulativeReductions.set(year, 0);
  }

  // Process ONLY completed actions to show their cumulative impact.
  // Reductions persist for all later years (do not drop when timeline ends), so the
  // actual-emissions line does not rise again after savings are realized.
  completedActions.forEach((action) => {
    const completionDate = action.dateCompleted || action.dateAdded;
    const actionStartYear = new Date(completionDate).getFullYear();

    if (actionStartYear < startYear) return;

    const contrib = actionYearlyContribution(action, subcategoryKgLookup);

    for (let year = startYear; year <= endYear; year++) {
      if (year >= actionStartYear) {
        if ("kgReduction" in contrib) {
          const current = cumulativeKgReductions.get(year) || 0;
          cumulativeKgReductions.set(year, current + contrib.kgReduction);
        } else {
          const current = cumulativeReductions.get(year) || 0;
          cumulativeReductions.set(year, current + contrib.pctOfTotal);
        }
      }
    }
  });

  // Generate yearly progress data for chart
  for (let year = startYear; year <= endYear; year++) {
    const cumulativeKg = cumulativeKgReductions.get(year) || 0;
    const cumulativeReductionPercentage = cumulativeReductions.get(year) || 0;

    // Actual emissions (purple line): total minus kg reductions, minus %-of-total reductions
    const actualEmissions = Math.max(
      0,
      totalEmissions -
        cumulativeKg -
        totalEmissions * (cumulativeReductionPercentage / 100),
    );

    // Calculate Paris Agreement trajectory (green line)
    // Goes from totalEmissions at startYear to 0 (carbon neutrality) by 2050
    let parisAgreementEmissions = totalEmissions;
    const targetYear = Math.min(parisAgreementYear, endYear);
    if (year >= startYear && year <= targetYear) {
      // Linear progression from startYear to targetYear (0 emissions)
      const progressFraction = (year - startYear) / (targetYear - startYear);
      parisAgreementEmissions = totalEmissions * (1 - progressFraction);
    } else if (year > targetYear) {
      // After target year, maintain at 0
      parisAgreementEmissions = 0;
    }

    // Calculate School's trajectory (orange line) - using goal & subgoal
    // Starts at totalEmissions and follows the school's goal progression
    let schoolTrajectoryEmissions = totalEmissions;

    if (year >= startYear) {
      let schoolReductionPercentage = 0;

      if (subGoalYear > startYear && year <= subGoalYear) {
        // First phase: linear progression from startYear to sub-goal
        const progressFraction = (year - startYear) / (subGoalYear - startYear);
        schoolReductionPercentage = subGoal * progressFraction;
      } else if (year > subGoalYear && finalGoalYear > subGoalYear) {
        // Second phase: linear progression from sub-goal to final goal
        const progressFraction =
          (year - subGoalYear) / (finalGoalYear - subGoalYear);
        schoolReductionPercentage =
          subGoal + (finalGoal - subGoal) * progressFraction;
      } else if (subGoalYear <= startYear && finalGoalYear > startYear) {
        // Direct linear progression from startYear to final goal (skip sub-goal if it's in the past)
        const progressFraction =
          (year - startYear) / (finalGoalYear - startYear);
        schoolReductionPercentage = finalGoal * progressFraction;
      }

      schoolTrajectoryEmissions =
        totalEmissions * (1 - schoolReductionPercentage / 100);
    }

    const effectiveReductionPct =
      totalEmissions > 0
        ? ((totalEmissions - actualEmissions) / totalEmissions) * 100
        : 0;

    data.push({
      date: `${year}`,
      actualEmissions,
      schoolTrajectoryEmissions: Math.max(schoolTrajectoryEmissions, 0),
      parisAgreementEmissions: Math.max(parisAgreementEmissions, 0),
      currentReduction: Math.min(effectiveReductionPct, 100),
    });
  }

  return data;
};

// Legacy function for backward compatibility
const generateChartData = (
  start: number,
  end: number,
  baseRate: number,
  selectedRate?: number,
  totalEmissions: number = 1000, // Default total emissions if not provided
) => {
  const data = [];
  const parisAgreementYear = 2050;
  let current = 0;
  let currentAlt = 0;

  for (let year = start; year <= end; year++) {
    current += baseRate;
    currentAlt += selectedRate ? selectedRate + baseRate : 0;

    const currentReductionPercentage = selectedRate
      ? Math.min(currentAlt, 100)
      : Math.min(current, 100);

    // Actual emissions (purple line) - starts at totalEmissions
    const actualEmissions =
      totalEmissions * (1 - currentReductionPercentage / 100);

    // Paris Agreement trajectory (green line) - goes from totalEmissions to 0 by 2050
    let parisAgreementEmissions = totalEmissions;
    const targetYear = Math.min(parisAgreementYear, end);
    if (year >= start && year <= targetYear) {
      const progressFraction = (year - start) / (targetYear - start);
      parisAgreementEmissions = totalEmissions * (1 - progressFraction);
    } else if (year > targetYear) {
      parisAgreementEmissions = 0;
    }

    // School trajectory (orange line) - for legacy, use the same as actual emissions
    // This is a fallback, should use generateChartDataFromActions when possible
    const schoolTrajectoryEmissions = actualEmissions;

    data.push({
      date: `${year}`,
      baseReduction: Math.min(current, 100),
      selectedReduction: selectedRate ? Math.min(currentAlt, 100) : undefined,
      currentReduction: currentReductionPercentage,
      actualEmissions: Math.max(actualEmissions, 0),
      schoolTrajectoryEmissions: Math.max(schoolTrajectoryEmissions, 0),
      parisAgreementEmissions: Math.max(parisAgreementEmissions, 0),
    });
  }
  return data;
};

const SchoolGoalCard: React.FC<SchoolGoalCardProps> = ({
  schoolGoal,
  subGoal,
  subGoalYear,
  finalGoalYear,
  baseReductionPerYear,
  selectedActionReductionPerYear,
  startYear,
  totalEmissions = 1000,
  schoolTotalEmissions,
  availableActions: _availableActions,
  completedActions,
  subcategoryEmissionsKg,
}) => {
  const t = useTranslations("StudentCalculator");

  const startYearNum = Number(startYear.slice(0, 4));
  const finalYearNum = Number(finalGoalYear.slice(0, 4));
  const subGoalYearNum = Number(subGoalYear.slice(0, 4));

  // Use school total for chart scale when provided (e.g. 5000), else project/current emissions (e.g. 1000)
  const chartBase = schoolTotalEmissions ?? totalEmissions;

  const chartData = generateChartDataFromActions(
    startYearNum,
    finalYearNum,
    completedActions || [],
    _availableActions || [],
    subGoal,
    subGoalYearNum,
    schoolGoal,
    finalYearNum,
    chartBase,
    subcategoryEmissionsKg,
  );

  const finalChartData =
    chartData.length > 0
      ? chartData
      : generateChartData(
          startYearNum,
          finalYearNum,
          baseReductionPerYear,
          selectedActionReductionPerYear,
          chartBase,
        );

  return (
    <div className="bg-primary-50! border-primary-200! card mb-8">
      <div className="pb-4">
        <div className="mb-2.5 flex justify-between max-lg:flex-col lg:items-center">
          <h3 className="flex items-center gap-2 text-xl font-bold lg:text-2xl">
            <Target className="text-primary-600 h-5 w-5" />
            {t("schoolGoalTitle")}
          </h3>
          <span className="text-md text-primary font-bold lg:text-xl">
            {subGoal}% {t("schoolGoalReduction")} ({subGoalYear})
          </span>
        </div>
        <p>{t("schoolGoalDescription")}</p>
      </div>

      <div className="mx-auto h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={finalChartData}
            margin={{ top: 30, right: 20, bottom: 0, left: -10 }}
          >
            <XAxis dataKey="date" />
            <YAxis
              domain={[0, chartBase]}
              reversed={false}
              tickFormatter={(val) => `${Math.round(val)} kgCO₂`}
            />
            <Tooltip
              formatter={(val: number, name: string) => {
                if (name.includes("Emissions") || name.includes("Trajectory")) {
                  const percentage = (
                    ((chartBase - val) / chartBase) *
                    100
                  ).toFixed(1);
                  return [
                    t("schoolGoalTooltipSchoolTotalShare", {
                      emissions: Math.round(val),
                      pct: percentage,
                    }),
                    `${name}`,
                  ];
                }
                return [`${val}%`, `${name}`];
              }}
              wrapperClassName="hidden md:block"
            />

            {/* Actual Emissions line (purple) - shows actual emissions influenced by actions */}
            <Line
              type="monotone"
              dataKey="actualEmissions"
              stroke="#9c27b0"
              strokeWidth={3}
              name="Actual Emissions"
            />

            {/* School's Trajectory line (orange) - using goal & subgoal */}
            <Line
              type="monotone"
              dataKey="schoolTrajectoryEmissions"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="4 4"
              name="School's Trajectory"
            />

            {/* Paris Agreement Trajectory line (green) - goes to carbon neutrality */}
            <Line
              type="monotone"
              dataKey="parisAgreementEmissions"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4 4"
              name="Paris Agreement Trajectory"
            />

            {/* Sub-goal year vertical line */}
            <ReferenceLine
              x={subGoalYearNum.toString()}
              stroke="#f97316"
              strokeDasharray="3 3"
            >
              <Label
                value={`${subGoalYearNum} Target`}
                position="top"
                fill="#f97316"
              />
            </ReferenceLine>

            {/* Final goal year vertical line */}
            <ReferenceLine
              x={finalYearNum.toString()}
              stroke="#10b981"
              strokeDasharray="3 3"
            >
              <Label
                value={`${finalYearNum} Deadline`}
                position="top"
                fill="#10b981"
              />
            </ReferenceLine>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="text-muted-foreground mt-3 flex flex-wrap justify-between gap-4 text-sm">
        {/* Actual Emissions line (purple) */}
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-purple-500" />
          <span>
            Actual Emissions ({completedActions?.length || 0} completed actions)
          </span>
        </div>

        {/* School's Trajectory line (orange) */}
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-orange-500" />
          <span>
            School&apos;s Trajectory ({subGoal}% by {subGoalYearNum},{" "}
            {schoolGoal}% by {finalYearNum})
          </span>
        </div>

        {/* Paris Agreement Trajectory line (green) */}
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
          <span>Paris Agreement Trajectory (Carbon Neutrality by 2050)</span>
        </div>
      </div>
    </div>
  );
};

export default SchoolGoalCard;
