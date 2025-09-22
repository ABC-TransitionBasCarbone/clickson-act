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

const ExampleUsage: React.FC = () => {
  const [actions, setActions] = useState<CustomAction[]>([]);
  const [editingAction, setEditingAction] = useState<CustomAction | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Handle action submission (create or update)
  const handleActionSubmit = (action: CustomAction) => {
    if (editingAction) {
      // Update existing action
      setActions((prev) => prev.map((a) => (a.id === action.id ? action : a)));
      setEditingAction(null);
    } else {
      // Add new action
      setActions((prev) => [...prev, action]);
      setShowCreateModal(false);
    }
  };

  // Handle approving student changes
  const handleApproveChanges = (action: CustomAction) => {
    if (action.pendingChanges) {
      // Apply the pending changes to the action
      const updatedAction = {
        ...action,
        steps: action.pendingChanges.steps || action.steps,
        monitoring: action.pendingChanges.monitoring || action.monitoring,
        performance: action.pendingChanges.performance || action.performance,
        keyContacts: action.pendingChanges.keyContacts || action.keyContacts,
        pendingChanges: undefined,
        needsApproval: false,
      };

      setActions((prev) =>
        prev.map((a) => (a.id === action.id ? updatedAction : a)),
      );
      setEditingAction(null);
    }
  };

  // Handle rejecting student changes
  const handleRejectChanges = (action: CustomAction) => {
    const updatedAction = {
      ...action,
      pendingChanges: undefined,
      needsApproval: false,
    };

    setActions((prev) =>
      prev.map((a) => (a.id === action.id ? updatedAction : a)),
    );
    setEditingAction(null);
  };

  // Handle completing an action
  const handleCompleteAction = (action: CustomAction) => {
    const updatedAction = {
      ...action,
      status: "Completed" as const,
    };

    setActions((prev) =>
      prev.map((a) => (a.id === action.id ? updatedAction : a)),
    );
    setEditingAction(null);
  };

  // Handle deleting an action
  const handleDeleteAction = (action: CustomAction) => {
    setActions((prev) => prev.filter((a) => a.id !== action.id));
    setEditingAction(null);
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 font-bold text-2xl">Action Modal Example</h1>

      <div className="mb-4">
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          Add New Action
        </button>
      </div>

      <div className="space-y-2">
        {actions.map((action) => (
          <div key={action.id} className="p-4 card">
            <h3 className="font-bold">{action.title}</h3>
            <p className="text-gray-600 text-sm">{action.description}</p>
            <div className="flex gap-2 mt-2">
              <button
                className="btn-outline btn btn-sm"
                onClick={() => setEditingAction(action)}
              >
                Edit
              </button>
              {action.needsApproval && (
                <span className="badge badge-warning">Needs Approval</span>
              )}
              {action.status === "Completed" && (
                <span className="badge badge-success">Completed</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Action Modal */}
      {showCreateModal && (
        <ActionModal
          mode="create"
          onSubmit={handleActionSubmit}
          categories={[
            { value: "energy", label: "Energy" },
            { value: "waste", label: "Waste" },
            { value: "transport", label: "Transport" },
            { value: "nature", label: "Nature" },
          ]}
          effortCategories={[
            { value: "easy", label: "Easy" },
            { value: "medium", label: "Medium" },
            { value: "hard", label: "Hard" },
          ]}
        />
      )}

      {/* Edit Action Modal */}
      {editingAction && (
        <ActionModal
          mode="edit"
          initialAction={editingAction}
          onSubmit={handleActionSubmit}
          onDelete={handleDeleteAction}
          onApproveChanges={handleApproveChanges}
          onRejectChanges={handleRejectChanges}
          onCompleteAction={handleCompleteAction}
          categories={[
            { value: "energy", label: "Energy" },
            { value: "waste", label: "Waste" },
            { value: "transport", label: "Transport" },
            { value: "nature", label: "Nature" },
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

export default ExampleUsage;
