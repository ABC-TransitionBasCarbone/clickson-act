"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit, School, Trash2, Plus } from "lucide-react";
import { useUser } from "../../../../context/UserContext";
import { useRouter } from "next/navigation";
import { School as SchoolType } from "../../../../types/School";
import AdminModal from "../../../../components/admin/AdminModal";
import EmissionCategoriesManager from "../../../../components/admin/EmissionCategoriesManager";
import ActionsManager from "../../../../components/admin/ActionsManager";

interface SchoolData extends SchoolType {
  teacherCount?: number;
  studentCount?: number;
}

const AdminDashboard: React.FC = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolData | null>(null);
  const [newSchool, setNewSchool] = useState({
    name: "",
    goal: 40,
    deadlineYear: "2030",
  });
  const [activeTab, setActiveTab] = useState<
    "schools" | "categories" | "actions"
  >("schools");

  // Check if user is admin
  useEffect(() => {
    if (isLoaded && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, isLoaded, router]);

  // Fetch schools
  const fetchSchools = async () => {
    try {
      const response = await fetch("/api/schools");

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Schools API error:", errorData);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setSchools(data.schools);
      } else {
        console.error("Schools API returned success: false", data);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchSchools();
    }
  }, [user]);

  const handleCreateSchool = async () => {
    try {
      const response = await fetch("/api/school", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSchool),
      });

      const data = await response.json();
      if (data.success) {
        setSchools((prev) => [...prev, data.school]);
        const modal = document.getElementById(
          "create-school-modal",
        ) as HTMLDialogElement;
        if (modal) modal.close();
        setNewSchool({ name: "", goal: 40, deadlineYear: "2030" });
      } else {
        console.error("Failed to create school:", data.error);
      }
    } catch (error) {
      console.error("Error creating school:", error);
    }
  };

  const handleUpdateSchool = async () => {
    if (!editingSchool) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/school/${editingSchool.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingSchool.name,
          goal: editingSchool.goal,
          deadlineYear: editingSchool.deadlineYear,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSchools((prev) =>
          prev.map((s) => (s.id === editingSchool.id ? editingSchool : s)),
        );
        setEditingSchool(null);
      }
    } catch (error) {
      console.error("Error updating school:", error);
    }
  };

  const handleDeleteSchool = async (id: string) => {
    if (!confirm("Are you sure you want to delete this school?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/school/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setSchools((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (error) {
      console.error("Error deleting school:", error);
    }
  };

  const handleInitializeSchools = async () => {
    try {
      setInitializing(true);

      const response = await fetch("/api/schools/init", {
        method: "POST",
      });

      const data = await response.json();
      if (data.success) {
        // Refresh the schools list
        fetchSchools();
      } else {
        console.error("Failed to initialize schools:", data.error);
      }
    } catch (error) {
      console.error("Error initializing schools:", error);
    } finally {
      setInitializing(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Access Denied
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8 container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="font-bold text-gray-900 text-3xl">
                Admin Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Manage schools and administrators
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-gray-200 border-b">
            <nav className="flex space-x-8 -mb-px">
              <button
                onClick={() => setActiveTab("schools")}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === "schools"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Schools Management
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === "categories"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Emission Categories
              </button>
              <button
                onClick={() => setActiveTab("actions")}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === "actions"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Actions
              </button>
            </nav>
          </div>
        </div>

        {/* Create School Modal */}
        <AdminModal
          id="create-school-modal"
          title="Create New School"
          onClose={() => {
            const modal = document.getElementById(
              "create-school-modal",
            ) as HTMLDialogElement;
            if (modal) modal.close();
          }}
        >
          <div className="mb-4">
            <label className="block mb-1">School Name</label>
            <input
              type="text"
              value={newSchool.name}
              onChange={(e) =>
                setNewSchool({ ...newSchool, name: e.target.value })
              }
              className="input-bordered w-full input"
              placeholder="Enter school name"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Goal (%)</label>
            <input
              type="number"
              value={newSchool.goal}
              onChange={(e) =>
                setNewSchool({ ...newSchool, goal: Number(e.target.value) })
              }
              className="input-bordered w-full input"
              min="0"
              max="100"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Deadline Year</label>
            <input
              type="number"
              value={newSchool.deadlineYear}
              onChange={(e) =>
                setNewSchool({ ...newSchool, deadlineYear: e.target.value })
              }
              className="input-bordered w-full input"
              min={new Date().getFullYear()}
              max={new Date().getFullYear() + 50}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                const modal = document.getElementById(
                  "create-school-modal",
                ) as HTMLDialogElement;
                if (modal) modal.close();
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateSchool}
            >
              Create
            </button>
          </div>
        </AdminModal>

        {/* Edit School Modal */}
        <AdminModal
          id="edit-school-modal"
          title="Edit School"
          onClose={() => setEditingSchool(null)}
        >
          <div className="mb-4">
            <label className="block mb-1">School Name</label>
            <input
              type="text"
              value={editingSchool?.name || ""}
              onChange={(e) =>
                setEditingSchool(
                  editingSchool
                    ? { ...editingSchool, name: e.target.value }
                    : null,
                )
              }
              className="input-bordered w-full input"
              placeholder="Enter school name"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Goal (%)</label>
            <input
              type="number"
              value={editingSchool?.goal || 0}
              onChange={(e) =>
                setEditingSchool(
                  editingSchool
                    ? { ...editingSchool, goal: Number(e.target.value) }
                    : null,
                )
              }
              className="input-bordered w-full input"
              min="0"
              max="100"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1">Deadline Year</label>
            <input
              type="number"
              value={editingSchool?.deadlineYear || ""}
              onChange={(e) =>
                setEditingSchool(
                  editingSchool
                    ? { ...editingSchool, deadlineYear: e.target.value }
                    : null,
                )
              }
              className="input-bordered w-full input"
              min={new Date().getFullYear()}
              max={new Date().getFullYear() + 50}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                const modal = document.getElementById(
                  "edit-school-modal",
                ) as HTMLDialogElement;
                if (modal) modal.close();
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpdateSchool}
            >
              Update
            </button>
          </div>
        </AdminModal>

        {/* Tab Content */}
        {activeTab === "schools" && (
          <>
            <div className="flex justify-end gap-2 mb-4">
              <button
                onClick={() => {
                  const modal = document.getElementById(
                    "create-school-modal",
                  ) as HTMLDialogElement;
                  if (modal) modal.showModal();
                }}
                className="flex items-center gap-2 btn btn-primary"
              >
                <Plus size={20} />
                Add School
              </button>
            </div>

            {/* Schools Table */}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            ) : schools.length === 0 ? (
              <div className="flex flex-col justify-center items-center py-12">
                <div className="mb-4 text-gray-500 text-center">
                  <School className="mx-auto mb-4 w-12 h-12 text-gray-300" />
                  <h3 className="mb-2 font-medium text-gray-900 text-lg">
                    No schools found
                  </h3>
                  <p className="text-gray-600">
                    Create your first school to get started.
                  </p>
                </div>
                <button
                  onClick={handleInitializeSchools}
                  disabled={initializing}
                  className="btn btn-primary"
                >
                  <Plus size={20} />
                  {initializing
                    ? "Initializing..."
                    : "Initialize Default Schools"}
                </button>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <table className="bg-white w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="p-3 font-medium text-gray-400">Name</th>
                      <th className="p-3 font-medium text-gray-400">
                        Goal (%)
                      </th>
                      <th className="p-3 font-medium text-gray-400">
                        Deadline
                      </th>
                      <th className="p-3 font-medium text-gray-400">Created</th>
                      <th className="p-3 font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schools.map((school) => (
                      <tr key={school.id} className="border-gray-200 border-t">
                        <td className="p-3">
                          <span className="flex justify-start items-center gap-2.5">
                            <School className="w-5 h-5 text-primary" />
                            {school.name}
                          </span>
                        </td>
                        <td className="p-3">{school.goal}%</td>
                        <td className="p-3">{school.deadlineYear}</td>
                        <td className="p-3">
                          {new Date(school.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <span className="flex justify-start items-center gap-2.5000000000000004">
                            <button
                              onClick={() => {
                                setEditingSchool(school);
                                const modal = document.getElementById(
                                  "edit-school-modal",
                                ) as HTMLDialogElement;
                                if (modal) modal.showModal();
                              }}
                              className="text-primary hover:text-blue-800"
                              aria-label="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteSchool(school.id)}
                              className="text-red-600 hover:text-red-800"
                              aria-label="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === "categories" && (
          <div className="py-8">
            <EmissionCategoriesManager />
          </div>
        )}

        {activeTab === "actions" && (
          <div className="py-8">
            <ActionsManager />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
