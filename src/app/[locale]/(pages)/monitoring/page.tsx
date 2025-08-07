"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "@/i18n/navigation";
import CustomActionFormModal from "@/components/ActionModal";
import SchoolGoalCard from "@/components/SchoolGoalCard";

import CompletedActions from "@/components/(action)/CompletedActions";
import { Action } from "@/types/Action";
import CurrentActions from "@/components/(action)/CurrentActions";
import { useUser } from "@/context/UserContext";
import { useProjectData } from "@/hooks/useProjectData";

const Monitoring: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();

  // Use project data hook to get real project data
  const {
    projectData,
    availableActions: projectAvailableActions,
    completedActions: projectCompletedActions,
    currentEmissions,
    totalReduction,
    loading,
    error,
    refetch,
  } = useProjectData();

  interface CustomAction extends Action {
    selected: boolean;
    calculatedReduction?: number; // Add calculated reduction field
  }

  // Convert project actions to CustomAction format
  const [completedActions, setCompletedActions] = useState<CustomAction[]>([]);
  const [availableActions, setAvailableActions] = useState<CustomAction[]>([]);

  const [editingAction, setEditingAction] = useState<CustomAction | null>(null);
  const [editingType, setEditingType] = useState<
    "completed" | "available" | null
  >(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Memoize converted actions to prevent unnecessary re-renders
  const convertedCompletedActions = useMemo(() => {
    if (!projectCompletedActions || projectCompletedActions.length === 0) {
      return [];
    }
    return projectCompletedActions.map((action) => ({
      ...action,
      selected: false,
      manager: action.studentName,
      nature: action.category,
      objectives: action.description,
      keyContacts: "",
      steps: "",
      calendar: action.dateCompleted || action.dateAdded,
      indicators: "",
      monitoring: "",
      performance: "",
      effort: "medium", // Default effort level since project actions don't have effort property
      timeline: 1, // Default timeline
      date: (action.dateCompleted || action.dateAdded).split("T")[0], // Convert ISO date to YYYY-MM-DD
      reduction: action.calculatedReduction, // Use calculated reduction as the main reduction value
      calculatedReduction: action.calculatedReduction, // Also keep it as calculatedReduction
    })) as CustomAction[];
  }, [projectCompletedActions]);

  const convertedAvailableActions = useMemo(() => {
    if (!projectAvailableActions || projectAvailableActions.length === 0) {
      return [];
    }
    return projectAvailableActions.map((action) => ({
      ...action,
      selected: false,
      manager: action.studentName,
      nature: action.category,
      objectives: action.description,
      keyContacts: "",
      steps: "",
      calendar: action.dateAdded,
      indicators: "",
      monitoring: "",
      performance: "",
      effort: "medium", // Default effort level since project actions don't have effort property
      timeline: action.timeline || 1, // Use existing timeline or default to 1
      date: action.dateAdded.split("T")[0], // Convert ISO date to YYYY-MM-DD
      reduction: action.calculatedReduction, // Use calculated reduction as the main reduction value
      calculatedReduction: action.calculatedReduction, // Also keep it as calculatedReduction
    })) as CustomAction[];
  }, [projectAvailableActions]);

  // Update local state when converted actions change
  useEffect(() => {
    setCompletedActions(convertedCompletedActions);
  }, [convertedCompletedActions]);

  useEffect(() => {
    setAvailableActions(convertedAvailableActions);
  }, [convertedAvailableActions]);

  // Redirect to login if no user or passcode - only after user context is loaded and we're not loading project data
  useEffect(() => {
    if (user !== undefined && !user?.passcode && !loading) {
      router.push("/");
    }
  }, [user, router, loading]);

  const handleEditClick = (
    action: CustomAction,
    type: "completed" | "available",
  ) => {
    setEditingAction(action);
    setEditingType(type);
    const modal = document.getElementById("custom_action") as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  const handleAddAction = () => {
    setShowCreateModal(true);
    setEditingAction(null);
    setEditingType(null);
    setTimeout(() => {
      const modal = document.getElementById(
        "custom_action",
      ) as HTMLDialogElement;
      if (modal) modal.showModal();
    }, 0);
  };

  const handleSubmitCreate = (newAction: CustomAction) => {
    setAvailableActions((prev) => [...prev, newAction]);
    setShowCreateModal(false);
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
            {projectData && ` - ${projectData.name}`}
          </p>
        </div>

        {/* School Goal Card - only show when not loading and have project data */}
        {!loading && projectData && (
          <SchoolGoalCard
            schoolGoal={50} // Default goal
            subGoal={projectData.subGoalReductionAmount || 25}
            subGoalYear={projectData.subGoalDeadline?.toString() || "2025"}
            finalGoalYear="2030" // Default final goal year
            baseReductionPerYear={5} // Default base reduction
            startYear={
              projectData.startDate?.split("T")[0]?.split("-")[0] || "2024"
            }
            currentEmissions={currentEmissions}
            totalReduction={totalReduction}
            availableActions={projectAvailableActions}
            completedActions={projectCompletedActions}
          />
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
              <p className="text-gray-500">Loading project data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="mb-8 rounded-lg bg-red-50 p-4">
            <p className="text-red-700">Error: {error}</p>
            <button
              onClick={refetch}
              className="mt-2 rounded bg-red-100 px-3 py-1 text-red-700 hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <CurrentActions
              currentActions={availableActions}
              onEdit={(action) => handleEditClick(action, "available")}
              onViewAll={() => router.push("/monitoring/available-actions")}
              onAddAction={handleAddAction}
            />

            <CompletedActions
              completedActions={completedActions}
              onEdit={(action) => handleEditClick(action, "completed")}
              onViewAll={() => router.push("/monitoring/completed-actions")}
            />
          </div>
        )}
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
      {showCreateModal && (
        <CustomActionFormModal
          mode="create"
          onSubmit={handleSubmitCreate}
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
          initialAction={undefined}
        />
      )}
    </div>
  );
};

export default Monitoring;
