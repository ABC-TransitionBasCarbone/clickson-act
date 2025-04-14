"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, CheckCircle2, Star, ChevronRight, Pencil } from "lucide-react";
import SchoolGoalCard from "@/components/SchoolGoalCard";
import { useRouter } from "@/i18n/navigation";
import CustomActionFormModal, { CustomAction } from "@/components/ActionModal";

const Monitoring: React.FC = () => {
  const router = useRouter();

  // Example goal data
  const [goal] = useState({
    name: "Reduce School Emissions",
    target: 45,
    current: 28,
    deadline: "December 2024",
  });

  // Stateful arrays for completed and available actions.
  const [completedActions, setCompletedActions] = useState<CustomAction[]>([
    {
      id: "1",
      category: "energy",
      title: "Installed LED lighting",
      description: "Replaced incandescent bulbs with energy-efficient LEDs.",
      reduction: "8",
      effort: "Low",
      manager: "John Doe",
      nature: "energy",
      objectives: "Reduce energy consumption by 10%",
      keyContacts: "john.doe@example.com",
      steps: "Audit current lighting, purchase LEDs, install them",
      calendar: "2023-09-15",
      indicators: "Energy bill comparison",
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
      effort: "Medium",
      manager: "Jane Smith",
      nature: "waste",
      objectives: "Cut waste disposal costs by 15%",
      keyContacts: "jane.smith@example.com",
      steps: "Set up bins, arrange for pickups, educate staff",
      calendar: "2023-10-01",
      indicators: "Waste recycled vs. landfill",
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
      effort: "Low",
      manager: "Alice Johnson",
      nature: "nature",
      objectives: "Lower paper costs by 20%",
      keyContacts: "alice.johnson@example.com",
      steps: "Digitize records, train staff on the system",
      calendar: "2023-10-20",
      indicators: "Paper purchase orders",
      monitoring: "Monthly",
      performance: "Good",
      selected: false,
      date: "2023-10-20",
      icon: <></>,
    },
  ]);

  const [availableActions, setAvailableActions] = useState<CustomAction[]>([
    {
      id: "4",
      category: "waste",
      title: "Implement composting",
      description: "",
      reduction: "6",
      effort: "Medium",
      manager: "",
      nature: "",
      objectives: "",
      keyContacts: "",
      steps: "",
      calendar: "",
      indicators: "",
      monitoring: "",
      performance: "",
      selected: false,
      date: new Date().toISOString(),
      icon: <></>,
    },
    {
      id: "5",
      category: "energy",
      title: "Switch to renewable energy",
      description: "",
      reduction: "15",
      effort: "High",
      manager: "",
      nature: "",
      objectives: "",
      keyContacts: "",
      steps: "",
      calendar: "",
      indicators: "",
      monitoring: "",
      performance: "",
      selected: false,
      date: new Date().toISOString(),
      icon: <></>,
    },
    {
      id: "6",
      category: "nature",
      title: "Install water-saving fixtures",
      description: "",
      reduction: "4",
      effort: "Low",
      manager: "",
      nature: "",
      objectives: "",
      keyContacts: "",
      steps: "",
      calendar: "",
      indicators: "",
      monitoring: "",
      performance: "",
      selected: false,
      date: new Date().toISOString(),
      icon: <></>,
    },
    {
      id: "7",
      category: "transport",
      title: "Organize bike-to-school week",
      description: "",
      reduction: "9",
      effort: "Medium",
      manager: "",
      nature: "",
      objectives: "",
      keyContacts: "",
      steps: "",
      calendar: "",
      indicators: "",
      monitoring: "",
      performance: "",
      selected: false,
      date: new Date().toISOString(),
      icon: <></>,
    },
  ]);

  // Track which action is being edited and what list it belongs to.
  const [editingAction, setEditingAction] = useState<CustomAction | null>(null);
  const [editingType, setEditingType] = useState<
    "completed" | "available" | null
  >(null);

  // Function to open the modal in edit mode.
  const handleEditClick = (
    action: CustomAction,
    type: "completed" | "available",
  ) => {
    setEditingAction(action);
    setEditingType(type);
    const modal = document.getElementById("custom_action") as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  // Update the proper state with the edited action.
  const handleSubmitEdit = (updatedAction: CustomAction) => {
    if (editingType === "completed") {
      setCompletedActions((prev) =>
        prev.map((action) =>
          action.id === updatedAction.id ? updatedAction : action,
        ),
      );
    } else if (editingType === "available") {
      setAvailableActions((prev) =>
        prev.map((action) =>
          action.id === updatedAction.id ? updatedAction : action,
        ),
      );
    }
    setEditingAction(null);
    setEditingType(null);
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
                  className="flex cursor-pointer justify-between border-b border-gray-100 pb-3 last:border-0"
                  onClick={() => handleEditClick(action, "completed")}
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
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-600">
                      -{action.reduction}%
                    </span>
                    <ChevronRight className="h-4 w-4 cursor-pointer text-gray-600" />
                  </div>
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
                  className="flex cursor-pointer justify-between border-b border-gray-100 pb-3 last:border-0"
                  onClick={() => handleEditClick(action, "available")}
                >
                  <div>
                    <p className="font-medium">{action.title}</p>
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
                    <ChevronRight className="h-4 w-4 cursor-pointer text-gray-600" />
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

      {/* Reusable modal used for editing actions in both lists */}
      {editingAction && (
        <CustomActionFormModal
          mode="edit"
          onSubmit={handleSubmitEdit}
          categories={[
            { value: "energy", label: "Energy" },
            { value: "waste", label: "Waste" },
            { value: "transport", label: "Transport" },
            { value: "nature", label: "Nature" },
          ]}
          effortCategories={[
            { value: "easy", label: "Easy" },
            { value: "medium", label: "Medium" },
            { value: "hard", label: "Hard" },
          ]}
          initialAction={editingAction}
        />
      )}
    </div>
  );
};

export default Monitoring;
