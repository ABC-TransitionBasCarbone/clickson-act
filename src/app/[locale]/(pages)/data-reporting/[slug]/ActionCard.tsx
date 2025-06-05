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
} from "lucide-react";

interface Props {
  action: Action;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const categoryIcons: Record<string, React.FC[]> = {
  energy: [Bolt, Plug, Lightbulb, BatteryCharging],
  waste: [Recycle, Trash2, Trash, FileMinus, Archive],
  nature: [TreeDeciduous, Flower, Leaf, Mountain, Droplet],
  transport: [Bike, Bus, Car, Fuel],
};

const ActionCard: React.FC<Props> = ({ action, isSelected, onSelect }) => {
  const icons = categoryIcons[action.category as keyof typeof categoryIcons];
  const Icon = icons ? icons[0] : Bolt;

  return (
    <div
      className={`card cursor-pointer p-2.5 transition-all ${
        isSelected
          ? "border-primary-500! bg-primary-50!"
          : "hover:border-primary-200"
      }`}
      onClick={() => onSelect(action.id)}
    >
      <div className="flex items-center">
        <div
          className={`mr-4 rounded-full p-2 ${
            isSelected
              ? "bg-primary-200 text-primary-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-grow">
          <h3 className="font-medium">{action.title}</h3>
          <p className="text-sm text-gray-500">{action.description}</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-green-600">
            -{action.reduction}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActionCard;
