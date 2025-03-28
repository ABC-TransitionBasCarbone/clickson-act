"use client";
import Modal from "@/components/Modal";
import { Car, Leaf, Recycle, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode, useState } from "react";

// The complete type for an action
interface CustomAction {
  id: string;
  icon: ReactNode;
  category: string;
  title: string;
  description: string;
  reduction: string;
  effort: string;
  selected: boolean;
}

// Type for the input (omitting id, icon, and selected)
type NewActionInput = Omit<CustomAction, "id" | "icon" | "selected">;

interface CustomActionModalProps {
  onAddAction: (action: CustomAction) => void;
  categories: { value: string; label: string }[];
  effortCategories: { value: string; label: string }[];
}

const CustomActionModal: React.FC<CustomActionModalProps> = ({
  onAddAction,
  categories,
  effortCategories,
}) => {
  // Use a separate type for the input state
  const [newAction, setNewAction] = useState<NewActionInput>({
    category: "",
    title: "",
    description: "",
    reduction: "",
    effort: "",
  });
  const t = useTranslations("StudentCalculator");

  const handleAddAction = () => {
    if (!newAction.category || !newAction.title || !newAction.reduction) {
      return;
    }

    const newId = Date.now().toString();

    // Determine the icon based on the category
    let icon: ReactNode = null;
    if (newAction.category === "energy") {
      icon = <Zap className="h-6 w-6" />;
    } else if (newAction.category === "waste") {
      icon = <Recycle className="h-6 w-6" />;
    } else if (newAction.category === "transport") {
      icon = <Car className="h-6 w-6" />;
    } else if (newAction.category === "nature") {
      icon = <Leaf className="h-6 w-6" />;
    }

    // Build the final custom action object
    const customAction: CustomAction = {
      id: newId,
      icon,
      selected: false,
      category: newAction.category,
      title: newAction.title,
      description: newAction.description,
      reduction: newAction.reduction,
      effort: newAction.effort,
    };

    onAddAction(customAction);
    setNewAction({
      category: "",
      title: "",
      description: "",
      reduction: "",
      effort: "",
    });

    // Close modal after adding
    const modal = document.getElementById(
      "custom_action",
    ) as HTMLDialogElement | null;
    if (modal) modal.close();
  };

  const customActionState =
    newAction.category === "" ||
    newAction.title === "" ||
    newAction.description === "" ||
    newAction.reduction === "" ||
    newAction.effort === "";

  // Function to handle modal close on Cancel
  const handleCancel = () => {
    const modal = document.getElementById(
      "custom_action",
    ) as HTMLDialogElement | null;
    if (modal) modal.close();
  };

  return (
    <Modal id="custom_action" title="Add Custom Action">
      <div className="sm:max-w-md">
        <p className="mb-4">Create your own action to help reduce emissions</p>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={newAction.category}
              onChange={(e) =>
                setNewAction({ ...newAction, category: e.target.value })
              }
              className="input w-full"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="title">Action Title</label>
            <input
              id="title"
              placeholder="e.g., Install Solar Panels"
              value={newAction.title}
              onChange={(e) =>
                setNewAction({ ...newAction, title: e.target.value })
              }
              className="input w-full"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              placeholder="Briefly describe this action"
              value={newAction.description}
              onChange={(e) =>
                setNewAction({ ...newAction, description: e.target.value })
              }
              className="input w-full"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="category">Effort</label>
            <select
              id="effort"
              value={newAction.effort}
              onChange={(e) =>
                setNewAction({ ...newAction, effort: e.target.value })
              }
              className="input w-full"
            >
              <option value="">Select a category</option>
              {effortCategories.map((effort) => (
                <option key={effort.value} value={effort.value}>
                  {effort.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <label htmlFor="reduction">Estimated Reduction (%)</label>
            <input
              id="reduction"
              type="number"
              placeholder="e.g., 5"
              value={newAction.reduction}
              onChange={(e) =>
                setNewAction({ ...newAction, reduction: e.target.value })
              }
              min="1"
              max="100"
              className="input w-full"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          {customActionState && (
            <p className="mr-auto text-red-500">{t("customActionWarning")}</p>
          )}
          <button
            type="button"
            className="btn px-4 py-2"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={customActionState}
            onClick={handleAddAction}
            className="btn btn-primary rounded px-4 py-2 text-white"
          >
            Add Action
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CustomActionModal;
