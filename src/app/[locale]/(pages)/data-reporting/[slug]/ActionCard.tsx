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

interface Props {
  action: Action;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onAddToMonitoring?: (actionId: string) => void;
  showMonitoringButton?: boolean;
  isAddingToMonitoring?: boolean;
  calculatedReduction?: number; // Optional calculated reduction for display
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
  onAddToMonitoring,
  showMonitoringButton = false,
  isAddingToMonitoring = false,
  calculatedReduction,
}) => {
  const icons = categoryIcons[action.category as keyof typeof categoryIcons];
  const Icon = icons ? icons[0] : Bolt;

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card selection when clicking the monitoring button
    if ((e.target as HTMLElement).closest(".monitoring-button")) {
      return;
    }
    onSelect(action.id);
  };

  const handleAddToMonitoring = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToMonitoring && !isAddingToMonitoring) {
      onAddToMonitoring(action.id);
    }
  };

  return (
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

          {showMonitoringButton && (
            <button
              className="monitoring-button btn btn-sm btn-primary"
              onClick={handleAddToMonitoring}
              disabled={isAddingToMonitoring}
              title="Add to Monitoring Screen"
            >
              {isAddingToMonitoring ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionCard;
