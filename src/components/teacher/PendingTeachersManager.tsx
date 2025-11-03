import React, { useState, useEffect } from "react";
import { authenticatedFetch } from "@/lib/auth-utils";
import { useToast } from "@/context/ToastContext";
import { Check, X, UserPlus } from "lucide-react";

interface PendingTeacher {
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  requestedAt: string;
}

const PendingTeachersManager: React.FC = () => {
  const { showToast } = useToast();
  const [pendingTeachers, setPendingTeachers] = useState<PendingTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchPendingTeachers = async () => {
    try {
      const response = await authenticatedFetch("/api/teacher/pending-approval");
      const data = await response.json();

      if (data.success) {
        setPendingTeachers(data.pendingTeachers || []);
      } else {
        // If error is that user is not referent, just show empty state
        if (!data.error?.includes("referent")) {
          console.error("Error fetching pending teachers:", data.error);
        }
        setPendingTeachers([]);
      }
    } catch (error) {
      console.error("Error fetching pending teachers:", error);
      setPendingTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTeachers();
  }, []);

  const handleApprove = async (teacherId: string) => {
    try {
      setProcessing(teacherId);
      const response = await authenticatedFetch("/api/teacher/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teacherId, action: "approve" }),
      });

      const data = await response.json();

      if (data.success) {
        showToast("success", "Success", "Teacher approved successfully", 3000);
        // Remove from list
        setPendingTeachers((prev) =>
          prev.filter((pt) => pt.teacherId !== teacherId),
        );
      } else {
        showToast("error", "Error", data.error || "Failed to approve teacher", 5000);
      }
    } catch (error) {
      console.error("Error approving teacher:", error);
      showToast("error", "Error", "Failed to approve teacher", 5000);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (teacherId: string) => {
    if (
      !confirm(
        "Are you sure you want to reject this teacher? Their account will be deleted.",
      )
    ) {
      return;
    }

    try {
      setProcessing(teacherId);
      const response = await authenticatedFetch("/api/teacher/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teacherId, action: "reject" }),
      });

      const data = await response.json();

      if (data.success) {
        showToast("success", "Success", "Teacher rejected", 3000);
        // Remove from list
        setPendingTeachers((prev) =>
          prev.filter((pt) => pt.teacherId !== teacherId),
        );
      } else {
        showToast("error", "Error", data.error || "Failed to reject teacher", 5000);
      }
    } catch (error) {
      console.error("Error rejecting teacher:", error);
      showToast("error", "Error", "Failed to reject teacher", 5000);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex justify-center items-center py-8">
          <div className="loading loading-spinner loading-lg"></div>
          <span className="ml-2">Loading pending teachers...</span>
        </div>
      </div>
    );
  }

  if (pendingTeachers.length === 0) {
    return null; // Don't show anything if no pending teachers
  }

  return (
    <div className="card">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-orange-600" />
          <h3 className="font-bold text-2xl">Pending Teacher Approvals</h3>
        </div>
        <p className="mt-2 text-gray-600">
          Teachers waiting for your approval to join this school
        </p>
      </div>

      <div className="space-y-4">
        {pendingTeachers.map((teacher) => (
          <div
            key={teacher.teacherId}
            className="flex justify-between items-center bg-orange-50 p-4 border border-orange-200 rounded-lg"
          >
            <div className="flex-1">
              <h4 className="font-semibold text-lg">{teacher.teacherName}</h4>
              <p className="text-gray-600 text-sm">{teacher.teacherEmail}</p>
              <p className="mt-1 text-gray-500 text-xs">
                Requested: {new Date(teacher.requestedAt).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleApprove(teacher.teacherId)}
                disabled={processing === teacher.teacherId}
                className="flex items-center gap-1 btn btn-success btn-sm"
                title="Approve teacher"
              >
                {processing === teacher.teacherId ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Check size={16} />
                )}
                Approve
              </button>
              <button
                onClick={() => handleReject(teacher.teacherId)}
                disabled={processing === teacher.teacherId}
                className="flex items-center gap-1 btn btn-error btn-sm"
                title="Reject teacher"
              >
                {processing === teacher.teacherId ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <X size={16} />
                )}
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingTeachersManager;


