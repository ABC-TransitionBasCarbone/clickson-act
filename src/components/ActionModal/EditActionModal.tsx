"use client";

import Modal from "@/components/Modal";
import { Action } from "@/types/Action";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";

interface CustomAction extends Action {
  selected: boolean;
  status?: "Completed" | "Selected" | "Available";
  assignedTo?: string;
  timeline?: number;
  subcategory?: string;
}

interface EditActionModalProps {
  action: Action;
  onSubmit: (action: CustomAction) => void;
  categories: { value: string; label: string }[];
  effortCategories: { value: string; label: string }[];
  subcategoryOptions?: { value: string; label: string; categoryId?: string }[];
  onClose: () => void;
  projectId?: string;
}

const EditActionModal: React.FC<EditActionModalProps> = ({
  action,
  onSubmit,
  categories,
  effortCategories,
  subcategoryOptions = [],
  onClose,
  projectId,
}) => {
  const t = useTranslations("Action");
  const { user } = useUser();
  const { showToast } = useToast();

  // Check if user is a teacher (has role "teacher" or "admin")
  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  // Helper function to map action category to dropdown value
  const mapActionCategoryToDropdown = (actionCategory: string): string => {
    // If the action category matches exactly, use it
    if (categories.find((cat) => cat.value === actionCategory)) {
      return actionCategory;
    }

    // Try case-insensitive match
    const caseInsensitiveMatch = categories.find(
      (cat) => cat.value.toLowerCase() === actionCategory.toLowerCase(),
    );
    if (caseInsensitiveMatch) {
      return caseInsensitiveMatch.value;
    }

    // Try to map common variations
    const categoryMap: Record<string, string> = {
      Energy: "energy",
      Waste: "waste",
      Transport: "transport",
      Nature: "nature",
      ENERGY: "energy",
      WASTE: "waste",
      TRANSPORT: "transport",
      NATURE: "nature",
    };

    return categoryMap[actionCategory] || actionCategory;
  };

  // Update the editedAction to use the mapped category
  const mappedCategory = mapActionCategoryToDropdown(action.category);

  // Debug: Log subcategory information
  console.log("EditActionModal - Action subcategory:", action.subcategory);
  console.log(
    "EditActionModal - Available subcategoryOptions:",
    subcategoryOptions,
  );
  console.log("EditActionModal - Mapped category:", mappedCategory);

  // Find the best matching subcategory for the action
  const findMatchingSubcategory = (
    actionSubcategory: string | undefined,
  ): string => {
    if (!actionSubcategory) return "";

    // First, try exact match
    const exactMatch = subcategoryOptions.find(
      (sub) => sub.value === actionSubcategory,
    );
    if (exactMatch) return exactMatch.value;

    // Then try case-insensitive match
    const caseInsensitiveMatch = subcategoryOptions.find(
      (sub) => sub.value.toLowerCase() === actionSubcategory.toLowerCase(),
    );
    if (caseInsensitiveMatch) return caseInsensitiveMatch.value;

    // Finally, try partial match
    const partialMatch = subcategoryOptions.find(
      (sub) =>
        sub.value.includes(actionSubcategory) ||
        actionSubcategory.includes(sub.value),
    );
    if (partialMatch) return partialMatch.value;

    return "";
  };

  const initialSubcategory = findMatchingSubcategory(action.subcategory);

  const [editedAction, setEditedAction] = useState<CustomAction>({
    ...action,
    selected: false,
    status: "Available",
    assignedTo: "",
    timeline: action.timeline || 1,
    subcategory: initialSubcategory, // Use the matched subcategory
    category: mappedCategory, // Use the mapped category
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (
      !editedAction.category ||
      !editedAction.title ||
      !editedAction.reduction
    ) {
      showToast(
        "error",
        "Validation Error",
        "Please fill in all required fields.",
        3000,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Create custom action data
      const customActionData = {
        title: editedAction.title,
        description: editedAction.description,
        category: editedAction.category,
        subcategory: editedAction.subcategory || "",
        reduction: editedAction.reduction,
        effort: editedAction.effort,
        manager: editedAction.manager,
        nature: editedAction.nature,
        objectives: editedAction.objectives,
        keyContacts: editedAction.keyContacts,
        steps: editedAction.steps,
        calendar: editedAction.calendar,
        indicators: editedAction.indicators,
        monitoring: editedAction.monitoring,
        performance: editedAction.performance,
        timeline: editedAction.timeline || 1,
        type: editedAction.type || "Direct",
      };

      if (projectId) {
        // Submit as custom action to project
        const response = await fetch(`/api/project/${projectId}/actions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customActionData,
            studentName: user?.username || "",
            studentId: user?.studentId || "",
            calculatedReduction: editedAction.reduction,
            actionType: editedAction.type || "Direct",
            categoryData: {
              categoryId: editedAction.category,
              categoryName: editedAction.category,
            },
            isTeacherAction: isTeacher,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create custom action");
        }

        const result = await response.json();
        console.log("Successfully created custom action:", result);

        showToast(
          "success",
          "Action Submitted!",
          `"${editedAction.title}" has been submitted for teacher approval.`,
          4000,
        );
      } else {
        // For school-level custom actions (if needed)
        // This would require a different API endpoint
        console.log("School-level custom action creation not implemented yet");
      }

      onSubmit(editedAction);
      onClose();
    } catch (error) {
      console.error("Error creating custom action:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showToast(
        "error",
        "Failed to Create Custom Action",
        `Could not create custom action: ${errorMessage}`,
        6000,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  // Different validation for teachers vs students
  const isInvalid = isTeacher
    ? // Teachers: validate all required fields
      editedAction.category === "" ||
      editedAction.subcategory === "" ||
      editedAction.title === "" ||
      editedAction.description === "" ||
      editedAction.reduction === 0 ||
      editedAction.effort === ""
    : // Students: validate basic required fields
      editedAction.category === "" ||
      editedAction.title === "" ||
      editedAction.description === "" ||
      editedAction.reduction === 0;

  return (
    <Modal id="edit_action_modal" title="Modify Action">
      <div className="sm:max-w-md">
        <div className="gap-4 grid grid-cols-2">
          {/* Status */}
          <div className="gap-2 grid">
            <label htmlFor="status">{t("status")}</label>
            <select
              id="status"
              value={editedAction.status}
              onChange={(e) =>
                setEditedAction({
                  ...editedAction,
                  status: e.target.value as
                    | "Completed"
                    | "Selected"
                    | "Available",
                })
              }
              className="w-full input"
            >
              <option value="Available">{t("available")}</option>
              <option value="Selected">{t("selected")}</option>
              <option value="Completed">{t("completed")}</option>
            </select>
          </div>

          {/* Assigned To */}
          <div className="gap-2 grid">
            <label htmlFor="assignedTo">{t("assignedTo")}</label>
            <input
              id="assignedTo"
              value={editedAction.assignedTo || ""}
              onChange={(e) =>
                setEditedAction({ ...editedAction, assignedTo: e.target.value })
              }
              className="w-full input"
            />
          </div>

          {/* Category */}
          <div className="gap-2 grid">
            <label htmlFor="category">{t("category")}</label>
            <select
              id="category"
              value={editedAction.category}
              onChange={(e) => {
                const newCategory = e.target.value;
                // Find available subcategories for the new category
                const availableSubcategories = subcategoryOptions.filter(
                  (sub) => sub.categoryId === newCategory,
                );

                setEditedAction({
                  ...editedAction,
                  category: newCategory,
                  // Auto-select subcategory if there's only one option
                  subcategory:
                    availableSubcategories.length === 1
                      ? availableSubcategories[0].value
                      : "",
                });
              }}
              className="w-full input"
            >
              <option value="">{t("selectCategory")}</option>
              {categories.map((cat) => (
                <option key={cat.label} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div className="gap-2 grid">
            <label htmlFor="subcategory">{t("subcategory")}</label>
            <select
              id="subcategory"
              value={editedAction.subcategory || ""}
              onChange={(e) =>
                setEditedAction({
                  ...editedAction,
                  subcategory: e.target.value,
                })
              }
              className="w-full input"
              disabled={!editedAction.category}
            >
              <option value="">{t("selectCategory")}</option>
              {subcategoryOptions
                .filter(
                  (sub) =>
                    !editedAction.category ||
                    sub.categoryId === editedAction.category,
                )
                .map((sub) => (
                  <option key={sub.value} value={sub.value}>
                    {sub.label}
                  </option>
                ))}
            </select>
          </div>

          {/* Timeline */}
          <div className="gap-2 grid">
            <label htmlFor="timeline">{t("timeline")}</label>
            <input
              id="timeline"
              type="number"
              value={editedAction.timeline || 1}
              onChange={(e) =>
                setEditedAction({
                  ...editedAction,
                  timeline: Number(e.target.value),
                })
              }
              min={1}
              max={50}
              placeholder="Number of years"
              className="w-full input"
            />
          </div>

          {/* Title */}
          <div className="gap-2 grid">
            <label htmlFor="title">{t("actionTitle")}</label>
            <input
              id="title"
              value={editedAction.title}
              onChange={(e) =>
                setEditedAction({ ...editedAction, title: e.target.value })
              }
              className="w-full input"
            />
          </div>

          {/* Description */}
          <div className="gap-2 grid">
            <label htmlFor="description">{t("description")}</label>
            <input
              id="description"
              value={editedAction.description}
              onChange={(e) =>
                setEditedAction({
                  ...editedAction,
                  description: e.target.value,
                })
              }
              className="w-full input"
            />
          </div>

          {/* Effort */}
          <div className="gap-2 grid">
            <label htmlFor="effort">{t("effort")}</label>
            <select
              id="effort"
              value={editedAction.effort}
              onChange={(e) =>
                setEditedAction({ ...editedAction, effort: e.target.value })
              }
              className="w-full input"
            >
              <option value="">{t("selectEffort")}</option>
              {effortCategories.map((effort) => (
                <option key={effort.value} value={effort.value}>
                  {t(effort.label)}
                </option>
              ))}
            </select>
          </div>

          {/* Reduction */}
          <div className="gap-2 grid">
            <label htmlFor="reduction">{t("estimatedReduction")}</label>
            <input
              id="reduction"
              type="number"
              value={editedAction.reduction}
              onChange={(e) =>
                setEditedAction({
                  ...editedAction,
                  reduction: Number(e.target.value),
                })
              }
              min={1}
              max={100}
              className="w-full input"
            />
          </div>

          {/* Manager */}
          <div className="gap-2 grid">
            <label htmlFor="manager">{t("manager")}</label>
            <input
              id="manager"
              value={editedAction.manager}
              onChange={(e) =>
                setEditedAction({ ...editedAction, manager: e.target.value })
              }
              className="w-full input"
            />
          </div>

          {/* Nature */}
          <div className="gap-2 grid">
            <label htmlFor="nature">{t("nature")}</label>
            <input
              id="nature"
              value={editedAction.nature}
              onChange={(e) =>
                setEditedAction({ ...editedAction, nature: e.target.value })
              }
              className="w-full input"
            />
          </div>

          {/* Objectives */}
          <div className="gap-2 grid">
            <label htmlFor="objectives">{t("objectives")}</label>
            <textarea
              rows={3}
              id="objectives"
              value={editedAction.objectives}
              onChange={(e) =>
                setEditedAction({ ...editedAction, objectives: e.target.value })
              }
              className="w-full textarea"
            />
          </div>

          {/* Key Contacts */}
          <div className="gap-2 grid">
            <label htmlFor="keyContacts">{t("keyContacts")}</label>
            <textarea
              rows={3}
              id="keyContacts"
              value={editedAction.keyContacts}
              onChange={(e) =>
                setEditedAction({
                  ...editedAction,
                  keyContacts: e.target.value,
                })
              }
              className="w-full textarea"
            />
          </div>

          {/* Steps */}
          <div className="gap-2 grid">
            <label htmlFor="steps">{t("steps")}</label>
            <textarea
              rows={3}
              id="steps"
              value={editedAction.steps}
              onChange={(e) =>
                setEditedAction({ ...editedAction, steps: e.target.value })
              }
              className="w-full textarea"
            />
          </div>

          {/* Calendar */}
          <div className="gap-2 grid">
            <label htmlFor="calendar">{t("calendar")}</label>
            <textarea
              rows={3}
              id="calendar"
              value={editedAction.calendar}
              onChange={(e) =>
                setEditedAction({ ...editedAction, calendar: e.target.value })
              }
              className="w-full textarea"
            />
          </div>

          {/* Monitoring */}
          <div className="gap-2 grid">
            <label htmlFor="monitoring">{t("monitoring")}</label>
            <textarea
              rows={3}
              id="monitoring"
              value={editedAction.monitoring}
              onChange={(e) =>
                setEditedAction({ ...editedAction, monitoring: e.target.value })
              }
              className="w-full textarea"
            />
          </div>

          {/* Performance */}
          <div className="gap-2 grid">
            <label htmlFor="performance">{t("performance")}</label>
            <textarea
              rows={3}
              id="performance"
              value={editedAction.performance}
              onChange={(e) =>
                setEditedAction({
                  ...editedAction,
                  performance: e.target.value,
                })
              }
              className="w-full textarea"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {/* Submit button */}
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isInvalid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Submitting...
              </>
            ) : (
              "Submit for Approval"
            )}
          </button>

          <button
            className="btn"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditActionModal;
