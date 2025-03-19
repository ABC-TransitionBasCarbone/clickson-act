"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, ChevronRight } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

const categoryColors: { [key: string]: string } = {
  "Waste Management": "bg-green-100 text-green-800",
  Energy: "bg-yellow-100 text-yellow-800",
  "Water Conservation": "bg-blue-100 text-blue-800",
  Transportation: "bg-red-100 text-red-800",
};

const Monitoring = () => {
  const router = useRouter();

  const [availableActions] = useState([
    {
      id: 4,
      name: "Implement composting",
      category: "Waste Management",
      reduction: 6,
    },
    {
      id: 5,
      name: "Switch to renewable energy",
      category: "Energy",
      reduction: 15,
    },
    {
      id: 6,
      name: "Install water-saving fixtures",
      category: "Water Conservation",
      reduction: 4,
    },
    {
      id: 7,
      name: "Organize bike-to-school week",
      category: "Transportation",
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

        <div className="mb-6">
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
                      className={`rounded-full px-2 py-0.5 text-xs ${categoryColors[action.category] || "bg-gray-100 text-gray-800"}`}
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
                      onClick={() =>
                        router.push("/calculator/student/styfrstn")
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Monitoring;
