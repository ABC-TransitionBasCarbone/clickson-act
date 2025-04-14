"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, CheckCircle2 } from "lucide-react";
import ActionModal from "@/components/ActionModal";

// Sample categories and effort categories
const CATEGORIES = [
  { value: "energy", label: "Energy" },
  { value: "waste", label: "Waste" },
  { value: "transport", label: "Transport" },
  { value: "nature", label: "Nature" },
];
const EFFORT_CATEGORIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

interface CustomAction {
  id: string;
  icon: React.ReactNode;
  category: string;
  title: string;
  description: string;
  reduction: string;
  effort: string;
  manager: string;
  nature: string;
  objectives: string;
  keyContacts: string;
  steps: string;
  calendar: string;
  indicators: string;
  monitoring: string;
  performance: string;
  selected: boolean;
  date: string;
}

const Monitoring: React.FC = () => {
  // Sample data – note additional fields for more details
  const [completedActions, setCompletedActions] = useState<CustomAction[]>([
    {
      id: "1",
      category: "energy",
      title: "Installed LED lighting",
      description: "Replaced incandescent bulbs with energy-efficient LEDs.",
      reduction: "8",
      effort: "easy",
      manager: "John Doe",
      nature: "energy",
      objectives: "Reduce energy consumption by 10%",
      keyContacts: "john.doe@example.com",
      steps: "Audit current lighting, purchase LEDs, install",
      calendar: "2023-09-15",
      indicators: "Energy bill before/after",
      monitoring: "Monthly check",
      performance: "Satisfactory",
      selected: false,
      date: "2023-09-15",
      icon: <></>,
    },
    {
      id: "2",
      category: "waste",
      title: "Implemented recycling program",
      description: "Introduced a systematic recycling program in the office.",
      reduction: "12",
      effort: "medium",
      manager: "Jane Smith",
      nature: "waste",
      objectives: "Cut waste disposal costs by 15%",
      keyContacts: "jane.smith@example.com",
      steps: "Set up bins, arrange for pickups, educate staff",
      calendar: "2023-10-01",
      indicators: "Waste recycled vs. sent to landfill",
      monitoring: "Quarterly review",
      performance: "Excellent",
      selected: false,
      date: "2023-10-01",
      icon: <></>,
    },
    {
      id: "3",
      category: "nature",
      title: "Reduced paper usage",
      description: "Moved to digital documentation to decrease paper waste.",
      reduction: "7",
      effort: "easy",
      manager: "Alice Johnson",
      nature: "nature",
      objectives: "Lower paper costs by 20%",
      keyContacts: "alice.johnson@example.com",
      steps: "Digitize records, train staff on new systems",
      calendar: "2023-10-20",
      indicators: "Paper purchase orders",
      monitoring: "Monthly",
      performance: "Good",
      selected: false,
      date: "2023-10-20",
      icon: <></>,
    },
  ]);

  const [editingAction, setEditingAction] = useState<CustomAction | null>(null);

  const handleActionClick = (action: CustomAction) => {
    setEditingAction(action);
    const modal = document.getElementById("custom_action") as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  const handleSubmitEdit = (updatedAction: CustomAction) => {
    setCompletedActions((prevActions) =>
      prevActions.map((action) =>
        action.id === updatedAction.id
          ? { ...updatedAction, date: action.date }
          : action,
      ),
    );
  };

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
                className="flex cursor-pointer justify-between rounded-md border-b border-gray-100 p-2 pb-3 last:border-0 hover:bg-gray-100"
                onClick={() => handleActionClick(action)}
              >
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">{action.title}</p>
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

      <ActionModal
        mode="edit"
        onSubmit={handleSubmitEdit}
        categories={CATEGORIES}
        effortCategories={EFFORT_CATEGORIES}
        initialAction={editingAction ?? undefined}
      />
    </div>
  );
};

export default Monitoring;
