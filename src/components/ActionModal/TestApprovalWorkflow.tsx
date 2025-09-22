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

const TestApprovalWorkflow: React.FC = () => {
  // Create a test action with pending student changes
  const testActionWithPendingChanges: CustomAction = {
    id: "test-action-1",
    category: "energy",
    subcategory: "renewable-energy",
    title: "Install Solar Panels",
    description:
      "Install solar panels on school roof to reduce energy consumption",
    reduction: 15,
    effort: "medium",
    manager: "John Doe",
    nature: "Direct",
    objectives: "Reduce school's carbon footprint by 15%",
    keyContacts: "Solar company contact: 555-1234",
    steps:
      "1. Get quotes from solar companies\n2. Present proposal to school board\n3. Install panels",
    calendar: "Q1 2024: Planning\nQ2 2024: Installation",
    indicators: "Monthly energy bills",
    monitoring: "Track monthly energy consumption",
    performance: "Measure energy savings monthly",
    date: "2024-01-15",
    timeline: 1,
    selected: false,
    status: "Selected",
    assignedTo: "Student Group A",
    // This is the key part - pending changes from a student
    pendingChanges: {
      steps:
        "1. Get quotes from solar companies\n2. Present proposal to school board\n3. Install panels\n4. Monitor performance for 6 months",
      monitoring:
        "Track monthly energy consumption and report to school board quarterly",
      performance:
        "Measure energy savings monthly and create quarterly reports",
      keyContacts:
        "Solar company contact: 555-1234\nSchool board contact: 555-5678",
      changedBy: "student123",
      changedAt: "2024-01-20T10:30:00Z",
    },
    needsApproval: true,
  };

  const [editingAction, setEditingAction] = useState<CustomAction | null>(null);

  // Handle action submission (create or update)
  const handleActionSubmit = (action: CustomAction) => {
    console.log("Action submitted:", action);
    setEditingAction(null);
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

      console.log("Changes approved:", updatedAction);
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

    console.log("Changes rejected:", updatedAction);
    setEditingAction(null);
  };

  // Handle completing an action
  const handleCompleteAction = (action: CustomAction) => {
    const updatedAction = {
      ...action,
      status: "Completed" as const,
    };

    console.log("Action completed:", updatedAction);
    setEditingAction(null);
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 font-bold text-2xl">Test Approval Workflow</h1>

      <div className="mb-4">
        <p className="mb-2 text-gray-600">
          This demonstrates the approval workflow. The action below has pending
          changes from a student.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => setEditingAction(testActionWithPendingChanges)}
        >
          Open Action with Pending Changes
        </button>
      </div>

      <div className="bg-yellow-50 mb-4 p-4 rounded-lg">
        <h3 className="font-bold text-yellow-800">Expected Behavior:</h3>
        <ul className="mt-2 text-yellow-700 text-sm">
          <li>• Teacher should see "Pending Student Changes" notification</li>
          <li>
            • Teacher should see "Approve Changes" and "Reject Changes" buttons
          </li>
          <li>• Teacher should see "Complete Action" button</li>
          <li>• Teacher can edit all fields directly</li>
          <li>• Student changes are shown in the editable fields</li>
        </ul>
      </div>

      <div className="bg-blue-50 mb-4 p-4 rounded-lg">
        <h3 className="font-bold text-blue-800">Step-by-Step Instructions:</h3>
        <ol className="mt-2 text-blue-700 text-sm">
          <li>1. Click "Open Action with Pending Changes" button below</li>
          <li>
            2. You should see a yellow notification about pending student
            changes
          </li>
          <li>3. Click the "Edit" button to enter edit mode</li>
          <li>4. You should now see these buttons at the bottom:</li>
          <ul className="mt-1 ml-4">
            <li>• "Complete Action" (green button)</li>
            <li>• "Approve Changes" (green button)</li>
            <li>• "Reject Changes" (red button)</li>
            <li>• "Save Changes" (blue button)</li>
          </ul>
          <li>5. You can edit any field and click "Save Changes"</li>
        </ol>
      </div>

      {/* Action Edit Modal */}
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

export default TestApprovalWorkflow;
