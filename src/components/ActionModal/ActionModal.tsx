"use client";

import Modal from "@/components/Modal";
import { Action } from "@/types/Action";
import { useTranslations } from "next-intl";
import { useEffect, useState, useMemo } from "react";
import { useUser } from "@/context/UserContext";

interface CustomAction extends Action {
  selected: boolean;
  status?: "Completed" | "Selected" | "Available";
  assignedTo?: string;
  timeline?: number;
  subcategory?: string;
  pendingChanges?: {
    steps?: string;
    monitoring?: string;
    performance?: string;
    keyContacts?: string;
    changedBy?: string;
    changedAt?: string;
  };
  needsApproval?: boolean;
}

interface ActionModalProps {
  mode: "create" | "edit";
  onSubmit: (action: CustomAction) => void;
  categories: { value: string; label: string }[];
  effortCategories: { value: string; label: string }[];
  subcategoryOptions?: { value: string; label: string; categoryId?: string }[];
  initialAction?: CustomAction;
  onDelete?: (action: CustomAction) => void;
  onApproveChanges?: (action: CustomAction) => void;
  onRejectChanges?: (action: CustomAction) => void;
  onCompleteAction?: (action: CustomAction) => void;
  allowAllFieldsEdit?: boolean; // Allow students to edit all fields (for data reporting screen)
}

