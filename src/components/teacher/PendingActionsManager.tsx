import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { PendingAction } from "@/types/PendingAction";
import { useToast } from "@/context/ToastContext";

interface PendingActionsManagerProps {
  projectId: string;
  teacherId: string;
  onActionReviewed?: () => void;
}

const PendingActionsManager: React.FC<PendingActionsManagerProps> = ({
  projectId,
  teacherId,
  onActionReviewed,
}) => {
  const t = useTranslations("TeacherDashboard");
  const { showToast } = useToast();

  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingActions, setReviewingActions] = useState<Set<string>>(
    new Set(),
  );

  // Load pending actions
  useEffect(() => {
    const fetchPendingActions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/project/${projectId}/pending-actions`,
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched pending actions:", data.pendingActions);
          setPendingActions(data.pendingActions || []);
        } else {
          const errorData = await response.json();
          console.error("Failed to fetch pending actions:", errorData);
          showToast(
            "error",
            "Error",
            errorData.error || "Failed to load pending actions",
            5000,
          );
        }
      } catch (error) {
        console.error("Error fetching pending actions:", error);
        showToast("error", "Error", "Failed to load pending actions", 5000);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchPendingActions();
    }
  }, [projectId, showToast]);

  const handleReviewAction = async (
    pendingActionId: string,
    action: "approve" | "reject",
    reviewNotes?: string,
  ) => {
    try {
      setReviewingActions((prev) => new Set(prev).add(pendingActionId));

      const response = await fetch(
        `/api/project/${projectId}/pending-actions`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pendingActionId,
            action,
            teacherId,
            reviewNotes,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} action`);
      }

      // Remove the action from pending list
      setPendingActions((prev) =>
        prev.filter((pa) => pa.id !== pendingActionId),
      );

      showToast(
        "success",
        "Success",
        `Action ${action === "approve" ? "approved" : "rejected"} successfully`,
        4000,
      );

      if (onActionReviewed) {
        onActionReviewed();
      }
    } catch (error) {
      console.error(`Error ${action}ing action:`, error);
      showToast(
        "error",
        "Error",
        error instanceof Error ? error.message : `Failed to ${action} action`,
        5000,
      );
    } finally {
      setReviewingActions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(pendingActionId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex justify-center items-center py-8">
          <div className="loading loading-spinner loading-lg"></div>
          <span className="ml-2">Loading pending actions...</span>
        </div>
      </div>
    );
  }

  if (pendingActions.length === 0) {
    return (
      <div className="card">
        <div className="py-8 text-center">
          <h3 className="mb-2 font-semibold text-xl">No Pending Actions</h3>
          <p className="text-gray-600">
            All student actions have been reviewed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-6">
        <h3 className="font-bold text-2xl">Pending Student Actions</h3>
        <p className="mt-2 text-gray-600">
          Review and approve or reject actions submitted by students.
        </p>
      </div>

      <div className="space-y-4">
        {pendingActions.map((action) => (
          <div
            key={action.id}
            className="bg-yellow-50 p-4 border border-yellow-200 rounded-lg"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-lg">{action.actionTitle}</h4>
                <p className="mt-1 text-gray-600 text-sm">
                  by {action.studentName} •{" "}
                  {new Date(action.submittedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-gray-500 text-sm">Impact</div>
                <div className="font-bold text-green-600 text-lg">
                  {action.calculatedReduction.toFixed(2)}%
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-gray-700">{action.actionDescription}</p>

              <div className="text-gray-600 text-sm">
                <div>
                  <strong>Category:</strong> {action.categoryData.categoryName}
                </div>
                {action.categoryData.subcategoryData &&
                  action.categoryData.subcategoryData.length > 0 && (
                    <div>
                      <strong>Subcategories:</strong>{" "}
                      {action.categoryData.subcategoryData
                        .map((sub) => sub.subcategoryName)
                        .join(", ")}
                    </div>
                  )}
                <div>
                  <strong>Type of impact:</strong> {action.actionType}
                </div>
              </div>
            </div>

            {action.actionType === "Custom" && action.customActionData && (
              <div className="bg-blue-50 mb-4 p-3 border border-blue-200 rounded">
                <h5 className="mb-2 font-medium text-blue-900">
                  Custom Action Details
                </h5>
                <div className="text-blue-800 text-sm">
                  <div>
                    <strong>Effort:</strong> {action.customActionData.effort}
                  </div>
                  <div>
                    <strong>Timeline:</strong>{" "}
                    {action.customActionData.timeline} year(s)
                  </div>
                  <div>
                    <strong>Reduction:</strong>{" "}
                    {action.customActionData.reduction}%
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleReviewAction(action.id, "approve")}
                disabled={reviewingActions.has(action.id)}
                className="btn btn-success btn-sm"
              >
                {reviewingActions.has(action.id) ? (
                  <div className="loading loading-spinner loading-xs"></div>
                ) : (
                  "Approve"
                )}
              </button>
              <button
                onClick={() =>
                  handleReviewAction(
                    action.id,
                    "reject",
                    "Action rejected by teacher",
                  )
                }
                disabled={reviewingActions.has(action.id)}
                className="btn btn-error btn-sm"
              >
                {reviewingActions.has(action.id) ? (
                  <div className="loading loading-spinner loading-xs"></div>
                ) : (
                  "Reject"
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingActionsManager;
