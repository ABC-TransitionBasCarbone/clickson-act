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

type SchoolGoalCardProps = {
  schoolGoal: number;
  subGoal: number;
  subGoalYear: string;
  finalGoalYear: string;
  baseReductionPerYear: number;
  selectedActionReductionPerYear?: number;
  startYear: string;
};

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
}) => {
  const t = useTranslations("StudentCalculator");

  const startYearNum = Number(startYear.slice(0, 4));
  const finalYearNum = Number(finalGoalYear.slice(0, 4));
  const subGoalYearNum = Number(subGoalYear.slice(0, 4));

  const chartData = generateChartData(
    startYearNum,
    finalYearNum,
    baseReductionPerYear,
    selectedActionReductionPerYear,
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
            data={chartData}
            margin={{ top: 30, right: 20, bottom: 0, left: -10 }}
          >
            <XAxis dataKey="date" />
            <YAxis
              domain={[0, Math.max(100, schoolGoal)]}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip
              formatter={(val: number, name: string) => {
                return [`${val}%`, `${name}`];
              }}
            />

            {/* Base reduction line */}
            <Line
              type="monotone"
              dataKey="baseReduction"
              stroke="#3b82f6"
              strokeWidth={3}
              name={t("schoolGoalLegendProgress")}
            />

            {/* Selected action line */}
            {selectedActionReductionPerYear && (
              <Line
                type="monotone"
                dataKey="selectedReduction"
                stroke="#8b5cf6"
                strokeWidth={3}
                strokeDasharray="5 2"
                name={t("schoolGoalLegendSelectedAction")}
              />
            )}

            {/* Sub-goal horizontal line */}
            <ReferenceLine
              y={subGoal}
              stroke="#f97316"
              strokeDasharray="4 4"
            ></ReferenceLine>

            {/* Sub-goal year vertical line */}
            <ReferenceLine
              x={subGoalYearNum.toString()}
              stroke="#f97316"
              strokeDasharray="3 3"
            >
              <Label
                value={subGoalYearNum.toString()}
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
                value={finalYearNum.toString()}
                position="top"
                fill="#10b981"
              />
            </ReferenceLine>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-between gap-4 mt-3 text-muted-foreground text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block bg-blue-500 rounded-full w-3 h-3" />
          <span>{t("schoolGoalLegendProgress")}</span>
        </div>
        {selectedActionReductionPerYear && (
          <div className="flex items-center gap-2">
            <span className="inline-block bg-purple-500 rounded-full w-3 h-3" />
            <span>
              {t("schoolGoalLegendSelectedAction")}:{" "}
              {selectedActionReductionPerYear}%
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="inline-block bg-orange-400 rounded-full w-3 h-3" />
          <span>
            {t("schoolGoalLegendSubgoal")}: {subGoal}% ({subGoalYearNum})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block bg-emerald-500 rounded-full w-3 h-3" />
          <span>
            {t("schoolGoalLegendGoal")}: {schoolGoal}% ({finalYearNum})
          </span>
        </div>
      </div>
    </div>
  );
};

export default SchoolGoalCard;
