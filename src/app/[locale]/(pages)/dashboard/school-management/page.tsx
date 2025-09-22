"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "@/i18n/navigation";
import { useUser } from "@/context/UserContext";
import { School } from "@/types/School";
import { Edit, Save, X } from "lucide-react";
import EmissionDataManager from "@/components/teacher/EmissionDataManager";
import PendingActionsManager from "@/components/teacher/PendingActionsManager";
import Project from "@/types/ProjectType";

const SchoolManagement: React.FC = () => {
  const { user } = useUser();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "school" | "emissions" | "pending"
  >("school");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    goal: 50,
    deadlineYear: "2030",
  });
  const [school, setSchool] = useState<School | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeacherSchool = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `/api/teacher-school?teacherId=${user.username}`,
      );
      const data = await response.json();

      if (response.ok && data.school) {
        setSchool(data.school);
        setEditForm({
          goal: data.school.goal,
          deadlineYear: data.school.deadlineYear,
        });
      } else {
        setError("No school associated with this teacher");
      }
    } catch (error) {
      console.error("Error fetching teacher school:", error);
      setError("Failed to fetch school data");
    }
  }, [user]);

  const fetchProjects = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/project?teacherId=${user.username}`);
      const data = await response.json();

      if (response.ok) {
        setProjects(data.projects || []);
        if (data.projects && data.projects.length > 0) {
          setSelectedProject(data.projects[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      if (user && !user.passcode) {
        await Promise.all([fetchTeacherSchool(), fetchProjects()]);
      } else if (user) {
        setError("This page is only accessible to teachers");
      }

      setLoading(false);
    };

    loadData();
  }, [user, fetchTeacherSchool, fetchProjects]);

  const handleSchoolUpdate = (updatedSchool: School) => {
    setSchool(updatedSchool);
  };

  const handleSaveSchool = async () => {
    if (!school?.id) return;

    try {
      const response = await fetch(`/api/school/${school.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (response.ok) {
        setSchool({ ...school, ...editForm });
        setIsEditing(false);
        alert("School updated successfully!");
      } else {
        alert(`Error updating school: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating school:", error);
      alert("Error updating school. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      goal: school?.goal || 50,
      deadlineYear: school?.deadlineYear || "2030",
    });
    setIsEditing(false);
  };

  // Redirect if not a teacher
  useEffect(() => {
    if (user !== undefined && (!user || user.passcode)) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="mx-auto px-6 py-8 container">
          <div className="flex justify-center items-center py-20">
            <div className="loading loading-spinner loading-lg"></div>
            <span className="ml-2">Loading school management...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="mx-auto px-6 py-8 container">
          <div className="py-20 text-center">
            <h1 className="mb-4 font-bold text-red-600 text-2xl">Error</h1>
            <p className="mb-4 text-gray-600">{error}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="btn btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="mx-auto px-6 py-8 container">
          <div className="py-20 text-center">
            <h1 className="mb-4 font-bold text-2xl">No School Found</h1>
            <p className="mb-4 text-gray-600">
              You need to be associated with a school to manage emission data.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="btn btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto px-6 py-8 container"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-bold text-3xl tracking-tight">
            School Management
          </h1>
          <p className="mt-1 text-gray-600">
            Manage emission data and review student actions for {school.name}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="tabs tabs-boxed">
            <button
              className={`tab ${activeTab === "school" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("school")}
            >
              School Information
            </button>
            <button
              className={`tab ${activeTab === "emissions" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("emissions")}
            >
              Emission Data
            </button>
            <button
              className={`tab ${activeTab === "pending" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              Pending Actions
              {/* Could add badge with count here */}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl">
          {activeTab === "school" && (
            <div className="card">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="mb-2 font-bold text-2xl">{school.name}</h2>
                  <p className="text-gray-600">School Information & Goals</p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-outline btn btn-sm"
                  >
                    <Edit className="mr-2 w-4 h-4" />
                    Edit Goals
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveSchool}
                      className="btn btn-primary btn-sm"
                    >
                      <Save className="mr-2 w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn-outline btn btn-sm"
                    >
                      <X className="mr-2 w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-4">
                  <div className="gap-6 grid md:grid-cols-2">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="mb-2 font-semibold text-lg">
                        Reduction Goal
                      </h3>
                      <p className="font-bold text-green-600 text-3xl">
                        {school.goal}%
                      </p>
                      <p className="mt-1 text-gray-600 text-sm">
                        Target emission reduction
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="mb-2 font-semibold text-lg">
                        Target Year
                      </h3>
                      <p className="font-bold text-primary text-3xl">
                        {school.deadlineYear}
                      </p>
                      <p className="mt-1 text-gray-600 text-sm">
                        Deadline to achieve goal
                      </p>
                    </div>
                  </div>
                  <div className="bg-blue-50 mt-6 p-4 rounded-lg">
                    <h3 className="mb-2 font-semibold">School Goal Summary</h3>
                    <p className="text-gray-700">
                      <strong>{school.name}</strong> aims to reduce emissions by{" "}
                      <strong>{school.goal}%</strong> by the year{" "}
                      <strong>{school.deadlineYear}</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="gap-6 grid md:grid-cols-2">
                    <div>
                      <label htmlFor="goal" className="block mb-2 font-medium">
                        Reduction Goal (%)
                      </label>
                      <input
                        id="goal"
                        name="goal"
                        type="number"
                        placeholder="Enter reduction goal"
                        className="input-bordered w-full input"
                        value={editForm.goal}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            goal: Number(e.target.value),
                          }))
                        }
                        min={0}
                        max={100}
                        required
                      />
                      <p className="mt-1 text-gray-500 text-sm">
                        Enter a percentage between 0 and 100
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="deadlineYear"
                        className="block mb-2 font-medium"
                      >
                        Target Year
                      </label>
                      <input
                        id="deadlineYear"
                        name="deadlineYear"
                        type="number"
                        placeholder="Enter target year"
                        className="input-bordered w-full input"
                        value={editForm.deadlineYear}
                        onChange={(e) =>
                          setEditForm((prev) => ({
                            ...prev,
                            deadlineYear: e.target.value,
                          }))
                        }
                        min={new Date().getFullYear()}
                        max={new Date().getFullYear() + 50}
                        required
                      />
                      <p className="mt-1 text-gray-500 text-sm">
                        Year when the goal should be achieved
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="mb-2 font-semibold">Preview</h3>
                    <p className="text-gray-700">
                      <strong>{school.name}</strong> will aim to reduce
                      emissions by <strong>{editForm.goal}%</strong> by the year{" "}
                      <strong>{editForm.deadlineYear}</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "emissions" && (
            <EmissionDataManager
              school={school}
              onUpdate={handleSchoolUpdate}
            />
          )}

          {activeTab === "pending" && (
            <>
              {projects.length > 0 ? (
                <>
                  {/* Project Selector */}
                  {projects.length > 1 && (
                    <div className="mb-6">
                      <label className="block mb-2 font-medium text-sm">
                        Select Project to Review:
                      </label>
                      <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="w-full max-w-xs select-bordered select"
                      >
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Pending Actions Manager */}
                  {selectedProject && (
                    <PendingActionsManager
                      projectId={selectedProject}
                      teacherId={user?.username || ""}
                      onActionReviewed={() => {
                        // Could refresh data or show notification
                      }}
                    />
                  )}
                </>
              ) : (
                <div className="card">
                  <div className="py-8 text-center">
                    <h3 className="mb-2 font-semibold text-xl">
                      No Projects Found
                    </h3>
                    <p className="mb-4 text-gray-600">
                      Create a project to start receiving student action
                      submissions.
                    </p>
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="btn btn-primary"
                    >
                      Create Project
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SchoolManagement;
