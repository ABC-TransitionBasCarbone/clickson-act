import React, { useState } from "react";
import ActionModal from "./ActionModal";
import { Action } from "@/types/Action";

interface CustomAction extends Action {
  selected: boolean;
  status?: "Completed" | "Selected" | "Available";
  assignedTo?: string;
  timeline?: number;
  subcategory?: string;
  pendingChanges?: {
    steps?: string;
    monitoring?: string;
    performance?: string;
    keyContacts?: string;
    changedBy?: string;
    changedAt?: string;
  };
  needsApproval?: boolean;
}

const DebugValidation: React.FC = () => {
  // Create an action with some missing required fields
  const incompleteAction: CustomAction = {
    id: "debug-1",
    category: "energy", // ✅ Has category
    subcategory: "", // ❌ Missing subcategory
    title: "Test Action", // ✅ Has title
    description: "Test description", // ✅ Has description
    reduction: 10, // ✅ Has reduction
    effort: "", // ❌ Missing effort
    manager: "Test Manager",
    nature: "Direct",
    objectives: "Test objectives",
    keyContacts: "Test contacts",
    steps: "Test steps",
    calendar: "Test calendar",
    indicators: "Test indicators",
    monitoring: "Test monitoring",
    performance: "Test performance",
    date: "2024-01-15",
    timeline: 1,
    selected: false,
    status: "Selected",
    assignedTo: "Test Group",
  };

  const [editingAction, setEditingAction] = useState<CustomAction | null>(null);

  const handleActionSubmit = (action: CustomAction) => {
    console.log("Action submitted:", action);
    setEditingAction(null);
    alert("Action saved!");
  };

  const handleApproveChanges = (action: CustomAction) => {
    console.log("Changes approved:", action);
    setEditingAction(null);
    alert("Changes approved!");
  };

  const handleRejectChanges = (action: CustomAction) => {
    console.log("Changes rejected:", action);
    setEditingAction(null);
    alert("Changes rejected!");
  };

  const handleCompleteAction = (action: CustomAction) => {
    console.log("Action completed:", action);
    setEditingAction(null);
    alert("Action completed!");
  };

  return (
    <div className="mx-auto p-6 max-w-4xl">
      <h1 className="mb-6 font-bold text-3xl">🔍 Debug Validation Issues</h1>

      <div className="bg-red-50 mb-6 p-4 border border-red-200 rounded-lg">
        <h2 className="mb-2 font-semibold text-red-800 text-lg">
          ❌ This action has validation issues:
        </h2>
        <ul className="space-y-1 text-red-700 text-sm">
          <li>• ❌ Missing subcategory (required field)</li>
          <li>• ❌ Missing effort (required field)</li>
          <li>• ✅ Has category, title, description, reduction</li>
        </ul>
        <p className="mt-2 text-red-600 text-sm">
          <strong>Result:</strong> Save button will be DISABLED until you fill
          in the missing required fields.
        </p>
      </div>

      <div className="bg-yellow-50 mb-6 p-4 border border-yellow-200 rounded-lg">
        <h2 className="mb-2 font-semibold text-yellow-800 text-lg">
          🔧 How to fix:
        </h2>
        <ol className="space-y-1 text-yellow-700 text-sm">
          <li>1. Click "Open Action" below</li>
          <li>2. Click "Edit" button</li>
          <li>3. Fill in the missing fields:</li>
          <ul className="mt-1 ml-4">
            <li>• Select a subcategory from the dropdown</li>
            <li>• Select an effort level (Easy/Medium/Hard)</li>
          </ul>
          <li>4. Save button should now be enabled</li>
        </ol>
      </div>

      <button
        className="btn btn-primary btn-lg"
        onClick={() => setEditingAction(incompleteAction)}
      >
        🔍 Open Action with Validation Issues
      </button>

      {editingAction && (
        <ActionModal
          mode="edit"
          initialAction={editingAction}
          onSubmit={handleActionSubmit}
          onApproveChanges={handleApproveChanges}
          onRejectChanges={handleRejectChanges}
          onCompleteAction={handleCompleteAction}
          categories={[
            { value: "energy", label: "Energy" },
            { value: "waste", label: "Waste" },
            { value: "transport", label: "Transport" },
            { value: "nature", label: "Nature" },
          ]}
          subcategoryOptions={[
            { value: "energy-renewable", label: "Renewable Energy" },
            { value: "energy-efficiency", label: "Energy Efficiency" },
            { value: "energy-solar", label: "Solar Power" },
            { value: "waste-reduction", label: "Waste Reduction" },
            { value: "waste-recycling", label: "Recycling" },
            { value: "transport-public", label: "Public Transport" },
            { value: "transport-walking", label: "Walking/Cycling" },
            { value: "nature-trees", label: "Tree Planting" },
            { value: "nature-garden", label: "School Garden" },
          ]}
          effortCategories={[
            { value: "easy", label: "Easy" },
            { value: "medium", label: "Medium" },
            { value: "hard", label: "Hard" },
          ]}
        />
      )}
    </div>
  );
};

export default DebugValidation;
