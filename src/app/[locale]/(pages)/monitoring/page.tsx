"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, CheckCircle2, Star, ChevronRight } from "lucide-react";
import SchoolGoalCard from "@/components/SchoolGoalCard";
import { useRouter } from "@/i18n/navigation";

const Monitoring = () => {
  const [goal] = useState({
    name: "Reduce School Emissions",
    target: 45,
    current: 28,
    deadline: "December 2024",
  });

  const router = useRouter();

  const [completedActions] = useState([
    { id: 1, name: "Installed LED lighting", date: "2023-09-15", reduction: 8 },
    {
      id: 2,
      name: "Implemented recycling program",
      date: "2023-10-01",
      reduction: 12,
    },
    { id: 3, name: "Reduced paper usage", date: "2023-10-20", reduction: 7 },
  ]);

  const [availableActions] = useState([
    { id: 4, name: "Implement composting", effort: "Medium", reduction: 6 },
    {
      id: 5,
      name: "Switch to renewable energy",
      effort: "High",
      reduction: 15,
    },
    {
      id: 6,
      name: "Install water-saving fixtures",
      effort: "Low",
      reduction: 4,
    },
    {
      id: 7,
      name: "Organize bike-to-school week",
      effort: "Medium",
      reduction: 9,
    },
  ]);

  return (
    <div className="bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-6 py-8"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Monitoring Dashboard</h1>
          <p className="mt-1 text-gray-500">
            Track your progress and plan future actions
          </p>
        </div>

        {/* School Goal Card */}
        <SchoolGoalCard
          schoolGoal={goal.target}
          totalReduction={goal.current}
        />

        {/* Completed Actions */}
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <div className="card p-6">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-bold">Completed Actions</h2>
              </div>
              <span className="bg-primary-100 text-primary-800 rounded-full px-2 py-1 text-xs">
                {completedActions.length} actions
              </span>
            </div>
            <p className="text-gray-600">
              Actions completed since the project started
            </p>
            <div className="mt-4 space-y-4">
              {completedActions.map((action) => (
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
              onClick={() => router.push("/monitoring/completed-actions")}
            >
              View All Actions
            </button>
          </div>

          {/* Available Actions */}
          <div className="card p-6">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <h2 className="text-xl font-bold">Available Actions</h2>
              </div>
              <span className="bg-primary-100 text-primary-800 rounded-full px-2 py-1 text-xs">
                {availableActions.length} options
              </span>
            </div>
            <p className="text-gray-600">
              Recommended actions to reduce emissions
            </p>
            <div className="mt-4 space-y-4">
              {availableActions.map((action) => (
                <div
                  key={action.id}
                  className="flex justify-between border-b border-gray-100 pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">{action.name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        action.effort === "Low"
                          ? "bg-green-100 text-green-800"
                          : action.effort === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {action.effort} effort
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-600">
                      -{action.reduction}%
                    </span>
                    <ChevronRight
                      className="h-4 w-4 cursor-pointer"
                      onClick={() =>
                        router.push("/calculator/student/styfrstn")
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn btn-soft mt-auto w-fit self-center bg-white"
              onClick={() => router.push("/monitoring/available-actions")}
            >
              View All Available Actions
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Monitoring;
