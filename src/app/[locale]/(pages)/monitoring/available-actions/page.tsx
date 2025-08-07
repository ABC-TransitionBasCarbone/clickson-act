"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, ChevronRight } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Action } from "@/types/Action";
import { useUser } from "@/context/UserContext";
import { useProjectData } from "@/hooks/useProjectData";

const categoryColors: { [key: string]: string } = {
  "Waste Management": "bg-green-100 text-green-800",
  Energy: "bg-yellow-100 text-yellow-800",
  "Water Conservation": "bg-blue-100 text-blue-800",
  Transportation: "bg-red-100 text-red-800",
};

interface AvailableActionsProps {
  actions: Action[];
  user?: { passcode?: string } | null;
}

const AvailableActions: React.FC<AvailableActionsProps> = ({
  actions,
  user,
}) => {
  const router = useRouter();

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-bold">Available Actions</h2>
        </div>
        <span className="bg-primary-100 text-primary-800 rounded-full px-2 py-1 text-xs">
          {actions.length} options
        </span>
      </div>
      <p className="text-gray-600">Recommended actions to reduce emissions</p>
      <div className="mt-4 space-y-4">
        {actions.map((action) => (
          <div
            key={action.id}
            className="flex justify-between border-b border-gray-100 pb-3 last:border-0"
          >
            <div>
              <p className="font-medium">{action.title}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  categoryColors[action.category] || "bg-gray-100 text-gray-800"
                }`}
              >
                {action.category}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-green-600">
                -{action.reduction}%
              </span>
              <ChevronRight
                className="h-4 w-4 cursor-pointer"
                onClick={() => {
                  // Navigate to data reporting with user's passcode if available
                  const passcode = user?.passcode;
                  if (passcode) {
                    router.push(`/data-reporting/${passcode}`);
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AvailableScreen = () => {
  const { user } = useUser();
  const router = useRouter();

  // Use project data hook to get real project data
  const {
    availableActions: projectAvailableActions,
    loading,
    error,
  } = useProjectData();

  const [availableActions, setAvailableActions] = useState<Action[]>([]);

  // Update local state when project data changes
  useEffect(() => {
    if (projectAvailableActions) {
      const convertedActions = projectAvailableActions.map((action) => ({
        ...action,
        date: action.dateAdded.split("T")[0], // Convert ISO date to YYYY-MM-DD
        reduction: action.calculatedReduction, // Use calculated reduction as the main reduction value
        manager: action.studentName,
        nature: action.category,
        objectives: action.description,
        keyContacts: "",
        steps: "",
        calendar: action.dateAdded,
        indicators: "",
        monitoring: "",
        performance: "",
        effort: "medium", // Default effort level
      })) as Action[];
      setAvailableActions(convertedActions);
    }
  }, [projectAvailableActions]);

  // Redirect to login if no user or passcode
  useEffect(() => {
    if (!user?.passcode) {
      router.push("/");
    }
  }, [user, router]);

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

        {loading && (
          <div className="mb-8 text-center">
            <p className="text-gray-500">Loading available actions...</p>
          </div>
        )}

        {error && (
          <div className="mb-8 rounded-lg bg-red-50 p-4">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        <div className="mb-6">
          <AvailableActions actions={availableActions} user={user} />
        </div>
      </motion.div>
    </div>
  );
};

export default AvailableScreen;
