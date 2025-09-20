"use client";

import Modal from "@/components/Modal";
import { Action } from "@/types/Action";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";

interface CustomAction extends Action {
  selected: boolean;
  status?: "Completed" | "Selected" | "Available";
  assignedTo?: string;
  timeline?: number;
  subcategory?: string;
}

interface ActionModalProps {
  mode: "create" | "edit";
  onSubmit: (action: CustomAction) => void;
  categories: { value: string; label: string }[];
  effortCategories: { value: string; label: string }[];
  subcategoryOptions?: { value: string; label: string }[];
  initialAction?: CustomAction;
  onDelete?: (action: CustomAction) => void;
}

const ActionModal: React.FC<ActionModalProps> = ({
  mode,
  onSubmit,
  categories,
  effortCategories,
  subcategoryOptions = [],
  initialAction,
  onDelete,
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

    const modal = document.getElementById("custom_action") as HTMLDialogElement;
    if (modal) modal.close();
  };

  const handleCancel = () => {
    const modal = document.getElementById("custom_action") as HTMLDialogElement;
    if (modal) modal.close();
    setIsEditing(false);
  };

  const fieldDisabled = mode === "edit" && !isEditing;

  const isInvalid =
    newAction.category === "" ||
    newAction.subcategory === "" ||
    newAction.title === "" ||
    newAction.description === "" ||
    newAction.reduction === 0 ||
    newAction.effort === "";

  return (
    <Modal
      id="custom_action"
      title={mode === "edit" ? t("editAction") : t("addCustomAction")}
    >
      <div className="sm:max-w-md">
        <div className="gap-4 grid grid-cols-2">
          {/* Status */}
          <div className="gap-2 grid">
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
              className="w-full input"
              disabled={fieldDisabled}
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
              value={newAction.assignedTo || ""}
              onChange={(e) =>
                setNewAction({ ...newAction, assignedTo: e.target.value })
              }
              className="w-full input"
              disabled={fieldDisabled}
            />
          </div>

          {/* Category */}
          <div className="gap-2 grid">
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
              className="w-full input"
              disabled={fieldDisabled}
            >
              <option value="">{t("selectCategory")}</option>
              {categories.map((cat) => (
                <option key={cat.label} value={cat.value}>
                  {t(cat.label)}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div className="gap-2 grid">
            <label htmlFor="subcategory">{t("subcategory")}</label>
            <select
              id="subcategory"
              value={newAction.subcategory || ""}
              onChange={(e) =>
                setNewAction({ ...newAction, subcategory: e.target.value })
              }
              className="w-full input"
              disabled={fieldDisabled || !newAction.category}
            >
              <option value="">{t("selectCategory")}</option>
              {subcategoryOptions
                .filter(
                  (sub) =>
                    !newAction.category ||
                    sub.value.startsWith(newAction.category),
                )
                .map((sub) => (
                  <option key={sub.value} value={sub.value}>
                    {t(sub.label)}
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
              value={newAction.timeline || 1}
              onChange={(e) =>
                setNewAction({ ...newAction, timeline: Number(e.target.value) })
              }
              min={1}
              max={50}
              placeholder="Number of years"
              className="w-full input"
              disabled={fieldDisabled}
            />
          </div>

          {/* Title */}
          <div className="gap-2 grid">
            <label htmlFor="title">{t("actionTitle")}</label>
            <input
              id="title"
              value={newAction.title}
              onChange={(e) =>
                setNewAction({ ...newAction, title: e.target.value })
              }
              className="w-full input"
              disabled={fieldDisabled}
            />
          </div>

          {/* Description */}
          <div className="gap-2 grid">
            <label htmlFor="description">{t("description")}</label>
            <input
              id="description"
              value={newAction.description}
              onChange={(e) =>
                setNewAction({ ...newAction, description: e.target.value })
              }
              className="w-full input"
              disabled={fieldDisabled}
            />
          </div>

          {/* Effort */}
          <div className="gap-2 grid">
            <label htmlFor="effort">{t("effort")}</label>
            <select
              id="effort"
              value={newAction.effort}
              onChange={(e) =>
                setNewAction({ ...newAction, effort: e.target.value })
              }
              className="w-full input"
              disabled={fieldDisabled}
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
              value={newAction.reduction}
              onChange={(e) =>
                setNewAction({
                  ...newAction,
                  reduction: Number(e.target.value),
                })
              }
              min={1}
              max={100}
              className="w-full input"
              disabled={fieldDisabled}
            />
          </div>

          {/* Manager */}
          <div className="gap-2 grid">
            <label htmlFor="manager">{t("manager")}</label>
            <input
              id="manager"
              value={newAction.manager}
              onChange={(e) =>
                setNewAction({ ...newAction, manager: e.target.value })
              }
              className="w-full input"
              disabled={fieldDisabled}
            />
          </div>

          {/* Nature */}
          <div className="gap-2 grid">
            <label htmlFor="nature">{t("nature")}</label>
            <input
              id="nature"
              value={newAction.nature}
              onChange={(e) =>
                setNewAction({ ...newAction, nature: e.target.value })
              }
              className="w-full input"
              disabled={fieldDisabled}
            />
          </div>

          {/* Objectives */}
          <div className="gap-2 grid">
            <label htmlFor="objectives">{t("objectives")}</label>
            <textarea
              rows={3}
              id="objectives"
              value={newAction.objectives}
              onChange={(e) =>
                setNewAction({ ...newAction, objectives: e.target.value })
              }
              className="w-full textarea"
              disabled={fieldDisabled}
            />
          </div>

          {/* Key Contacts */}
          <div className="gap-2 grid">
            <label htmlFor="keyContacts">{t("keyContacts")}</label>
            <textarea
              rows={3}
              id="keyContacts"
              value={newAction.keyContacts}
              onChange={(e) =>
                setNewAction({ ...newAction, keyContacts: e.target.value })
              }
              className="w-full textarea"
              disabled={fieldDisabled}
            />
          </div>

          {/* Steps */}
          <div className="gap-2 grid">
            <label htmlFor="steps">{t("steps")}</label>
            <textarea
              rows={3}
              id="steps"
              value={newAction.steps}
              onChange={(e) =>
                setNewAction({ ...newAction, steps: e.target.value })
              }
              className="w-full textarea"
              disabled={fieldDisabled}
            />
          </div>

          {/* Calendar */}
          <div className="gap-2 grid">
            <label htmlFor="calendar">{t("calendar")}</label>
            <textarea
              rows={3}
              id="calendar"
              value={newAction.calendar}
              onChange={(e) =>
                setNewAction({ ...newAction, calendar: e.target.value })
              }
              className="w-full textarea"
              disabled={fieldDisabled}
            />
          </div>

          {/* Monitoring */}
          <div className="gap-2 grid">
            <label htmlFor="monitoring">{t("monitoring")}</label>
            <textarea
              rows={3}
              id="monitoring"
              value={newAction.monitoring}
              onChange={(e) =>
                setNewAction({ ...newAction, monitoring: e.target.value })
              }
              className="w-full textarea"
              disabled={fieldDisabled}
            />
          </div>

          {/* Performance */}
          <div className="gap-2 grid">
            <label htmlFor="performance">{t("performance")}</label>
            <textarea
              rows={3}
              id="performance"
              value={newAction.performance}
              onChange={(e) =>
                setNewAction({ ...newAction, performance: e.target.value })
              }
              className="w-full textarea"
              disabled={fieldDisabled}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          {/* Delete button in edit mode - only for teachers */}
          {mode === "edit" && !isEditing && isTeacher && onDelete && (
            <button
              className="btn btn-error"
              onClick={() => onDelete(newAction)}
            >
              {t("delete")}
            </button>
          )}
          {mode === "edit" && !isEditing && (
            <button
              className="btn-outline btn"
              onClick={() => setIsEditing(true)}
            >
              {t("edit")}
            </button>
          )}

          {!fieldDisabled && (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isInvalid}
            >
              {mode === "edit" ? t("saveChanges") : t("addAction")}
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
