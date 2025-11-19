"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

import Loading from "@/components/(dashboard)/ProjectDetails/Loading";
import NotFound from "@/components/(dashboard)/ProjectDetails/NotFound";
import SchoolGoalCard from "@/components/SchoolGoalCard";
import CurrentActions from "@/components/(action)/CurrentActions";
import CompletedActions from "@/components/(action)/CompletedActions";
import CustomActionFormModal from "@/components/ActionModal";

import { motion } from "framer-motion";
import { useProjectData } from "@/hooks/useProjectData";
import { useEmissionCategories } from "@/hooks/useEmissionCategories";
import { Edit, Share2, ArrowLeft } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Action } from "@/types/Action";

// Action interface for type safety - matches the data from the hook
interface ActionData extends Action {
  calculatedReduction: number;
  status: "Available" | "Selected" | "In Progress" | "Completed";
  studentName: string;
  dateAdded: string;
  dateCompleted?: string;
  selected?: boolean;
}

// Custom action interface that extends Action and adds selected property
interface CustomAction extends Action {
  selected: boolean;
  status?: "Available" | "Selected" | "In Progress" | "Completed";
}

const ProjectDetails = () => {
  const { slug: projectId } = useParams<{ slug: string }>();
  const { user } = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("ProjectDetails");

  // Use emission categories hook to fetch from database
  const { categories: emissionCategories } = useEmissionCategories();

  // Use the project data hook to get comprehensive data
  const {
    projectData: project,
    schoolData: school,
    availableActions,
    completedActions,
    totalReduction,
    currentEmissions,
    loading,
    error,
    refetch,
  } = useProjectData(projectId);

  // Edit modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    subGoalReductionAmount: 0,
    subGoalDeadline: "",
    status: "active" as "active" | "completed" | "pending",
  });

  // Action modal states
  const [editingAction, setEditingAction] = useState<CustomAction | null>(null);
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

  // Share and copy states
  const [shareButtonText, setShareButtonText] = useState("");
  const [passcodeButtonText, setPasscodeButtonText] = useState("");

  // Initialize button texts and edit form when project data loads
  useEffect(() => {
    setShareButtonText(t("share"));
    setPasscodeButtonText(t("copyPasscode"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  useEffect(() => {
    if (project) {
      setEditForm({
        name: project.name || "",
        subGoalReductionAmount: project.subGoalReductionAmount || 0,
        subGoalDeadline:
          typeof project.subGoalDeadline === "number"
            ? project.subGoalDeadline.toString()
            : project.subGoalDeadline || "",
        status: project.status || "active",
      });
    }
  }, [project]);

  // Handle project edit save
  const handleSaveEdit = async () => {
    if (!project?.id) return;

    try {
      const response = await fetch(`/api/project/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (response.ok) {
        setIsEditModalOpen(false);
        refetch(); // Refresh the data
        alert(t("projectUpdatedSuccessfully"));
      } else {
        alert(t("errorUpdatingProject", { error: data.error }));
      }
    } catch (error) {
      console.error("Error updating project:", error);
      alert(t("errorUpdatingProjectGeneric"));
    }
  };

  // Handle action editing
  const handleEditClick = (action: CustomAction) => {
    setEditingAction(action);
  };

  // Handle approving student changes
  const handleApproveChanges = async (action: CustomAction) => {
    try {
      if (!action.pendingChanges) {
        throw new Error(t("noPendingChangesToApprove"));
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
      const response = await fetch(`/api/project/${projectId}/actions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(approvedAction),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("failedToApproveChanges"));
      }

      // Update the editingAction state to reflect the approved changes and refresh data
      setEditingAction(approvedAction);
      refetch();
    } catch (error) {
      console.error("Error approving changes:", error);
      alert(
        t("failedToApproveChangesWithError", {
          error: error instanceof Error ? error.message : t("unknownError"),
        }),
      );
    }
  };

  // Handle rejecting student changes
  const handleRejectChanges = async (action: CustomAction) => {
    try {
      if (!action.pendingChanges) {
        throw new Error(t("noPendingChangesToReject"));
      }

      // Remove pending changes from the action
      const rejectedAction = {
        ...action,
        pendingChanges: undefined, // Clear pending changes
        needsApproval: false, // Mark as not needing approval
      };

      // Call the API to update the action in the database
      const response = await fetch(`/api/project/${projectId}/actions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rejectedAction),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("failedToRejectChanges"));
      }

      // Update the editingAction state to reflect the rejected changes and refresh data
      setEditingAction(rejectedAction);
      refetch();
    } catch (error) {
      console.error("Error rejecting changes:", error);
      alert(
        t("failedToRejectChangesWithError", {
          error: error instanceof Error ? error.message : t("unknownError"),
        }),
      );
    }
  };

  // Handle completing an action
  const handleCompleteAction = () => {
    setEditingAction(null);
    refetch();
  };

  const handleDeleteAction = async (action: CustomAction) => {
    try {
      console.log("Deleting action:", action.id);

      // Call the API to delete from database
      const response = await fetch(
        `/api/project/${projectId}/actions?actionId=${action.id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("failedToDeleteAction"));
      }

      // Close the modal and refresh data
      setEditingAction(null);
      refetch();
    } catch (error) {
      console.error("Error deleting action:", error);
      alert(
        t("failedToDeleteActionWithError", {
          error: error instanceof Error ? error.message : t("unknownError"),
        }),
      );
    }
  };

  const handleAddAction = () => {
    setShowCreateModal(true);
    setEditingAction(null);
    setTimeout(() => {
      const modal = document.getElementById(
        "custom_action",
      ) as HTMLDialogElement;
      if (modal) modal.showModal();
    }, 0);
  };

  const handleSubmitCreate = useCallback(
    async (newAction: CustomAction) => {
      try {
        // Submit action directly without approval since teacher is creating it
        const response = await fetch(`/api/project/${projectId}/actions`, {
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
        studentName: user?.username || t("teacher"),
        studentId: user?.uid || "",
        calculatedReduction: newAction.reduction,
        actionType: newAction.type || "Direct",
        categoryData: {
          categoryId: newAction.category,
          categoryName: newAction.category,
        },
          isTeacherAction: true, // Teacher action doesn't need approval
        }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || t("failedToCreateAction"));
        }

        await response.json();

        setShowCreateModal(false);
        await refetch(); // Refresh the project data
      } catch (error) {
        // Let ActionModal show a user-friendly alert
        throw error;
      }
    },
    [projectId, t, refetch],
  );

  // Handle share URL copy
  const handleShareClick = () => {
    const fullUrl = `${window.location.origin}/${locale}${pathname}`;
    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        setShareButtonText(t("linkCopied"));
        setTimeout(() => {
          setShareButtonText(t("share"));
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy URL: ", err);
        alert(t("failedToCopyLink"));
      });
  };

  // Handle passcode copy
  const handlePasscodeClick = () => {
    if (project?.passcode) {
      navigator.clipboard
        .writeText(project.passcode)
        .then(() => {
          setPasscodeButtonText(t("copied"));
          setTimeout(() => {
            setPasscodeButtonText(t("copyPasscode"));
          }, 2000);
        })
        .catch((err) => {
          console.error("Failed to copy passcode: ", err);
          alert(t("failedToCopyPasscode"));
        });
    }
  };

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  const normalizeAction = (action: ActionData): CustomAction => ({
    id: action.id,
    category: action.category,
    subcategory: action.subcategory || "",
    title: action.title,
    description: action.description,
    reduction: action.reduction,
    effort: action.effort || "medium",
    manager: action.manager || action.studentName,
    assignedTo: action.assignedTo || "",
    nature: action.nature || action.category,
    objectives: action.objectives || action.description,
    keyContacts: action.keyContacts || "",
    steps: action.steps || "",
    calendar: action.calendar || action.dateAdded,
    indicators: action.indicators || "",
    monitoring: action.monitoring || "",
    performance: action.performance || "",
    date:
      (action.date || action.dateAdded)?.includes("T")
        ? (action.date || action.dateAdded).split("T")[0]
        : action.date || action.dateAdded,
    timeline: action.timeline || 1,
    type: action.type,
    pendingChanges: action.pendingChanges,
    needsApproval: action.needsApproval,
    status: action.status,
    selected: action.selected ?? action.status === "Selected",
  });

  // Convert actions to the format expected by the action components
  const convertedAvailableActions: CustomAction[] =
    availableActions.map(normalizeAction);

  const convertedCompletedActions: CustomAction[] =
    completedActions.map(normalizeAction);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-2 font-bold text-red-600 text-2xl">{t("error")}</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!project) return <NotFound projectId={String(projectId)} />;

  return (
    <div className="bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto px-6 py-8 container"
      >
        {/* Simple Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("back")}</span>
          </button>
          <h1 className="font-bold text-3xl tracking-tight">{project?.name}</h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Project Overview Card */}
        <div className="mb-8">
          <div className="relative card">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="mb-6 font-bold text-lg lg:text-2xl">
                  {t("overview.title")}
                </h3>
                <div className="space-y-4">
                  <div className="flex max-lg:flex-col gap-x-2.5">
                    <h3 className="font-medium text-sm lg:text-base">
                      {t("overview.projectName")}
                    </h3>
                    <span>{project?.name}</span>
                  </div>
                  <div className="flex max-lg:flex-col gap-x-2.5">
                    <h3 className="font-medium text-sm lg:text-base">
                      {t("overview.currentStatus")}
                    </h3>
                    <span className={`font-medium`}>
                      {t(`status.${project?.status || "active"}`)}
                    </span>
                  </div>
                  <div className="flex max-lg:flex-col gap-x-2.5">
                    <h3 className="font-medium text-sm lg:text-base">
                      {t("overview.subGoalTarget")}
                    </h3>
                    <span>
                      {project?.subGoalReductionAmount}% {t("overview.by")}{" "}
                      {project?.subGoalDeadline}
                    </span>
                  </div>
                  {school && (
                    <div className="flex max-lg:flex-col gap-x-2.5">
                      <h3 className="font-medium text-sm lg:text-base">
                        {t("overview.schoolGoal")}
                      </h3>
                      <span>
                        {school.goal}% {t("overview.by")} {school.deadlineYear}
                      </span>
                    </div>
                  )}
                </div>
                {/* Passcode and Buttons in horizontal flex container */}
                <div className="flex flex-wrap items-center gap-4 mt-5">
                  {/* Passcode Display */}
                  {project?.passcode && (
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={handlePasscodeClick}
                        className={`cursor-pointer rounded-lg border-2 border-dashed px-3 py-1 text-xl font-bold transition-colors ${
                          passcodeButtonText === t("copied")
                            ? "border-green-300 bg-green-50 text-green-600 hover:border-green-400 hover:bg-green-100 hover:text-green-800"
                            : "text-primary border-blue-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 hover:text-blue-800"
                        }`}
                        title={t("overview.clickToCopyPasscode")}
                      >
                        {passcodeButtonText === t("copied")
                          ? t("copied")
                          : project.passcode}
                      </button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Share Button */}
                    <button
                      onClick={handleShareClick}
                      className="flex items-center gap-2 btn btn-secondary"
                    >
                      <Share2 className="w-4 h-4" />
                      {shareButtonText}
                    </button>

                    {/* Admin-only Edit Button */}
                    {isAdmin && (
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 btn btn-primary"
                      >
                        <Edit className="w-4 h-4" />
                        {t("overview.editProject")}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Total Reduction Display and Actions */}
              <div className="flex flex-col justify-start items-end gap-5">
                {/* Total Reduction at the top */}
                <div className="text-center">
                  <div className="font-bold text-purple-600 text-2xl lg:text-5xl">
                    {totalReduction.toFixed(1)}%
                  </div>
                  <div className="font-medium text-purple-800 text-xs lg:text-lg">
                    {t("overview.totalReduction")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current and Completed Actions - same as monitoring page */}
        <div className="gap-6 grid md:grid-cols-2 mb-8">
          <CurrentActions
            currentActions={convertedAvailableActions}
            onEdit={(action) => handleEditClick(action)}
            onAddAction={handleAddAction}
          />
          <CompletedActions
            completedActions={convertedCompletedActions}
            onEdit={(action) => handleEditClick(action)}
          />
        </div>

        {/* Goal Graph with project actions data */}
        <SchoolGoalCard
          schoolGoal={school?.goal || 40}
          subGoal={Number(project?.subGoalReductionAmount) || 25}
          subGoalYear={
            typeof project?.subGoalDeadline === "number"
              ? project.subGoalDeadline.toString()
              : typeof project?.subGoalDeadline === "string"
                ? new Date(project.subGoalDeadline).getFullYear().toString()
                : "2028"
          }
          finalGoalYear={school?.deadlineYear || "2030"}
          baseReductionPerYear={5}
          startYear={
            project?.startDate
              ? String(
                  typeof project.startDate === "number"
                    ? project.startDate
                    : new Date(project.startDate as string).getFullYear(),
                )
              : "2023"
          }
          totalEmissions={currentEmissions || 1000} // Use current emissions as total
          availableActions={availableActions}
          completedActions={completedActions}
        />
      </motion.div>

      {/* Action Edit Modal */}
      {editingAction && (
        <CustomActionFormModal
          mode="edit"
          initialAction={editingAction}
          onSubmit={async (updatedAction: CustomAction) => {
            try {
              // Call the API to update the action in the database
              const response = await fetch(
                `/api/project/${projectId}/actions`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(updatedAction),
                },
              );

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || t("failedToUpdateAction"));
              }

              // Close modal and refresh data
              setEditingAction(null);
              refetch();
            } catch (error) {
              console.error("Error updating action:", error);
              alert(
                t("failedToUpdateActionWithError", {
                  error:
                    error instanceof Error ? error.message : t("unknownError"),
                }),
              );
            }
          }}
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
        />
      )}

      {/* Add Action Modal */}
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
        />
      )}

      {/* Project Edit Modal */}
      {isEditModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="mb-4 font-bold text-lg">{t("editModal.title")}</h3>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit();
              }}
            >
              <div>
                <label htmlFor="projectName" className="block mb-1 font-medium">
                  {t("editModal.projectName")}
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full input-bordered input"
                  placeholder={t("editModal.projectNamePlaceholder")}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="subGoalReduction"
                  className="block mb-1 font-medium"
                >
                  {t("editModal.subGoalReduction")}
                </label>
                <input
                  id="subGoalReduction"
                  type="number"
                  value={editForm.subGoalReductionAmount}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      subGoalReductionAmount: Number(e.target.value),
                    }))
                  }
                  className="w-full input-bordered input"
                  min="0"
                  max="100"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="subGoalDeadline"
                  className="block mb-1 font-medium"
                >
                  {t("editModal.subGoalDeadline")}
                </label>
                <input
                  id="subGoalDeadline"
                  type="number"
                  value={editForm.subGoalDeadline}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      subGoalDeadline: e.target.value,
                    }))
                  }
                  className="w-full input-bordered input"
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 50}
                  required
                />
              </div>

              <div>
                <label htmlFor="status" className="block mb-1 font-medium">
                  {t("editModal.status")}
                </label>
                <select
                  id="status"
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      status: e.target.value as
                        | "active"
                        | "completed"
                        | "pending",
                    }))
                  }
                  className="w-full select-bordered select"
                >
                  <option value="active">{t("status.active")}</option>
                  <option value="pending">{t("status.pending")}</option>
                  <option value="completed">{t("status.completed")}</option>
                </select>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  {t("editModal.cancel")}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t("editModal.saveChanges")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
