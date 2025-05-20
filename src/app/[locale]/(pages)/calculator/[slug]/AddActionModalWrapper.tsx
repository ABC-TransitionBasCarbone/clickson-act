import React from "react";
import ActionModal from "@/components/ActionModal";
import { Action } from "@/types/Action";

interface CustomAction extends Action {
  selected: boolean;
}

type AddActionModalWrapperProps = {
  onAddAction: (action: CustomAction) => void;
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
          reduction: action.reduction,
          selected: false,
        })
      }
      categories={[
        { value: "energy", label: "Energy" },
        {
          value: "waste",
          label: "Waste",
        },
        {
          value: "transport",
          label: "Transport",
        },
        {
          value: "nature",
          label: "Nature",
        },
      ]}
      effortCategories={[
        { value: "easy", label: "Easy" },
        { value: "medium", label: "Medium" },
        { value: "hard", label: "Hard" },
      ]}
    />
  );
};
