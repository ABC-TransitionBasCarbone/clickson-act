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
  totalReduction?: number;
  availableActions?: ProjectAction[];
  completedActions?: ProjectAction[];
};

const generateChartDataFromActions = (
  startYear: number,
  endYear: number,
  completedActions: ProjectAction[] = [],
  availableActions: ProjectAction[] = [],
  subGoal: number = 0,
  subGoalYear: number = 0,
  finalGoal: number = 0,
  finalGoalYear: number = 0,
) => {
  const data = [];

  // Create a map to track yearly reduction progress for each action
  const yearlyReductions = new Map<number, number>();

  // Initialize all years with zero reductions
  for (let year = startYear; year <= endYear; year++) {
    yearlyReductions.set(year, 0);
  }

  // Process all actions (both completed and available) to show their yearly progress
  const allActions = [...completedActions, ...availableActions];

  allActions.forEach((action) => {
    const actionStartYear = new Date(action.dateAdded).getFullYear();
    const timeline = action.timeline || 1; // Default to 1 year if not specified
    const actionEndYear = actionStartYear + timeline;

    // Calculate yearly reduction percentage for this action
    const yearlyReductionPercentage = action.calculatedReduction / timeline;

    // Distribute the reduction over the action's timeline
    for (
      let year = actionStartYear;
      year < Math.min(actionEndYear, endYear + 1);
      year++
    ) {
      const currentYearReduction = yearlyReductions.get(year) || 0;
      yearlyReductions.set(
        year,
        currentYearReduction + yearlyReductionPercentage,
      );
    }
  });

  // Generate yearly progress data for chart (non-cumulative)
  for (let year = startYear; year <= endYear; year++) {
    const yearReduction = yearlyReductions.get(year) || 0;

    // Calculate expected progress line (linear progression to goals)
    let expectedProgress = 0;
    if (year <= subGoalYear && subGoalYear > startYear) {
      // Linear progression to sub-goal
      expectedProgress =
        (subGoal * (year - startYear)) / (subGoalYear - startYear);
    } else if (year > subGoalYear && finalGoalYear > subGoalYear) {
      // Linear progression from sub-goal to final goal
      const progressFromSubGoal =
        ((finalGoal - subGoal) * (year - subGoalYear)) /
        (finalGoalYear - subGoalYear);
      expectedProgress = subGoal + progressFromSubGoal;
    } else if (
      year <= finalGoalYear &&
      finalGoalYear > startYear &&
      subGoalYear === 0
    ) {
      // Direct linear progression to final goal if no sub-goal
      expectedProgress =
        (finalGoal * (year - startYear)) / (finalGoalYear - startYear);
    }

    data.push({
      date: `${year}`,
      currentReduction: Math.min(yearReduction, 100), // Use yearly reduction, not cumulative
      expectedProgress: Math.min(Math.max(expectedProgress, 0), 100),
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
) => {
  const data = [];
  let current = 0;
  let currentAlt = 0;
  for (let year = start; year <= end; year++) {
    current += baseRate;
    currentAlt += selectedRate ? selectedRate + baseRate : 0;
    data.push({
      date: `${year}`,
      baseReduction: Math.min(current, 100),
      selectedReduction: selectedRate ? Math.min(currentAlt, 100) : undefined,
      currentReduction: selectedRate
        ? Math.min(currentAlt, 100)
        : Math.min(current, 100),
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
  availableActions,
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
    availableActions || [],
    subGoal,
    subGoalYearNum,
    schoolGoal,
    finalYearNum,
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
              domain={[0, schoolGoal]}
              reversed={true}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip
              formatter={(val: number, name: string) => {
                return [`${val}%`, `${name}`];
              }}
            />

            {/* Current Reduction line (shows actual action progress over time) */}
            <Line
              type="monotone"
              dataKey="currentReduction"
              stroke="#9c27b0"
              strokeWidth={3}
              name="Current Reduction"
            />

            {/* Sub-goal reference line */}
            <ReferenceLine
              y={subGoal}
              stroke="#f97316"
              strokeDasharray="4 4"
              strokeWidth={2}
            >
              <Label
                value={`Sub-Goal: ${subGoal}%`}
                position="insideTopLeft"
                fill="#f97316"
              />
            </ReferenceLine>

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
        {/* Always show current reduction */}
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-blue-500" />
          <span>
            Current Reduction (
            {(completedActions?.length || 0) + (availableActions?.length || 0)}{" "}
            actions)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full bg-orange-500" />
          <span>
            Sub-Goal ({subGoal}% by {subGoalYearNum})
          </span>
        </div>

        {/* Legacy legend if no action data */}
        {!(availableActions || completedActions) && (
          <>
            {/* Legacy legend */}
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full bg-blue-500" />
              <span>{t("schoolGoalLegendProgress")}</span>
            </div>
            {selectedActionReductionPerYear && (
              <div className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-purple-500" />
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
