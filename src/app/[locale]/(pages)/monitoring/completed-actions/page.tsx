"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, CheckCircle2 } from "lucide-react";

const Monitoring = () => {
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
          <h1 className="text-3xl font-bold">All Actions</h1>
          <p className="mt-1 text-gray-500">
            Find All The Actions Of Your Project
          </p>
        </div>

        {/* Completed Actions */}
        <div className="card p-6">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-bold">Completed Actions</h2>
            </div>
            <span className="text-primary-800 bg-primary-100 rounded-full px-2 py-1 text-xs">
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
        </div>
      </motion.div>
    </div>
  );
};

export default Monitoring;
