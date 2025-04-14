"use client";
import Modal from "@/components/Modal";
import { Car, Leaf, Recycle, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode, useEffect, useState } from "react";

export interface CustomAction {
  id: string;
  icon: ReactNode;
  category: string;
  title: string;
  description: string;
  reduction: string;
  effort: string;
  manager: string;
  nature: string;
  objectives: string;
  keyContacts: string;
  steps: string;
  calendar: string;
  indicators: string;
  monitoring: string;
  performance: string;
  selected: boolean;
  date: string;
}

type NewActionInput = Omit<CustomAction, "id" | "icon" | "selected" | "date">;

interface ActionModalProps {
  mode: "create" | "edit";
  onSubmit: (action: CustomAction) => void;
  categories: { value: string; label: string }[];
  effortCategories: { value: string; label: string }[];
  initialAction?: CustomAction;
}

const ActionModal: React.FC<ActionModalProps> = ({
  mode,
  onSubmit,
  categories,
  effortCategories,
  initialAction,
}) => {
  const t = useTranslations("StudentCalculator");

  const [newAction, setNewAction] = useState<NewActionInput>({
    category: "",
    title: "",
    description: "",
    reduction: "",
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
  });

  const [isEditing, setIsEditing] = useState(mode === "create" ? true : false);

  useEffect(() => {
    if (initialAction && mode === "edit") {
      const { ...rest } = initialAction;
      setNewAction(rest);
      setIsEditing(false);
    }
  }, [initialAction, mode]);

  const getIconForCategory = (category: string): ReactNode => {
    switch (category) {
      case "energy":
        return <Zap className="h-6 w-6" />;
      case "waste":
        return <Recycle className="h-6 w-6" />;
      case "transport":
        return <Car className="h-6 w-6" />;
      case "nature":
        return <Leaf className="h-6 w-6" />;
      default:
        return null;
    }
  };

  const handleSubmit = () => {
    if (!newAction.category || !newAction.title || !newAction.reduction) return;

    onSubmit({
      id:
        mode === "edit" && initialAction
          ? initialAction.id
          : Date.now().toString(),
      icon: getIconForCategory(newAction.category),
      selected: initialAction?.selected ?? false,
      date:
        mode === "edit" && initialAction
          ? initialAction.date
          : new Date().toISOString(),
      ...newAction,
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
    newAction.title === "" ||
    newAction.description === "" ||
    newAction.reduction === "" ||
    newAction.effort === "";

  return (
    <Modal
      id="custom_action"
      title={mode === "edit" ? "Edit Action" : "Add Custom Action"}
    >
      <div className="sm:max-w-md">
        <p className="mb-4">
          {mode === "edit"
            ? "View your custom action details"
            : "Create your own action to help reduce emissions"}
        </p>

        <div className="grid gap-4 py-4">
          {/* Category */}
          <div className="grid gap-2">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={newAction.category}
              onChange={(e) =>
                setNewAction({ ...newAction, category: e.target.value })
              }
              className="input w-full"
              disabled={fieldDisabled}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="grid gap-2">
            <label htmlFor="title">Action Title</label>
            <input
              id="title"
              value={newAction.title}
              onChange={(e) =>
                setNewAction({ ...newAction, title: e.target.value })
              }
              className="input w-full"
              disabled={fieldDisabled}
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              value={newAction.description}
              onChange={(e) =>
                setNewAction({ ...newAction, description: e.target.value })
              }
              className="input w-full"
              disabled={fieldDisabled}
            />
          </div>

          {/* Effort */}
          <div className="grid gap-2">
            <label htmlFor="effort">Effort</label>
            <select
              id="effort"
              value={newAction.effort}
              onChange={(e) =>
                setNewAction({ ...newAction, effort: e.target.value })
              }
              className="input w-full"
              disabled={fieldDisabled}
            >
              <option value="">Select effort</option>
              {effortCategories.map((effort) => (
                <option key={effort.value} value={effort.value}>
                  {effort.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reduction */}
          <div className="grid gap-2">
            <label htmlFor="reduction">Estimated Reduction (%)</label>
            <input
              id="reduction"
              type="number"
              value={newAction.reduction}
              onChange={(e) =>
                setNewAction({ ...newAction, reduction: e.target.value })
              }
              min="1"
              max="100"
              className="input w-full"
              disabled={fieldDisabled}
            />
          </div>

          {/* Additional Fields */}
          <div className="grid gap-2">
            <label htmlFor="manager">Manager</label>
            <input
              id="manager"
              value={newAction.manager}
              onChange={(e) =>
                setNewAction({ ...newAction, manager: e.target.value })
              }
              className="input w-full"
              disabled={fieldDisabled}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="nature">Nature</label>
            <input
              id="nature"
              value={newAction.nature}
              onChange={(e) =>
                setNewAction({ ...newAction, nature: e.target.value })
              }
              className="input w-full"
              disabled={fieldDisabled}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="objectives">Objectives</label>
            <textarea
              rows={3}
              id="objectives"
              value={newAction.objectives}
              onChange={(e) =>
                setNewAction({ ...newAction, objectives: e.target.value })
              }
              className="textarea w-full"
              disabled={fieldDisabled}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="keyContacts">Key Contacts</label>
            <textarea
              rows={3}
              id="keyContacts"
              value={newAction.keyContacts}
              onChange={(e) =>
                setNewAction({ ...newAction, keyContacts: e.target.value })
              }
              className="textarea w-full"
              disabled={fieldDisabled}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="steps">Steps</label>
            <textarea
              rows={3}
              id="steps"
              value={newAction.steps}
              onChange={(e) =>
                setNewAction({ ...newAction, steps: e.target.value })
              }
              className="textarea w-full"
              disabled={fieldDisabled}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="calendar">Calendar</label>
            <textarea
              rows={3}
              id="calendar"
              placeholder="e.g., 25/05"
              value={newAction.calendar}
              onChange={(e) =>
                setNewAction({ ...newAction, calendar: e.target.value })
              }
              className="textarea w-full"
              disabled={fieldDisabled}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="monitoring">Monitoring</label>
            <textarea
              rows={3}
              id="monitoring"
              value={newAction.monitoring}
              onChange={(e) =>
                setNewAction({ ...newAction, monitoring: e.target.value })
              }
              className="textarea w-full"
              disabled={fieldDisabled}
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="performance">Performance</label>
            <textarea
              id="performance"
              rows={3}
              value={newAction.performance}
              onChange={(e) =>
                setNewAction({ ...newAction, performance: e.target.value })
              }
              className="textarea w-full"
              disabled={fieldDisabled}
            />
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-4">
          {isInvalid && isEditing && (
            <p className="mr-auto text-red-500">{t("customActionWarning")}</p>
          )}

          {mode === "edit" && !isEditing ? (
            <>
              <button className="btn px-4 py-2" onClick={handleCancel}>
                Close
              </button>
              <button
                className="btn btn-primary rounded px-4 py-2 text-white"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </button>
            </>
          ) : (
            <>
              <button className="btn px-4 py-2" onClick={handleCancel}>
                Cancel
              </button>
              <button
                className="btn btn-primary rounded px-4 py-2 text-white"
                onClick={handleSubmit}
                disabled={isInvalid}
              >
                {mode === "edit" ? "Update Action" : "Add Action"}
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ActionModal;
