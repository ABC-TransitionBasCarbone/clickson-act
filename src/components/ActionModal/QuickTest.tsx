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

const QuickTest: React.FC = () => {
  // Create a fully filled action with pending student changes
  const testAction: CustomAction = {
    id: "test-1",
    category: "energy",
    subcategory: "energy-renewable",
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
    // Pending changes from a student
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

  const handleActionSubmit = (action: CustomAction) => {
    console.log("Action submitted:", action);
    setEditingAction(null);
    alert("Action saved successfully!");
  };

  const handleApproveChanges = (action: CustomAction) => {
    console.log("Changes approved:", action);
    setEditingAction(null);
    alert("Student changes approved!");
  };

  const handleRejectChanges = (action: CustomAction) => {
    console.log("Changes rejected:", action);
    setEditingAction(null);
    alert("Student changes rejected!");
  };

  const handleCompleteAction = (action: CustomAction) => {
    console.log("Action completed:", action);
    setEditingAction(null);
    alert("Action marked as completed!");
  };

  return (
    <div className="mx-auto p-6 max-w-4xl">
      <h1 className="mb-6 font-bold text-3xl">Quick Approval Workflow Test</h1>

      <div className="bg-green-50 mb-6 p-4 border border-green-200 rounded-lg">
        <h2 className="mb-2 font-semibold text-green-800 text-lg">
          ✅ This action has:
        </h2>
        <ul className="space-y-1 text-green-700 text-sm">
          <li>
            • All required fields filled (category, title, description,
            reduction, effort)
          </li>
          <li>
            • Pending student changes in Steps, Monitoring, Performance, Key
            Contacts
          </li>
          <li>• needsApproval: true flag</li>
        </ul>
      </div>

      <div className="bg-blue-50 mb-6 p-4 border border-blue-200 rounded-lg">
        <h2 className="mb-2 font-semibold text-blue-800 text-lg">
          🎯 What you should see:
        </h2>
        <ol className="space-y-1 text-blue-700 text-sm">
          <li>1. Yellow notification: "Pending Student Changes"</li>
          <li>
            2. Student's modified text in Steps, Monitoring, Performance, Key
            Contacts fields
          </li>
          <li>3. "Complete Action" button (green)</li>
          <li>4. "Approve Changes" button (green)</li>
          <li>5. "Reject Changes" button (red)</li>
          <li>6. "Save Changes" button (blue) - should be enabled</li>
        </ol>
      </div>

      <button
        className="btn btn-primary btn-lg"
        onClick={() => setEditingAction(testAction)}
      >
        🚀 Open Action with Pending Changes
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

export default QuickTest;
