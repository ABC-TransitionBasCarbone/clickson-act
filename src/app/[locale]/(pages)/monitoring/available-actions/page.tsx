"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, ChevronRight } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Action } from "@/types/Action";

const categoryColors: { [key: string]: string } = {
  "Waste Management": "bg-green-100 text-green-800",
  Energy: "bg-yellow-100 text-yellow-800",
  "Water Conservation": "bg-blue-100 text-blue-800",
  Transportation: "bg-red-100 text-red-800",
};

interface AvailableActionsProps {
  actions: Action[];
}

const AvailableActions: React.FC<AvailableActionsProps> = ({ actions }) => {
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
                onClick={() => router.push("/data-reporting/student/styfrstn")}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AvailableScreen = () => {
  const [availableActions, setAvailableActions] = useState<Action[]>([]);

  useEffect(() => {
    fetch("/data/actions.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch actions file");
        return res.json();
      })
      .then((data) => {
        if (data) {
          setAvailableActions(data);
        }
      })
      .catch((error) => console.error("Error loading actions file:", error));
  }, []);

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

        <div className="mb-6">
          <AvailableActions actions={availableActions} />
        </div>
      </motion.div>
    </div>
  );
};

export default AvailableScreen;
