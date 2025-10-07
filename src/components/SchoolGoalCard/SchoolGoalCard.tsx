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

interface ProjectAction {
  id: string;
  title: string;
  description: string;
  category: string;
  reduction: number;
  calculatedReduction: number;
  status: "Available" | "Selected" | "In Progress" | "Completed";
  studentName: string;
  dateAdded: string;
  dateCompleted?: string;
  timeline?: number; // Number of years the action will take place (default: 1)
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
  totalEmissions?: number; // Total school emissions in kgCO2
  totalReduction?: number;
  availableActions?: ProjectAction[];
  completedActions?: ProjectAction[];
};

const generateChartDataFromActions = (
  startYear: number,
  endYear: number,
  completedActions: ProjectAction[] = [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _availableActions: ProjectAction[] = [],
  subGoal: number = 0,
  subGoalYear: number = 0,
  finalGoal: number = 0,
  finalGoalYear: number = 0,
  totalEmissions: number = 0,
) => {
  const data = [];

  // Get current year for goal line calculations
  const currentYear = new Date().getFullYear();

  // Create a map to track cumulative reduction achieved by each year
  const cumulativeReductions = new Map<number, number>();

  // Initialize all years with zero reductions
  for (let year = startYear; year <= endYear; year++) {
    cumulativeReductions.set(year, 0);
  }

  // Process ONLY completed actions to show their cumulative impact
  // Available actions should not affect the graph until they are completed
  completedActions.forEach((action) => {
    // Use dateCompleted if available, otherwise fall back to dateAdded
    const completionDate = action.dateCompleted || action.dateAdded;
    const actionStartYear = new Date(completionDate).getFullYear();
    const timeline = action.timeline || 1; // Default to 1 year if not specified

    // For each year, add the reduction from this action during its timeline period
    for (let year = startYear; year <= endYear; year++) {
      let actionContribution = 0;

      // Check if this year is within the action's timeline period
      if (year >= actionStartYear && year < actionStartYear + timeline) {
        // The action contributes its full reduction during its timeline period
        actionContribution = action.calculatedReduction;
      }

      const currentReduction = cumulativeReductions.get(year) || 0;
      cumulativeReductions.set(year, currentReduction + actionContribution);
    }
  });

  // Generate yearly progress data for chart (emissions-based with cumulative reductions)
  for (let year = startYear; year <= endYear; year++) {
    const cumulativeReductionPercentage = cumulativeReductions.get(year) || 0;

    // Calculate current emissions after cumulative reduction
    const currentEmissions =
      totalEmissions * (1 - cumulativeReductionPercentage / 100);

    // Calculate sub-goal progression line (smooth linear progression from current year to sub-goal)
    let subGoalReductionPercentage = 0;
    if (year >= currentYear && subGoalYear > currentYear) {
      if (year <= subGoalYear) {
        // Linear progression from current year (0%) to sub-goal
        // Calculate the fraction of progress from current year to sub-goal year
        const progressFraction =
          (year - currentYear) / (subGoalYear - currentYear);
        subGoalReductionPercentage = subGoal * progressFraction;
      } else {
        // After sub-goal year, maintain sub-goal level
        subGoalReductionPercentage = subGoal;
      }
    }

    // Calculate final goal progression line (smooth linear progression from current year to final goal)
    let finalGoalReductionPercentage = 0;
    if (year >= currentYear && finalGoalYear > currentYear) {
      if (subGoalYear > currentYear && year <= subGoalYear) {
        // First phase: linear progression from current year to sub-goal
        const progressFraction =
          (year - currentYear) / (subGoalYear - currentYear);
        finalGoalReductionPercentage = subGoal * progressFraction;
      } else if (
        subGoalYear > currentYear &&
        year > subGoalYear &&
        finalGoalYear > subGoalYear
      ) {
        // Second phase: linear progression from sub-goal to final goal
        const progressFraction =
          (year - subGoalYear) / (finalGoalYear - subGoalYear);
        finalGoalReductionPercentage =
          subGoal + (finalGoal - subGoal) * progressFraction;
      } else if (subGoalYear <= currentYear && finalGoalYear > currentYear) {
        // Direct linear progression from current year to final goal (skip sub-goal if it's in the past)
        const progressFraction =
          (year - currentYear) / (finalGoalYear - currentYear);
        finalGoalReductionPercentage = finalGoal * progressFraction;
      }
    }

    // Convert percentage reductions to actual emission values
    const subGoalEmissions =
      totalEmissions * (1 - subGoalReductionPercentage / 100);
    const finalGoalEmissions =
      totalEmissions * (1 - finalGoalReductionPercentage / 100);

    data.push({
      date: `${year}`,
      currentEmissions: Math.max(currentEmissions, 0),
      subGoalEmissions: Math.max(subGoalEmissions, 0),
      finalGoalEmissions: Math.max(finalGoalEmissions, 0),
      currentReduction: Math.min(cumulativeReductionPercentage, 100),
      subGoalProgress: Math.min(Math.max(subGoalReductionPercentage, 0), 100),
      finalGoalProgress: Math.min(
        Math.max(finalGoalReductionPercentage, 0),
        100,
      ),
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
  let current = 0;
  let currentAlt = 0;
  for (let year = start; year <= end; year++) {
    current += baseRate;
    currentAlt += selectedRate ? selectedRate + baseRate : 0;

    const currentReductionPercentage = selectedRate
      ? Math.min(currentAlt, 100)
      : Math.min(current, 100);

    const currentEmissions =
      totalEmissions * (1 - currentReductionPercentage / 100);

    data.push({
      date: `${year}`,
      baseReduction: Math.min(current, 100),
      selectedReduction: selectedRate ? Math.min(currentAlt, 100) : undefined,
      currentReduction: currentReductionPercentage,
      currentEmissions: Math.max(currentEmissions, 0),
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
  totalEmissions = 1000, // Default total emissions if not provided
  availableActions: _availableActions,
  completedActions,
}) => {
  const t = useTranslations("StudentCalculator");

  const startYearNum = Number(startYear.slice(0, 4));
  const finalYearNum = Number(finalGoalYear.slice(0, 4));
  const subGoalYearNum = Number(subGoalYear.slice(0, 4));

  // Always use project-specific chart data if we have the required parameters
  const chartData = generateChartDataFromActions(
    startYearNum,
    finalYearNum,
    completedActions || [],
    _availableActions || [],
    subGoal,
    subGoalYearNum,
    schoolGoal,
    finalYearNum,
    totalEmissions,
  );

  // If no action data and chart data is empty, use legacy method
  const finalChartData =
    chartData.length > 0
      ? chartData
      : generateChartData(
          startYearNum,
          finalYearNum,
          baseReductionPerYear,
          selectedActionReductionPerYear,
          totalEmissions,
        );

  return (
    <div className="bg-primary-50! mb-8 border-primary-200! card">
      <div className="pb-4">
        <div className="flex max-lg:flex-col justify-between lg:items-center mb-2.5">
          <h3 className="flex items-center gap-2 font-bold text-xl lg:text-2xl">
            <Target className="w-5 h-5 text-primary-600" />
            {t("schoolGoalTitle")}
          </h3>
          <span className="font-bold text-md text-primary lg:text-xl">
            {subGoal}% {t("schoolGoalReduction")} ({subGoalYear})
          </span>
        </div>
        <p>{t("schoolGoalDescription")}</p>
      </div>

      <div className="mx-auto w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={finalChartData}
            margin={{ top: 30, right: 20, bottom: 0, left: -10 }}
          >
            <XAxis dataKey="date" />
            <YAxis
              domain={[0, totalEmissions]}
              reversed={false}
              tickFormatter={(val) => `${Math.round(val)} kgCO₂`}
            />
            <Tooltip
              formatter={(val: number, name: string) => {
                if (
                  name.includes("Emissions") ||
                  name.includes("Progression")
                ) {
                  const percentage = (
                    ((totalEmissions - val) / totalEmissions) *
                    100
                  ).toFixed(1);
                  return [
                    `${Math.round(val)} kgCO₂ (${percentage}% reduction)`,
                    `${name}`,
                  ];
                }
                return [`${val}%`, `${name}`];
              }}
              wrapperClassName="hidden md:block"
            />

            {/* Current Emissions line (shows actual emissions with action timeline reductions) */}
            <Line
              type="monotone"
              dataKey="currentEmissions"
              stroke="#9c27b0"
              strokeWidth={3}
              name="Current Emissions"
            />

            {/* Sub-goal progression line (smooth linear progression from current year) */}
            <Line
              type="monotone"
              dataKey="subGoalEmissions"
              stroke="#f97316"
              strokeWidth={2}
              strokeDasharray="4 4"
              name="Sub-Goal Progression"
            />

            {/* Final goal progression line (smooth linear progression from current year) */}
            <Line
              type="monotone"
              dataKey="finalGoalEmissions"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4 4"
              name="Final Goal Progression"
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
      <div className="flex flex-wrap justify-between gap-4 mt-3 text-muted-foreground text-sm">
        {/* Current emissions line */}
        <div className="flex items-center gap-2">
          <span className="inline-block bg-purple-500 rounded-full w-3 h-3" />
          <span>
            Current Emissions ({completedActions?.length || 0} completed
            actions)
          </span>
        </div>

        {/* Sub-goal progression line */}
        <div className="flex items-center gap-2">
          <span className="inline-block bg-orange-500 rounded-full w-3 h-3" />
          <span>
            Sub-Goal Progression ({subGoal}% by {subGoalYearNum})
          </span>
        </div>

        {/* Final goal progression line */}
        <div className="flex items-center gap-2">
          <span className="inline-block bg-green-500 rounded-full w-3 h-3" />
          <span>
            Final Goal Progression ({schoolGoal}% by {finalYearNum})
          </span>
        </div>

        {/* Legacy legend if no action data */}
        {!(_availableActions || completedActions) && (
          <>
            {/* Legacy legend */}
            <div className="flex items-center gap-2">
              <span className="inline-block bg-purple-500 rounded-full w-3 h-3" />
              <span>{t("schoolGoalLegendProgress")}</span>
            </div>
            {selectedActionReductionPerYear && (
              <div className="flex items-center gap-2">
                <span className="inline-block bg-blue-500 rounded-full w-3 h-3" />
                <span>
                  {t("schoolGoalLegendSelectedAction")}:{" "}
                  {selectedActionReductionPerYear}%
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SchoolGoalCard;
