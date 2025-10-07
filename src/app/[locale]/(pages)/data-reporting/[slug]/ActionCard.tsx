import { Action } from "@/types/Action";
import React from "react";
import {
  Bolt,
  Plug,
  Lightbulb,
  BatteryCharging,
  Recycle,
  Trash2,
  Trash,
  FileMinus,
  Archive,
  TreeDeciduous,
  Flower,
  Leaf,
  Mountain,
  Droplet,
  Bike,
  Bus,
  Car,
  Fuel,
  Plus,
} from "lucide-react";
import EditActionModal from "@/components/ActionModal/EditActionModal";

interface Props {
  action: Action;
  isSelected: boolean;
  onSelect: (id: string) => void;
  calculatedReduction?: number; // Optional calculated reduction for display
  projectId?: string; // Project ID for creating custom actions
  categories?: { value: string; label: string }[]; // Categories for the edit modal
  effortCategories?: { value: string; label: string }[]; // Effort categories for the edit modal
  subcategoryOptions?: { value: string; label: string; categoryId?: string }[]; // Subcategory options for the edit modal
}

const categoryIcons: Record<string, React.FC[]> = {
  energy: [Bolt, Plug, Lightbulb, BatteryCharging],
  waste: [Recycle, Trash2, Trash, FileMinus, Archive],
  nature: [TreeDeciduous, Flower, Leaf, Mountain, Droplet],
  transport: [Bike, Bus, Car, Fuel],
};

const ActionCard: React.FC<Props> = ({
  action,
  isSelected,
  onSelect,
  calculatedReduction,
  projectId,
  categories = [],
  effortCategories = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ],
  subcategoryOptions = [],
}) => {
  const icons = categoryIcons[action.category as keyof typeof categoryIcons];
  const Icon = icons ? icons[0] : Bolt;

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card selection when clicking the edit button
    if ((e.target as HTMLElement).closest(".edit-button")) {
      return;
    }
    onSelect(action.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const modal = document.getElementById(
      "edit_action_modal",
    ) as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  };

  const handleEditModalClose = () => {
    const modal = document.getElementById(
      "edit_action_modal",
    ) as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
  };

  const handleEditModalSubmit = () => {
    // The modal handles the API call internally
    const modal = document.getElementById(
      "edit_action_modal",
    ) as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
  };

  return (
    <>
      <div
        className={`card cursor-pointer p-2.5 transition-all ${
          isSelected
            ? "border-primary-500! bg-primary-50!"
            : "hover:border-primary-200"
        }`}
        onClick={handleCardClick}
      >
        <div className="flex items-center">
          <div
            className={`mr-4 rounded-full p-2 ${
              isSelected
                ? "bg-primary-200 text-primary-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-grow">
            <h3 className="font-medium">{action.title}</h3>
            <p className="text-gray-500 text-sm">{action.description}</p>
            <div className="flex items-center gap-2 mt-2">
              {action.type && (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    action.type === "Direct"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {action.type}
                </span>
              )}
              {action.timeline && (
                <span className="text-primary text-xs">
                  Timeline: {action.timeline} year
                  {action.timeline !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div className="flex flex-col items-end">
              <span className="font-bold text-green-600 text-lg">
                -
                {Math.round(
                  (calculatedReduction !== undefined
                    ? calculatedReduction
                    : action.reduction) * 100,
                ) / 100}
                %
              </span>
              {calculatedReduction !== undefined &&
                calculatedReduction !== action.reduction && (
                  <span className="text-gray-400 text-xs">
                    (base: -{action.reduction}%)
                  </span>
                )}
            </div>

            <div className="flex items-center gap-2">
              {/* Modify Action Button */}
              <button
                className="btn-primary edit-button btn btn-sm"
                onClick={handleEditClick}
                title="Modify Action & Submit for Approval"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Action Modal */}
      <EditActionModal
        action={action}
        onSubmit={handleEditModalSubmit}
        categories={categories}
        effortCategories={effortCategories}
        subcategoryOptions={subcategoryOptions}
        onClose={handleEditModalClose}
        projectId={projectId}
      />
    </>
  );
};

export default ActionCard;
