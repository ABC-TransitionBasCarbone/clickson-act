"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, CheckCircle2 } from "lucide-react";
import ActionModal from "@/components/ActionModal";
import { Action } from "@/types/Action";
import { EmissionType } from "@/types/Emission";
import { useUser } from "@/context/UserContext";
import { useProjectData } from "@/hooks/useProjectData";
import { useRouter } from "@/i18n/navigation";

const EFFORT_CATEGORIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

interface CustomAction extends Action {
  selected: boolean;
  calculatedReduction?: number;
}

interface CompletedActionsProps {
  actions: CustomAction[];
  onActionClick: (action: CustomAction) => void;
}

const CompletedActions: React.FC<CompletedActionsProps> = ({
  actions,
  onActionClick,
}) => (
  <div className="card p-6">
    <div className="flex items-center justify-between pb-2">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <h2 className="text-xl font-bold">Completed Actions</h2>
      </div>
      <span className="text-primary-800 bg-primary-100 rounded-full px-2 py-1 text-xs">
        {actions.length} actions
      </span>
    </div>
    <p className="text-gray-600">Actions completed since the project started</p>
    <div className="mt-4 space-y-4">
      {actions.map((action) => (
        <div
          key={action.id}
          className="flex cursor-pointer justify-between rounded-md border-b border-gray-100 p-2 pb-3 last:border-0 hover:bg-gray-100"
          onClick={() => onActionClick(action)}
        >
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium">{action.title}</p>
              <p className="text-xs text-gray-500">
                {new Date(action.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <span className="font-medium text-green-600">
            -{action.calculatedReduction}%
          </span>
        </div>
      ))}
    </div>
  </div>
);

const Monitoring: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();

  // Use project data hook to get real project data
  const {
    completedActions: projectCompletedActions,
    loading,
    error,
  } = useProjectData();

  const [completedActions, setCompletedActions] = useState<CustomAction[]>([]);
  const [emissions, setEmissions] = useState<EmissionType[]>([]);
  const [editingAction, setEditingAction] = useState<CustomAction | null>(null);

  // Update local state when project data changes
  useEffect(() => {
    if (projectCompletedActions) {
      const convertedCompleted = projectCompletedActions.map((action) => ({
        ...action,
        selected: false,
        manager: action.studentName,
        nature: action.category,
        objectives: action.description,
        keyContacts: "",
        steps: "",
        calendar: action.dateCompleted || action.dateAdded,
        indicators: "",
        monitoring: "",
        performance: "",
        effort: "medium", // Default effort level
        timeline: 1, // Default timeline
        date: (action.dateCompleted || action.dateAdded).split("T")[0], // Convert ISO date to YYYY-MM-DD
        reduction: action.calculatedReduction, // Use calculated reduction as the main reduction value
      })) as CustomAction[];
      setCompletedActions(convertedCompleted);
    }
  }, [projectCompletedActions]);

  // Redirect to login if no user or passcode
  useEffect(() => {
    if (!user?.passcode) {
      router.push("/");
    }
  }, [user, router]);

  // Keep the emissions loading for now (this could be removed if not needed)
  useEffect(() => {
    fetch("/data/emissions.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch emission file");
        return res.json();
      })
      .then((data) => {
        if (data) setEmissions(data);
      })
      .catch((error) => console.error("Error loading emission file:", error));
  }, []);

  const handleActionClick = (action: CustomAction) => {
    setEditingAction(action);
    const modal = document.getElementById("custom_action") as HTMLDialogElement;
    if (modal) modal.showModal();
  };

  const handleSubmitEdit = (updatedAction: CustomAction) => {
    setCompletedActions((prevActions) =>
      prevActions.map((action) =>
        action.id === updatedAction.id
          ? { ...updatedAction, date: action.date }
          : action,
      ),
    );
  };

  return (
    <div className="bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-6 py-8"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold">All Actions</h1>
          <p className="mt-1 text-gray-500">
            Find All The Actions Of Your Project
          </p>
        </div>

        {loading && (
          <div className="mb-8 text-center">
            <p className="text-gray-500">Loading completed actions...</p>
          </div>
        )}

        {error && (
          <div className="mb-8 rounded-lg bg-red-50 p-4">
            <p className="text-red-700">Error: {error}</p>
          </div>
        )}

        <CompletedActions
          actions={completedActions}
          onActionClick={handleActionClick}
        />
      </motion.div>

      <ActionModal
        mode="edit"
        onSubmit={handleSubmitEdit}
        categories={emissions}
        effortCategories={EFFORT_CATEGORIES}
        initialAction={editingAction ?? undefined}
      />
    </div>
  );
};

export default Monitoring;