const ActionModal: React.FC<ActionModalProps> = ({
  mode,
  onSubmit,
  categories,
  effortCategories,
  subcategoryOptions = [],
  initialAction,
  onDelete,
  onApproveChanges,
  onRejectChanges,
  onCompleteAction,
  allowAllFieldsEdit = false,
}) => {
  const t = useTranslations("Action");
  const { user } = useUser();

  // Check if user is a teacher (has role "teacher" or "admin")
  const isTeacher = user?.role === "teacher" || user?.role === "admin";

  const [newAction, setNewAction] = useState<CustomAction>({
    id: "",
    date: "",
    category: "",
    subcategory: "",
    title: "",
    description: "",
    reduction: 0,
    effort: "",
    manager: "",
    nature: "",
    objectives: "",
    keyContacts: "",
    steps: "",
    calendar: "",
    indicators: "",
    monitoring: "",
    performance: "",
    status: "Available",
    assignedTo: "",
    timeline: 1,
    selected: false,
  });

  const [isEditing, setIsEditing] = useState(mode === "create");
  const [pendingChanges, setPendingChanges] = useState<{
    steps?: string;
    monitoring?: string;
    performance?: string;
    keyContacts?: string;
  }>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (initialAction && mode === "edit") {
      setNewAction({
        ...initialAction,
        assignedTo: initialAction.assignedTo || "",
        timeline: initialAction.timeline || 1,
        subcategory: initialAction.subcategory || "",
      });
      setIsEditing(false);
    }
  }, [initialAction, mode]);

  const handleSubmit = () => {
    if (!newAction.category || !newAction.title || !newAction.reduction) return;

    if (isTeacher || allowAllFieldsEdit) {
      // Teachers and data reporting screen can directly submit changes
      onSubmit({
        ...newAction,
        id:
          mode === "edit" && initialAction
            ? initialAction.id
            : Date.now().toString(),
        selected: initialAction?.selected ?? false,
        date:
          mode === "edit" && initialAction
            ? initialAction.date
            : new Date().toISOString(),
      });
    } else {
      // Students submit pending changes for approval
      onSubmit({
        ...newAction,
        id:
          mode === "edit" && initialAction
            ? initialAction.id
            : Date.now().toString(),
        selected: initialAction?.selected ?? false,
        date:
          mode === "edit" && initialAction
            ? initialAction.date
            : new Date().toISOString(),
        pendingChanges: {
          ...pendingChanges,
          changedBy: user?.username || "",
          changedAt: new Date().toISOString(),
        },
        needsApproval: true,
      });
    }

    const modal = document.getElementById("custom_action") as HTMLDialogElement;
    if (modal) modal.close();
  };

  const handleCancel = () => {
    const modal = document.getElementById("custom_action") as HTMLDialogElement;
    if (modal) modal.close();
    setIsEditing(false);
  };

  const fieldDisabled = mode === "edit" && !isEditing;

  // Helper function to check if a field can be edited by current user
  const canEditField = (fieldName: string): boolean => {
    if (isTeacher) return true; // Teachers can edit all fields
    if (allowAllFieldsEdit) return true; // Allow all fields for data reporting screen
    if (!isTeacher) {
      // Students can only edit: steps, monitoring, performance, keyContacts
      return ["steps", "monitoring", "performance", "keyContacts"].includes(
        fieldName,
      );
    }
    return false;
  };

  // Helper function to handle field changes
  const handleFieldChange = (fieldName: string, value: string) => {
    if (isTeacher || allowAllFieldsEdit) {
      // Teachers and data reporting screen can directly modify the action
      setNewAction({ ...newAction, [fieldName]: value });
    } else {
      // Students create pending changes
      setPendingChanges({ ...pendingChanges, [fieldName]: value });
      setHasUnsavedChanges(true);
    }
  };

  // Helper function to get field value (original or pending)
  const getFieldValue = (fieldName: string): string => {
    if (isTeacher || allowAllFieldsEdit) {
      return (newAction[fieldName as keyof CustomAction] as string) || "";
    } else {
      return (
        pendingChanges[fieldName as keyof typeof pendingChanges] ||
        (newAction[fieldName as keyof CustomAction] as string) ||
        ""
      );
    }
  };

  // Memoize filtered subcategories to ensure proper reactivity
  const filteredSubcategories = useMemo(() => {
    if (!newAction.category) {
      return [];
    }

    const filtered = subcategoryOptions.filter((sub) => {
      // First, try using categoryId if it exists
      if (sub.categoryId) {
        return (
          sub.categoryId === newAction.category ||
          String(sub.categoryId) === String(newAction.category)
        );
      }

      // If categoryId is not set, extract it from the value field
      // Value format is: "categoryId-subcategoryId"
      if (sub.value && typeof sub.value === "string") {
        // UUID format: 8-4-4-4-12, so categoryId is first 36 characters (8-4-4-4-12)
        // But we need to check if it starts with the category ID
        if (sub.value.startsWith(newAction.category)) {
          return true;
        }

        // Try extracting the first UUID from the value
        // UUIDs are 36 characters: 8-4-4-4-12
        const categoryIdFromValue = sub.value.substring(0, 36);
        if (categoryIdFromValue === newAction.category) {
          return true;
        }
      }

      return false;
    });

    return filtered;
  }, [newAction.category, subcategoryOptions]);

  // Different validation for teachers vs students
  const isInvalid =
    isTeacher || allowAllFieldsEdit
      ? // Teachers and data reporting screen: validate all required fields (subcategory is optional)
        newAction.category === "" ||
        newAction.title === "" ||
        newAction.description === "" ||
        newAction.reduction === 0 ||
        newAction.effort === ""
      : // Students: only validate that they have made some changes
        !hasUnsavedChanges;

  return (
    <Modal
      id="custom_action"
      title={mode === "edit" ? t("editAction") : t("addCustomAction")}
    >
      <div className="sm:max-w-md">
        <div className="grid grid-cols-2 gap-4">
          {/* Status */}
          <div className="grid gap-2">
            <label htmlFor="status">{t("status")}</label>
            <select
              id="status"
              value={newAction.status}
              onChange={(e) =>
                setNewAction({
                  ...newAction,
                  status: e.target.value as
                    | "Completed"
                    | "Selected"
                    | "Available",
                })
              }
              className="input w-full"
              disabled={fieldDisabled || !canEditField("status")}
            >
              <option value="Available">{t("available")}</option>
              <option value="Selected">{t("selected")}</option>
              <option value="Completed">{t("completed")}</option>
            </select>
          </div>

          {/* Assigned To */}
          <div className="grid gap-2">
            <label htmlFor="assignedTo">{t("assignedTo")}</label>
            <input
              id="assignedTo"
              value={newAction.assignedTo || ""}
              onChange={(e) =>
                setNewAction({ ...newAction, assignedTo: e.target.value })
              }
              className="input w-full"
              disabled={fieldDisabled || !canEditField("assignedTo")}
            />
          </div>

          {/* Category */}
          <div className="grid gap-2">
            <label htmlFor="category">{t("category")}</label>
            <select
              id="category"
              value={newAction.category}
              onChange={(e) =>
                setNewAction({
                  ...newAction,
                  category: e.target.value,
                  subcategory: "",
                })
              }
              className="input w-full"
              disabled={fieldDisabled || !canEditField("category")}
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
          <div className="grid gap-2">
            <label htmlFor="subcategory">{t("subcategory")}</label>
            <select
              id="subcategory"
              value={newAction.subcategory || ""}
              onChange={(e) =>
                setNewAction({ ...newAction, subcategory: e.target.value })
              }
              className="input w-full"
              disabled={
                fieldDisabled ||
                !newAction.category ||
                !canEditField("subcategory")
              }
            >
              <option value="">{t("selectCategory")}</option>
              {filteredSubcategories.map((sub) => (
                <option key={sub.value} value={sub.value}>
                  {sub.label}
                </option>
              ))}
            </select>
          </div>

          {/* Timeline */}
          <div className="grid gap-2">
            <label htmlFor="timeline">{t("timeline")}</label>
            <input
              id="timeline"
              type="number"
              value={newAction.timeline || 1}
              onChange={(e) =>
                setNewAction({ ...newAction, timeline: Number(e.target.value) })
              }
              min={1}
              max={50}
              placeholder={t("numberOfYears")}
              className="input w-full"
              disabled={fieldDisabled || !canEditField("timeline")}
            />
          </div>

          {/* Title */}
          <div className="grid gap-2">
            <label htmlFor="title">{t("actionTitle")}</label>
            <input
              id="title"
              value={newAction.title}
              onChange={(e) =>
                setNewAction({ ...newAction, title: e.target.value })
              }
              className="input w-full"
              disabled={fieldDisabled || !canEditField("title")}
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <label htmlFor="description">{t("description")}</label>
            <input
              id="description"
              value={newAction.description}
              onChange={(e) =>
                setNewAction({ ...newAction, description: e.target.value })
              }
              className="input w-full"
              disabled={fieldDisabled || !canEditField("description")}
            />
          </div>

          {/* Effort */}
          <div className="grid gap-2">
            <label htmlFor="effort">{t("effort")}</label>
            <select
              id="effort"
              value={newAction.effort}
              onChange={(e) =>
                setNewAction({ ...newAction, effort: e.target.value })
              }
              className="input w-full"
              disabled={fieldDisabled || !canEditField("effort")}
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
          <div className="grid gap-2">
            <label htmlFor="reduction">{t("estimatedReduction")}</label>
            <input
              id="reduction"
              type="number"
              value={newAction.reduction}
              onChange={(e) =>
                setNewAction({
                  ...newAction,
                  reduction: Number(e.target.value),
                })
              }
              min={1}
              max={100}
              className="input w-full"
              disabled={fieldDisabled || !canEditField("reduction")}
            />
          </div>

          {/* Manager */}
          <div className="grid gap-2">
            <label htmlFor="manager">{t("manager")}</label>
            <input
              id="manager"
              value={newAction.manager}
              onChange={(e) =>
                setNewAction({ ...newAction, manager: e.target.value })
              }
              className="input w-full"
              disabled={fieldDisabled || !canEditField("manager")}
            />
          </div>

          {/* Nature */}
          <div className="grid gap-2">
            <label htmlFor="nature">{t("nature")}</label>
            <input
              id="nature"
              value={newAction.nature}
              onChange={(e) =>
                setNewAction({ ...newAction, nature: e.target.value })
              }
              className="input w-full"
              disabled={fieldDisabled || !canEditField("nature")}
            />
          </div>

          {/* Objectives */}
          <div className="grid gap-2">
            <label htmlFor="objectives">{t("objectives")}</label>
            <textarea
              rows={3}
              id="objectives"
              value={newAction.objectives}
              onChange={(e) =>
                setNewAction({ ...newAction, objectives: e.target.value })
              }
              className="textarea w-full"
              disabled={fieldDisabled || !canEditField("objectives")}
            />
          </div>

          {/* Key Contacts */}
          <div className="grid gap-2">
            <label htmlFor="keyContacts" className="flex items-center gap-2">
              {t("keyContacts")}
              {isTeacher &&
                initialAction?.pendingChanges?.keyContacts &&
                initialAction.pendingChanges.keyContacts !==
                  initialAction.keyContacts && (
                  <span className="badge badge-warning badge-sm">
                    {t("pendingChange")}
                  </span>
                )}
            </label>
            <textarea
              rows={3}
              id="keyContacts"
              value={getFieldValue("keyContacts")}
              onChange={(e) => handleFieldChange("keyContacts", e.target.value)}
              className={`textarea w-full ${
                isTeacher &&
                initialAction?.pendingChanges?.keyContacts &&
                initialAction.pendingChanges.keyContacts !==
                  initialAction.keyContacts
                  ? "border-warning bg-warning/10"
                  : ""
              }`}
              disabled={fieldDisabled || !canEditField("keyContacts")}
            />
          </div>

          {/* Steps */}
          <div className="grid gap-2">
            <label htmlFor="steps" className="flex items-center gap-2">
              {t("steps")}
              {isTeacher &&
                initialAction?.pendingChanges?.steps &&
                initialAction.pendingChanges.steps !== initialAction.steps && (
                  <span className="badge badge-warning badge-sm">
                    {t("pendingChange")}
                  </span>
                )}
            </label>
            <textarea
              rows={3}
              id="steps"
              value={getFieldValue("steps")}
              onChange={(e) => handleFieldChange("steps", e.target.value)}
              className={`textarea w-full ${
                isTeacher &&
                initialAction?.pendingChanges?.steps &&
                initialAction.pendingChanges.steps !== initialAction.steps
                  ? "border-warning bg-warning/10"
                  : ""
              }`}
              disabled={fieldDisabled || !canEditField("steps")}
            />
          </div>

          {/* Calendar */}
          <div className="grid gap-2">
            <label htmlFor="calendar">{t("calendar")}</label>
            <textarea
              rows={3}
              id="calendar"
              value={newAction.calendar}
              onChange={(e) =>
                setNewAction({ ...newAction, calendar: e.target.value })
              }
              className="textarea w-full"
              disabled={fieldDisabled || !canEditField("calendar")}
            />
          </div>

          {/* Monitoring */}
          <div className="grid gap-2">
            <label htmlFor="monitoring" className="flex items-center gap-2">
              {t("monitoring")}
              {isTeacher &&
                initialAction?.pendingChanges?.monitoring &&
                initialAction.pendingChanges.monitoring !==
                  initialAction.monitoring && (
                  <span className="badge badge-warning badge-sm">
                    {t("pendingChange")}
                  </span>
                )}
            </label>
            <textarea
              rows={3}
              id="monitoring"
              value={getFieldValue("monitoring")}
              onChange={(e) => handleFieldChange("monitoring", e.target.value)}
              className={`textarea w-full ${
                isTeacher &&
                initialAction?.pendingChanges?.monitoring &&
                initialAction.pendingChanges.monitoring !==
                  initialAction.monitoring
                  ? "border-warning bg-warning/10"
                  : ""
              }`}
              disabled={fieldDisabled || !canEditField("monitoring")}
            />
          </div>

          {/* Performance */}
          <div className="grid gap-2">
            <label htmlFor="performance" className="flex items-center gap-2">
              {t("performance")}
              {isTeacher &&
                initialAction?.pendingChanges?.performance &&
                initialAction.pendingChanges.performance !==
                  initialAction.performance && (
                  <span className="badge badge-warning badge-sm">
                    {t("pendingChange")}
                  </span>
                )}
            </label>
            <textarea
              rows={3}
              id="performance"
              value={getFieldValue("performance")}
              onChange={(e) => handleFieldChange("performance", e.target.value)}
              className={`textarea w-full ${
                isTeacher &&
                initialAction?.pendingChanges?.performance &&
                initialAction.pendingChanges.performance !==
                  initialAction.performance
                  ? "border-warning bg-warning/10"
                  : ""
              }`}
              disabled={fieldDisabled || !canEditField("performance")}
            />
          </div>
        </div>

        {/* Pending Changes Notification for Teachers */}
        {mode === "edit" && isTeacher && initialAction?.needsApproval && (
          <div className="alert alert-warning mt-4">
            <div className="w-full">
              <h3 className="font-bold">{t("pendingStudentChanges")}</h3>
              <div className="mb-3 text-xs">
                {t("changesSubmittedBy")}{" "}
                {initialAction.pendingChanges?.changedBy}
                <br />
                {t("submittedAt")}{" "}
                {initialAction.pendingChanges?.changedAt
                  ? new Date(
                      initialAction.pendingChanges.changedAt,
                    ).toLocaleString()
                  : t("unknown")}
              </div>

              {/* Show detailed changes */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">{t("changesMade")}</h4>
                {initialAction.pendingChanges?.steps &&
                  initialAction.pendingChanges.steps !==
                    initialAction.steps && (
                    <div className="rounded border bg-white p-2">
                      <div className="text-sm font-medium text-gray-700">
                        {t("stepsColon")}
                      </div>
                      <div className="text-xs">
                        <div className="text-red-600">
                          {t("original")}{" "}
                          {initialAction.steps || t("notSpecified")}
                        </div>
                        <div className="text-green-600">
                          {t("proposed")} {initialAction.pendingChanges.steps}
                        </div>
                      </div>
                    </div>
                  )}

                {initialAction.pendingChanges?.monitoring &&
                  initialAction.pendingChanges.monitoring !==
                    initialAction.monitoring && (
                    <div className="rounded border bg-white p-2">
                      <div className="text-sm font-medium text-gray-700">
                        {t("monitoringColon")}
                      </div>
                      <div className="text-xs">
                        <div className="text-red-600">
                          {t("original")}{" "}
                          {initialAction.monitoring || t("notSpecified")}
                        </div>
                        <div className="text-green-600">
                          {t("proposed")}{" "}
                          {initialAction.pendingChanges.monitoring}
                        </div>
                      </div>
                    </div>
                  )}

                {initialAction.pendingChanges?.performance &&
                  initialAction.pendingChanges.performance !==
                    initialAction.performance && (
                    <div className="rounded border bg-white p-2">
                      <div className="text-sm font-medium text-gray-700">
                        {t("performanceColon")}
                      </div>
                      <div className="text-xs">
                        <div className="text-red-600">
                          {t("original")}{" "}
                          {initialAction.performance || t("notSpecified")}
                        </div>
                        <div className="text-green-600">
                          {t("proposed")}{" "}
                          {initialAction.pendingChanges.performance}
                        </div>
                      </div>
                    </div>
                  )}

                {initialAction.pendingChanges?.keyContacts &&
                  initialAction.pendingChanges.keyContacts !==
                    initialAction.keyContacts && (
                    <div className="rounded border bg-white p-2">
                      <div className="text-sm font-medium text-gray-700">
                        {t("keyContactsColon")}
                      </div>
                      <div className="text-xs">
                        <div className="text-red-600">
                          {t("original")}{" "}
                          {initialAction.keyContacts || t("notSpecified")}
                        </div>
                        <div className="text-green-600">
                          {t("proposed")}{" "}
                          {initialAction.pendingChanges.keyContacts}
                        </div>
                      </div>
                    </div>
                  )}

                {/* Show if no changes were made */}
                {!initialAction.pendingChanges?.steps &&
                  !initialAction.pendingChanges?.monitoring &&
                  !initialAction.pendingChanges?.performance &&
                  !initialAction.pendingChanges?.keyContacts && (
                    <div className="text-sm text-gray-600 italic">
                      {t("noFieldChangesDetected")}
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Unsaved Changes Notification for Students */}
        {hasUnsavedChanges && !isTeacher && (
          <div className="alert alert-info mt-4">
            <div>
              <h3 className="font-bold">{t("unsavedChanges")}</h3>
              <div className="text-xs">{t("changesWillBeSubmitted")}</div>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {/* Delete button in edit mode - only for teachers */}
          {mode === "edit" && !isEditing && isTeacher && onDelete && (
            <button
              className="btn btn-error"
              onClick={() => onDelete(newAction)}
            >
              {t("delete")}
            </button>
          )}

          {/* Complete Action button - only for teachers */}
          {mode === "edit" && isTeacher && onCompleteAction && (
            <button
              className="btn btn-success"
              onClick={() => onCompleteAction(newAction)}
            >
              {t("completeAction")}
            </button>
          )}

          {/* Approve Changes button - only for teachers when there are pending changes */}
          {mode === "edit" &&
            isTeacher &&
            initialAction?.needsApproval &&
            onApproveChanges && (
              <button
                className="btn btn-success"
                onClick={() => onApproveChanges(newAction)}
              >
                {t("approveChanges")}
              </button>
            )}

          {/* Reject Changes button - only for teachers when there are pending changes */}
          {mode === "edit" &&
            isTeacher &&
            initialAction?.needsApproval &&
            onRejectChanges && (
              <button
                className="btn btn-error"
                onClick={() => onRejectChanges(newAction)}
              >
                {t("rejectChanges")}
              </button>
            )}

          {/* Edit button - only show if user can edit */}
          {mode === "edit" && !isEditing && (
            <button
              className="btn-outline btn"
              onClick={() => setIsEditing(true)}
            >
              {t("edit")}
            </button>
          )}

          {/* Submit button */}
          {!fieldDisabled && (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isInvalid}
            >
              {isTeacher || allowAllFieldsEdit
                ? mode === "edit"
                  ? t("saveChanges")
                  : t("addAction")
                : t("submitForApproval")}
            </button>
          )}

          <button className="btn" onClick={handleCancel}>
            {t("cancel")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ActionModal;
