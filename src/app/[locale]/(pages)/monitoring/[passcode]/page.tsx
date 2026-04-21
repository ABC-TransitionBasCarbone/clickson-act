"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import CustomActionFormModal from "@/components/ActionModal";
import SchoolGoalCard from "@/components/SchoolGoalCard";

import CompletedActions from "@/components/(action)/CompletedActions";
import { Action } from "@/types/Action";
import CurrentActions from "@/components/(action)/CurrentActions";
import { useUser } from "@/context/UserContext";
import { useProjectData } from "@/hooks/useProjectData";
import { useEmissionCategories } from "@/hooks/useEmissionCategories";
import LoadingState from "@/components/ui/LoadingState";

const ProjectMonitoring: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { user, isLoaded } = useUser();
  const tMonitoring = useTranslations("MonitoringPage");
  const tAction = useTranslations("Action");

  // Get the passcode from the URL parameter
  const passcode = params.passcode as string;

  // Use project data hook with the specific passcode
  const {
    projectData,
    availableActions: projectAvailableActions,
    completedActions: projectCompletedActions,
    currentEmissions,
    schoolTotalEmissions,
    subcategoryEmissionsKg,
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

  const mapProjectActionToCustom = useCallback(
    (
      action: (Action & { calculatedReduction?: number }) & {
        studentName?: string;
        dateAdded: string;
        dateCompleted?: string;
        selected?: boolean;
        status?: "Available" | "Selected" | "Completed" | "In Progress";
      },
      fallbackDate: string,
    ): CustomAction => ({
      ...action,
      manager: action.manager || action.studentName || "",
      assignedTo: action.assignedTo || "",
      nature: action.nature || action.category,
      objectives: action.objectives || action.description,
      keyContacts: action.keyContacts || "",
      steps: action.steps || "",
      calendar: action.calendar || fallbackDate,
      indicators: action.indicators || "",
      monitoring: action.monitoring || "",
      performance: action.performance || "",
      effort: action.effort || "medium",
      timeline: action.timeline || 1,
      date: (action.date || fallbackDate).split("T")[0],
      reduction:
        typeof action.reduction === "number"
          ? action.reduction
          : (action.calculatedReduction ?? 0),
      calculatedReduction: action.calculatedReduction ?? action.reduction,
      selected: action.selected ?? action.status === "Selected",
    }),
    [],
  );

  // Memoize converted actions to prevent unnecessary re-renders
  const convertedCompletedActions = useMemo(() => {
    if (!projectCompletedActions || projectCompletedActions.length === 0) {
      return [];
    }
    return projectCompletedActions.map((action) =>
      mapProjectActionToCustom(
        action,
        action.dateCompleted || action.dateAdded,
      ),
    );
  }, [projectCompletedActions, mapProjectActionToCustom]);

  const convertedAvailableActions = useMemo(() => {
    if (!projectAvailableActions || projectAvailableActions.length === 0) {
      return [];
    }
    return projectAvailableActions.map((action) =>
      mapProjectActionToCustom(action, action.dateAdded),
    );
  }, [projectAvailableActions, mapProjectActionToCustom]);

  // Update local state when converted actions change
  useEffect(() => {
    setCompletedActions(convertedCompletedActions);
  }, [convertedCompletedActions]);

  useEffect(() => {
    setAvailableActions(convertedAvailableActions);
  }, [convertedAvailableActions]);

  // Redirect to home & open auth modal only if user context is fully loaded and no user is present
  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/?auth=login");
    }
  }, [user, isLoaded, router]);

  const handleEditClick = (
    action: CustomAction,
    type: "completed" | "available",
  ) => {
    setEditingAction(action);
    setEditingType(type);
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

  const handleSubmitCreate = async (newAction: CustomAction) => {
    try {
      // Submit custom action to the project identified by passcode
      const response = await fetch(`/api/project/${passcode}/actions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customActionData: {
            title: newAction.title,
            description: newAction.description,
            category: newAction.category,
            subcategory: newAction.subcategory || "",
            reduction: newAction.reduction,
            effort: newAction.effort,
            manager: newAction.manager,
            assignedTo: newAction.assignedTo || "",
            nature: newAction.nature,
            objectives: newAction.objectives,
            keyContacts: newAction.keyContacts,
            steps: newAction.steps,
            calendar: newAction.calendar,
            indicators: newAction.indicators,
            monitoring: newAction.monitoring,
            performance: newAction.performance,
            timeline: newAction.timeline || 1,
            type: newAction.type || "Direct",
          },
          studentName: user?.username || "",
          studentId: user?.studentId || user?.uid || "",
          calculatedReduction: newAction.reduction,
          actionType: newAction.type || "Direct",
          categoryData: {
            categoryId: newAction.category,
            categoryName: newAction.category,
          },
          // If a teacher is using this monitoring view, auto‑approve
          isTeacherAction: user?.role === "teacher" || user?.role === "admin",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error ||
            tAction("failedToCreateAction").replace(
              "{error}",
              errorData.error || "",
            ),
        );
      }

      // Consume response body to allow proper connection cleanup
      await response.json();

      // After successful creation, refresh actions from backend
      await refetch();

      setShowCreateModal(false);
    } catch (error) {
      // Let ActionModal handle displaying the error to the user
      throw error;
    }
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
        throw new Error(
          errorData.error ||
            tAction("failedToUpdateAction").replace(
              "{error}",
              errorData.error || "",
            ),
        );
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
        tAction("failedToUpdateAction", {
          error: error instanceof Error ? error.message : tAction("unknown"),
        }),
      );
    }
  };

  const handleApproveChanges = async (action: CustomAction) => {
    try {
      console.log("Approving changes for action:", action.id);

      if (!action.pendingChanges) {
        throw new Error(tAction("noPendingChangesToApprove"));
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
        throw new Error(
          errorData.error ||
            tAction("failedToApproveChanges").replace(
              "{error}",
              errorData.error || "",
            ),
        );
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
        tAction("failedToApproveChanges", {
          error: error instanceof Error ? error.message : tAction("unknown"),
        }),
      );
    }
  };

  const handleRejectChanges = async (action: CustomAction) => {
    try {
      console.log("Rejecting changes for action:", action.id);

      if (!action.pendingChanges) {
        throw new Error(tAction("noPendingChangesToReject"));
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
        throw new Error(
          errorData.error ||
            tAction("failedToRejectChanges").replace(
              "{error}",
              errorData.error || "",
            ),
        );
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
        tAction("failedToRejectChanges", {
          error: error instanceof Error ? error.message : tAction("unknown"),
        }),
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
        throw new Error(
          errorData.error ||
            tAction("failedToCompleteAction").replace(
              "{error}",
              errorData.error || "",
            ),
        );
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
        tAction("failedToCompleteAction", {
          error: error instanceof Error ? error.message : tAction("unknown"),
        }),
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
        throw new Error(
          errorData.error ||
            tAction("failedToDeleteAction").replace(
              "{error}",
              errorData.error || "",
            ),
        );
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
        tAction("failedToDeleteAction", {
          error: error instanceof Error ? error.message : tAction("unknown"),
        }),
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
          <h1 className="text-3xl font-bold">
            {tMonitoring("projectMonitoringDashboard")}
          </h1>
          <p className="mt-1 text-gray-500">
            {tMonitoring("trackProgressAndPlan")}
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
            totalEmissions={currentEmissions || 1000}
            schoolTotalEmissions={schoolTotalEmissions}
            currentEmissions={currentEmissions}
            totalReduction={totalReduction}
            availableActions={projectAvailableActions}
            completedActions={projectCompletedActions}
            subcategoryEmissionsKg={subcategoryEmissionsKg}
          />
        )}

        {loading ? (
          <LoadingState
            message={tMonitoring("loadingProjectData")}
            spinnerSize="large"
          />
        ) : error ? (
          <div className="mb-8 rounded-lg bg-red-50 p-4">
            <p className="text-red-700">
              {tMonitoring("errorColon")} {error}
            </p>
            <button
              onClick={refetch}
              className="mt-2 rounded bg-red-100 px-3 py-1 text-red-700 hover:bg-red-200"
            >
              {tMonitoring("retry")}
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
            { value: "easy", label: tAction("Easy") },
            { value: "medium", label: tAction("Medium") },
            { value: "hard", label: tAction("Hard") },
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
            { value: "easy", label: tAction("Easy") },
            { value: "medium", label: tAction("Medium") },
            { value: "hard", label: tAction("Hard") },
          ]}
          initialAction={undefined}
        />
      )}
    </div>
  );
};

export default ProjectMonitoring;
