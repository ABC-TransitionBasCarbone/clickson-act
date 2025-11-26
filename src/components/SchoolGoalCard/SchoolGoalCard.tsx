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

  // Paris Agreement target year (carbon neutrality by 2050)
  const parisAgreementYear = 2050;

  // Create a map to track cumulative reduction achieved by each year
  const cumulativeReductions = new Map<number, number>();

  // Initialize all years with zero reductions
  for (let year = startYear; year <= endYear; year++) {
    cumulativeReductions.set(year, 0);
  }

  // Process ONLY completed actions to show their cumulative impact
  // Available actions should not affect the graph until they are completed
  // Only count actions from startYear onwards to ensure all trajectories start at the same point
  completedActions.forEach((action) => {
    // Use dateCompleted if available, otherwise fall back to dateAdded
    const completionDate = action.dateCompleted || action.dateAdded;
    const actionStartYear = new Date(completionDate).getFullYear();
    const timeline = action.timeline || 1; // Default to 1 year if not specified

    // Only process actions that start from startYear onwards
    // This ensures all trajectories start at totalEmissions in startYear
    if (actionStartYear < startYear) {
      return; // Skip actions completed before startYear
    }

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

    // Calculate actual emissions after cumulative reduction (purple line)
    // Starts at totalEmissions in startYear and decreases based on actions from that point
    const actualEmissions =
      totalEmissions * (1 - cumulativeReductionPercentage / 100);

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
        const progressFraction = (year - startYear) / (finalGoalYear - startYear);
        schoolReductionPercentage = finalGoal * progressFraction;
      }
      
      schoolTrajectoryEmissions =
        totalEmissions * (1 - schoolReductionPercentage / 100);
    }

    data.push({
      date: `${year}`,
      actualEmissions: Math.max(actualEmissions, 0),
      schoolTrajectoryEmissions: Math.max(schoolTrajectoryEmissions, 0),
      parisAgreementEmissions: Math.max(parisAgreementEmissions, 0),
      currentReduction: Math.min(cumulativeReductionPercentage, 100),
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
                if (name.includes("Emissions") || name.includes("Trajectory")) {
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
      <div className="flex flex-wrap justify-between gap-4 mt-3 text-muted-foreground text-sm">
        {/* Actual Emissions line (purple) */}
        <div className="flex items-center gap-2">
          <span className="inline-block bg-purple-500 rounded-full w-3 h-3" />
          <span>
            Actual Emissions ({completedActions?.length || 0} completed
            actions)
          </span>
        </div>

        {/* School's Trajectory line (orange) */}
        <div className="flex items-center gap-2">
          <span className="inline-block bg-orange-500 rounded-full w-3 h-3" />
          <span>
            School&apos;s Trajectory ({subGoal}% by {subGoalYearNum}, {schoolGoal}% by {finalYearNum})
          </span>
        </div>

        {/* Paris Agreement Trajectory line (green) */}
        <div className="flex items-center gap-2">
          <span className="inline-block bg-green-500 rounded-full w-3 h-3" />
          <span>
            Paris Agreement Trajectory (Carbon Neutrality by 2050)
          </span>
        </div>
      </div>
    </div>
  );
};

export default SchoolGoalCard;
