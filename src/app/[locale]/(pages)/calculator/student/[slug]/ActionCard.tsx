import React, { ReactNode } from "react";

interface Props {
  action: {
    id: string;
    title: string;
    description: string;
    reduction: number;
    icon: ReactNode;
  };
  isSelected: boolean;
  schoolGoal: number;
  onSelect: (id: string) => void;
}

const ActionCard: React.FC<Props> = ({
  action,
  isSelected,
  schoolGoal,
  onSelect,
}) => {
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
          {action.icon && action.icon}
        </div>
        <div className="flex-grow">
          <h3 className="font-medium">{action.title}</h3>
          <p className="text-sm text-gray-500">{action.description}</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-green-600">
            -{Math.ceil((action.reduction / schoolGoal) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActionCard;
