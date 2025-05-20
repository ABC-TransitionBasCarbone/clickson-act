import React from "react";
import { Zap, Recycle, Car, Leaf } from "lucide-react";
import ActionModal from "@/components/ActionModal";
import { Action } from "@/types/Action";

type AddActionModalWrapperProps = {
  onAddAction: (action: Action) => void;
};

export const AddActionModalWrapper: React.FC<AddActionModalWrapperProps> = ({
  onAddAction,
}) => {
  return (
    <ActionModal
      mode="create"
      onSubmit={(action) =>
        onAddAction({
          ...action,
          reduction: parseInt(action.reduction),
          selected: false,
        })
      }
      categories={[
        { value: "energy", label: "Energy", icon: <Zap className="h-4 w-4" /> },
        {
          value: "waste",
          label: "Waste",
          icon: <Recycle className="h-4 w-4" />,
        },
        {
          value: "transport",
          label: "Transport",
          icon: <Car className="h-4 w-4" />,
        },
        {
          value: "nature",
          label: "Nature",
          icon: <Leaf className="h-4 w-4" />,
        },
      ]}
      effortCategories={[
        { value: "easy", label: "Easy", color: "#000" },
        { value: "medium", label: "Medium", color: "#000" },
        { value: "hard", label: "Hard", color: "#000" },
      ]}
    />
  );
};
