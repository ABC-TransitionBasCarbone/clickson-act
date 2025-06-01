"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SchoolGoalCard from "@/components/SchoolGoalCard";
import { useRouter } from "@/i18n/navigation";
import CustomActionFormModal from "@/components/ActionModal";

import CompletedActions from "@/components/(action)/CompletedActions";
import { Action } from "@/types/Action";
import CurrentActions from "@/components/(action)/CurrentActions";

const Monitoring: React.FC = () => {
  const router = useRouter();

  interface CustomAction extends Action {
    selected: boolean;
  }

  const [completedActions, setCompletedActions] = useState<CustomAction[]>([]);
  const [availableActions, setAvailableActions] = useState<CustomAction[]>([]);

  const [editingAction, setEditingAction] = useState<CustomAction | null>(null);
  const [editingType, setEditingType] = useState<
    "completed" | "available" | null
  >(null);

  useEffect(() => {
    fetch("/data/actions.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch actions file");
        return res.json();
      })
      .then((data) => {
        if (data) {
          setCompletedActions(data);
          setAvailableActions(data);
        }
      })
      .catch((error) => console.error("Error loading actions file:", error));
  }, []);

  const handleEditClick = (
    action: CustomAction,
    type: "completed" | "available",
  ) => {
    setEditingAction(action);
    setEditingType(type);
    const modal = document.getElementById("custom_action") as HTMLDialogElement;
    if (modal) modal.showModal();
  };

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

        <SchoolGoalCard
          schoolGoal={40}
          subGoal={25}
          subGoalYear="2028"
          finalGoalYear="2030"
          baseReductionPerYear={3}
          startYear={"2025"}
        />

        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <CurrentActions
            currentActions={availableActions}
            onEdit={(action) => handleEditClick(action, "available")}
            onViewAll={() => router.push("/monitoring/available-actions")}
          />

          <CompletedActions
            completedActions={completedActions}
            onEdit={(action) => handleEditClick(action, "completed")}
            onViewAll={() => router.push("/monitoring/completed-actions")}
          />
        </div>
      </motion.div>

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
