"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter, Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import CustomActionFormModal from "@/components/ActionModal";
import SchoolGoalCard from "@/components/SchoolGoalCard";

import CompletedActions from "@/components/(action)/CompletedActions";
import { Action } from "@/types/Action";
import CurrentActions from "@/components/(action)/CurrentActions";
import { useUser } from "@/context/UserContext";
import { useProjectData } from "@/hooks/useProjectData";
import { useEmissionCategories } from "@/hooks/useEmissionCategories";
import Project from "@/types/ProjectType";

// Custom action interface that extends Action
interface CustomAction extends Action {
  selected: boolean;
  calculatedReduction?: number; // Add calculated reduction field
}

const Monitoring: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const t = useTranslations("TeacherDashboard");

  // Use emission categories hook to fetch from database
  const { categories: emissionCategories } = useEmissionCategories();

  // State for teacher's projects (when user is a teacher)
  const [projects, setProjects] = useState<Project[]>([]);
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherError, setTeacherError] = useState<string | null>(null);

  // Use project data hook to get real project data (for students)
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

  // Student-specific state (moved to top to avoid conditional hooks)
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

  // Memoize converted actions to prevent unnecessary re-renders (for students)
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

  // Update local state when converted actions change (for students)
  useEffect(() => {
    setCompletedActions(convertedCompletedActions);
  }, [convertedCompletedActions]);

  useEffect(() => {
    setAvailableActions(convertedAvailableActions);
  }, [convertedAvailableActions]);

  // Redirect to login if no user - only after user context is loaded and we're not loading project data
  useEffect(() => {
    if (user !== undefined && !user && !loading) {
      router.push("/");
    }
  }, [user, router, loading]);

  // Fetch teacher's projects
  const fetchProjects = useCallback(async () => {
    if (!user || user.passcode) return; // Only for teachers (no passcode)

    try {
      setTeacherLoading(true);
      const response = await fetch(`/api/project?teacherId=${user.username}`);
      const data = await response.json();

      if (response.ok) {
        setProjects(data.projects || []);
      } else {
        setTeacherError(data.error || "Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setTeacherError("Failed to fetch projects");
    } finally {
      setTeacherLoading(false);
    }
  }, [user]);

  // Fetch projects when component mounts (for teachers)
  useEffect(() => {
    if (user && !user.passcode) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  // If user is a teacher (no passcode), show project selection
  if (user && !user.passcode) {
    if (teacherLoading) {
      return (
        <div className="bg-gray-50">
          <div className="mx-auto px-6 py-8 container">
            <div className="text-center">
              <div className="mx-auto border-gray-900 border-b-2 rounded-full w-32 h-32 animate-spin"></div>
              <p className="mt-4 text-gray-600">Loading projects...</p>
            </div>
          </div>
        </div>
      );
    }

    if (teacherError) {
      return (
        <div className="bg-gray-50">
          <div className="mx-auto px-6 py-8 container">
            <div className="text-center">
              <h1 className="mb-4 font-bold text-red-600 text-2xl">Error</h1>
              <p className="mb-4 text-gray-600">{teacherError}</p>
              <button onClick={fetchProjects} className="btn btn-primary">
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto px-6 py-8 container"
        >
          <div className="mb-8">
            <h1 className="font-bold text-3xl tracking-tight">
              Project Monitoring
            </h1>
            <p className="mt-1 text-muted-foreground">
              Select a project to monitor its progress and actions
            </p>
          </div>

          <div className="gap-6 grid md:grid-cols-2 lg:grid-cols-3 mb-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="hover:shadow-md transition-shadow card"
              >
                <div>
                  <div className="flex justify-between items-start mb-5 font-bold text-xl">
                    <h3>{project.name}</h3>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        project.status === "active"
                          ? "bg-green-100 text-green-800"
                          : project.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {t(`status.${project.status}`)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="gap-4 grid grid-cols-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t("startDate")}</p>
                      <p className="font-medium">
                        {typeof project.startDate === "number"
                          ? project.startDate
                          : new Date(project.startDate).getFullYear()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sub Goal</p>
                      <p className="font-medium">
                        {typeof project.subGoalDeadline === "number"
                          ? project.subGoalDeadline
                          : new Date(project.subGoalDeadline).getFullYear()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t("reduction")}</p>
                      <p className="font-medium text-green-600">
                        {project.subGoalReductionAmount}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  {project.passcode && (
                    <Link
                      href={`/monitoring/${project.passcode}`}
                      className="w-full btn btn-primary"
                    >
                      Monitor Project
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="py-12 text-center">
              <h2 className="mb-2 font-semibold text-xl">No Projects Found</h2>
              <p className="mb-4 text-gray-600">
                You haven&apos;t created any projects yet.
              </p>
              <Link href="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Student-specific handlers (only used for students, but defined for all to avoid conditional hooks)

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
      if (!user?.passcode) {
        throw new Error("No project passcode available");
      }

      // Call the API to update the action in the database
      const response = await fetch(`/api/project/${user.passcode}/actions`, {
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

  // Handle approving student changes
  const handleApproveChanges = async (action: CustomAction) => {
    try {
      if (!action.pendingChanges) {
        throw new Error("No pending changes to approve");
      }

      if (!user?.passcode) {
        throw new Error("No project passcode available");
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
      const response = await fetch(`/api/project/${user.passcode}/actions`, {
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

  // Handle rejecting student changes
  const handleRejectChanges = async (action: CustomAction) => {
    try {
      if (!action.pendingChanges) {
        throw new Error("No pending changes to reject");
      }

      if (!user?.passcode) {
        throw new Error("No project passcode available");
      }

      // Remove pending changes from the action
      const rejectedAction = {
        ...action,
        pendingChanges: undefined, // Clear pending changes
        needsApproval: false, // Mark as not needing approval
      };

      // Call the API to update the action in the database
      const response = await fetch(`/api/project/${user.passcode}/actions`, {
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

  // Handle completing an action
  const handleCompleteAction = (action: CustomAction) => {
    const updatedAction = {
      ...action,
      status: "Completed" as const,
    };

    handleSubmitEdit(updatedAction);
  };

  const handleDeleteAction = async (action: CustomAction) => {
    try {
      console.log("Deleting action:", action.id);

      if (!user?.passcode) {
        throw new Error("No project passcode available");
      }

      // Call the API to delete from database
      const response = await fetch(
        `/api/project/${user.passcode}/actions?actionId=${action.id}`,
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
    <div className="bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto px-6 py-8 container"
      >
        <div className="mb-8">
          <h1 className="font-bold text-3xl">Monitoring Dashboard</h1>
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
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="mx-auto mb-4 border-4 border-gray-300 border-t-primary rounded-full w-8 h-8 animate-spin"></div>
              <p className="text-gray-500">Loading project data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 mb-8 p-4 rounded-lg">
            <p className="text-red-700">Error: {error}</p>
            <button
              onClick={refetch}
              className="bg-red-100 hover:bg-red-200 mt-2 px-3 py-1 rounded text-red-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="gap-6 grid md:grid-cols-2 mb-6">
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

export default Monitoring;
