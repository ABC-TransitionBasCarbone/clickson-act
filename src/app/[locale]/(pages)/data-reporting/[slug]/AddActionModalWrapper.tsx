import React from "react";
import ActionModal from "@/components/ActionModal";
import { Action } from "@/types/Action";

interface CustomAction extends Action {
  selected: boolean;
}

type AddActionModalWrapperProps = {
  onAddAction: (action: CustomAction) => void;
  categories?: { value: string; label: string }[];
  subcategoryOptions?: { value: string; label: string; categoryId?: string }[];
};

export const AddActionModalWrapper: React.FC<AddActionModalWrapperProps> = ({
  onAddAction,
  categories = [
    { value: "energy", label: "Energy" },
    { value: "waste", label: "Waste" },
    { value: "transport", label: "Transport" },
    { value: "nature", label: "Nature" },
  ],
  subcategoryOptions = [],
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
      categories={categories}
      subcategoryOptions={subcategoryOptions}
      effortCategories={[
        { value: "easy", label: "Easy" },
        { value: "medium", label: "Medium" },
        { value: "hard", label: "Hard" },
      ]}
      allowAllFieldsEdit={true}
    />
  );
};
