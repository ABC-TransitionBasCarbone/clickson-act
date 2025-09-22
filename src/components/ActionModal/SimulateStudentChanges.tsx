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

const SimulateStudentChanges: React.FC = () => {
  // Create a base action (what teacher originally created)
  const baseAction: CustomAction = {
    id: "action-1",
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
  };

  const [editingAction, setEditingAction] = useState<CustomAction | null>(null);
  const [userRole, setUserRole] = useState<"student" | "teacher">("student");

  const handleActionSubmit = (action: CustomAction) => {
    if (userRole === "student") {
      console.log("Student submitted changes for approval:", action);
      alert("Changes submitted for teacher approval!");
    } else {
      console.log("Teacher saved action:", action);
      alert("Action saved successfully!");
    }
    setEditingAction(null);
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
      <h1 className="mb-6 font-bold text-3xl">
        Simulate Student vs Teacher Experience
      </h1>

      <div className="mb-6">
        <label className="block mb-2 font-medium text-sm">
          Switch User Role:
        </label>
        <div className="flex gap-4">
          <button
            className={`btn ${userRole === "student" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setUserRole("student")}
          >
            👨‍🎓 Student View
          </button>
          <button
            className={`btn ${userRole === "teacher" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setUserRole("teacher")}
          >
            👨‍🏫 Teacher View
          </button>
        </div>
      </div>

      <div
        className={`mb-6 rounded-lg border p-4 ${userRole === "student" ? "border-blue-200 bg-blue-50" : "border-green-200 bg-green-50"}`}
      >
        <h2
          className={`mb-2 text-lg font-semibold ${userRole === "student" ? "text-blue-800" : "text-green-800"}`}
        >
          {userRole === "student"
            ? "👨‍🎓 Student Experience:"
            : "👨‍🏫 Teacher Experience:"}
        </h2>
        <ul
          className={`space-y-1 text-sm ${userRole === "student" ? "text-blue-700" : "text-green-700"}`}
        >
          {userRole === "student" ? (
            <>
              <li>
                • Can only edit: Steps, Monitoring, Performance, Key Contacts
              </li>
              <li>• Other fields are disabled/grayed out</li>
              <li>• Sees "Submit for Approval" button</li>
              <li>• Changes are stored as pending until teacher approves</li>
            </>
          ) : (
            <>
              <li>• Can edit ALL fields</li>
              <li>• Sees "Save Changes" button</li>
              <li>
                • If action has pending student changes, sees approval buttons
              </li>
              <li>
                • Can approve/reject student changes or complete the action
              </li>
            </>
          )}
        </ul>
      </div>

      <button
        className="btn btn-primary btn-lg"
        onClick={() => setEditingAction(baseAction)}
      >
        {userRole === "student"
          ? "👨‍🎓 Edit Action as Student"
          : "👨‍🏫 Edit Action as Teacher"}
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

export default SimulateStudentChanges;
