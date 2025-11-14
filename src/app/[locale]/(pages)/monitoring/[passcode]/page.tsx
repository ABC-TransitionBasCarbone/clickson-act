"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import CustomActionFormModal from "@/components/ActionModal";
import SchoolGoalCard from "@/components/SchoolGoalCard";

import CompletedActions from "@/components/(action)/CompletedActions";
import { Action } from "@/types/Action";
import CurrentActions from "@/components/(action)/CurrentActions";
import { useUser } from "@/context/UserContext";
import { useProjectData } from "@/hooks/useProjectData";
import { useEmissionCategories } from "@/hooks/useEmissionCategories";

const ProjectMonitoring: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();

  // Get the passcode from the URL parameter
  const passcode = params.passcode as string;

  // Use project data hook with the specific passcode
  const {
    projectData,
    availableActions: projectAvailableActions,
    completedActions: projectCompletedActions,
    currentEmissions,
    totalReduction,
    loading,
    error,
    refetch,
  } = useProjectData(passcode);

  // Use emission categories hook to fetch from database
  const { categories: emissionCategories } = useEmissionCategories();

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

  // Transform emission categories for ActionModal
  const categories = emissionCategories.map((category) => ({
    value: category.category, // Use the database ID as value
    label: category.name,
  }));

  // Transform subcategories for ActionModal
  const subcategoryOptions = emissionCategories.flatMap((category) =>
    category.subcategories.map((subcategory) => ({
      value: `${category.category}-${subcategory.id}`, // Format: categoryId-subcategoryId
      label: subcategory.name,
    })),
  );

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

  // Only redirect if no user and not loading
  useEffect(() => {
    if (user !== undefined && !user && !loading) {
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

  const handleSubmitEdit = async (updatedAction: CustomAction) => {
    try {
      // Call the API to update the action in the database
      const response = await fetch(`/api/project/${passcode}/actions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedAction),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update action");
      }

      // Update local state
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

      // Refresh the data to ensure consistency
      refetch();
    } catch (error) {
      console.error("Error updating action:", error);
      alert(
        `Failed to update action: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleApproveChanges = async (action: CustomAction) => {
    try {
      console.log("Approving changes for action:", action.id);

      if (!action.pendingChanges) {
        throw new Error("No pending changes to approve");
      }

      // Apply the pending changes to the action
      const approvedAction = {
        ...action,
        steps: action.pendingChanges.steps || action.steps,
        monitoring: action.pendingChanges.monitoring || action.monitoring,
        performance: action.pendingChanges.performance || action.performance,
        keyContacts: action.pendingChanges.keyContacts || action.keyContacts,
        pendingChanges: undefined, // Clear pending changes
        needsApproval: false, // Mark as approved
      };

      // Call the API to update the action in the database
      const response = await fetch(`/api/project/${passcode}/actions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(approvedAction),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve changes");
      }

      // Update local state
      if (editingType === "completed") {
        setCompletedActions((prev) =>
          prev.map((a) => (a.id === action.id ? approvedAction : a)),
        );
      } else if (editingType === "available") {
        setAvailableActions((prev) =>
          prev.map((a) => (a.id === action.id ? approvedAction : a)),
        );
      }

      // Update the editingAction state to reflect the approved changes
      setEditingAction(approvedAction);
      setEditingType(null);

      // Refresh the data to ensure consistency
      refetch();
    } catch (error) {
      console.error("Error approving changes:", error);
      alert(
        `Failed to approve changes: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleRejectChanges = async (action: CustomAction) => {
    try {
      console.log("Rejecting changes for action:", action.id);

      if (!action.pendingChanges) {
        throw new Error("No pending changes to reject");
      }

      // Remove pending changes from the action
      const rejectedAction = {
        ...action,
        pendingChanges: undefined, // Clear pending changes
        needsApproval: false, // Mark as not needing approval
      };

      // Call the API to update the action in the database
      const response = await fetch(`/api/project/${passcode}/actions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rejectedAction),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reject changes");
      }

      // Update local state
      if (editingType === "completed") {
        setCompletedActions((prev) =>
          prev.map((a) => (a.id === action.id ? rejectedAction : a)),
        );
      } else if (editingType === "available") {
        setAvailableActions((prev) =>
          prev.map((a) => (a.id === action.id ? rejectedAction : a)),
        );
      }

      // Update the editingAction state to reflect the rejected changes
      setEditingAction(rejectedAction);
      setEditingType(null);

      // Refresh the data to ensure consistency
      refetch();
    } catch (error) {
      console.error("Error rejecting changes:", error);
      alert(
        `Failed to reject changes: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleCompleteAction = async (action: CustomAction) => {
    try {
      console.log("Completing action:", action.id);

      // Call the API to mark the action as completed in the database
      const completedAction = {
        ...action,
        status: "Completed",
        dateCompleted: new Date().toISOString(),
      };

      const response = await fetch(`/api/project/${passcode}/actions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(completedAction),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to complete action");
      }

      // Update local state
      setAvailableActions((prev) => prev.filter((a) => a.id !== action.id));
      setCompletedActions((prev) => [...prev, completedAction]);
      setEditingAction(null);
      setEditingType(null);

      // Refresh the data to ensure consistency and update the graph
      refetch();
    } catch (error) {
      console.error("Error completing action:", error);
      alert(
        `Failed to complete action: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleDeleteAction = async (action: CustomAction) => {
    try {
      console.log("Deleting action:", action.id);

      // Call the API to delete from database
      const response = await fetch(
        `/api/project/${passcode}/actions?actionId=${action.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete action");
      }

      // Update local state
      if (editingType === "completed") {
        setCompletedActions((prev) => prev.filter((a) => a.id !== action.id));
      } else if (editingType === "available") {
        setAvailableActions((prev) => prev.filter((a) => a.id !== action.id));
      }

      setEditingAction(null);
      setEditingType(null);

      // Refresh the data to ensure consistency
      refetch();
    } catch (error) {
      console.error("Error deleting action:", error);
      alert(
        `Failed to delete action: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-6 py-8"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Project Monitoring Dashboard</h1>
          <p className="mt-1 text-gray-500">
            Track progress and plan future actions
            {projectData && ` - ${projectData.name}`}
          </p>
        </div>

        {/* School Goal Card - only show when not loading and have project data */}
        {!loading && projectData && (
          <SchoolGoalCard
            schoolGoal={50} // Default goal
            subGoal={projectData.subGoalReductionAmount || 25} // Keep original value for now
            subGoalYear={String(projectData.subGoalDeadline || "2025")}
            finalGoalYear="2030" // Default final goal year
            baseReductionPerYear={5} // Default base reduction
            startYear={
              typeof projectData.startDate === "number"
                ? String(projectData.startDate)
                : projectData.startDate?.split("T")[0]?.split("-")[0] || "2024"
            }
            totalEmissions={currentEmissions || 1000} // Use current emissions as total
            currentEmissions={currentEmissions}
            totalReduction={totalReduction}
            availableActions={projectAvailableActions}
            completedActions={projectCompletedActions}
          />
        )}

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="border-t-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-300"></div>
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
              onAddAction={handleAddAction}
            />

            <CompletedActions
              completedActions={completedActions}
              onEdit={(action) => handleEditClick(action, "completed")}
            />
          </div>
        )}
      </motion.div>

      {editingAction && (
        <CustomActionFormModal
          mode="edit"
          onSubmit={handleSubmitEdit}
          onApproveChanges={handleApproveChanges}
          onRejectChanges={handleRejectChanges}
          onCompleteAction={handleCompleteAction}
          onDelete={handleDeleteAction}
          categories={categories}
          subcategoryOptions={subcategoryOptions}
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
          categories={categories}
          subcategoryOptions={subcategoryOptions}
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

export default ProjectMonitoring;
