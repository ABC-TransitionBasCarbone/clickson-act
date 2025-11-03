"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  PlusCircle,
  Edit,
  Save,
  X,
  FolderOpen,
  School,
  TrendingUp,
  Clock,
} from "lucide-react";
import Project from "@/types/ProjectType";
import ProjectForm from "@/types/ProjectForm";
import { School as SchoolType } from "@/types/School";
import { ProjectFormModal } from "./ProjectFormModal";
import { useUser } from "@/context/UserContext";
import { Link, useRouter } from "@/i18n/navigation";
import EmissionDataManager from "@/components/teacher/EmissionDataManager";
import PendingActionsManager from "@/components/teacher/PendingActionsManager";
import PendingTeachersManager from "@/components/teacher/PendingTeachersManager";

const TeacherDashboard: React.FC = () => {
  const t = useTranslations("TeacherDashboard");
  const { user } = useUser();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [teacherSchool, setTeacherSchool] = useState<SchoolType | null>(null);
  const [teacherInfo, setTeacherInfo] = useState<{ school?: string } | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState<ProjectForm>({
    name: "",
    startDate: new Date().getFullYear().toString(),
    finalGoal: new Date().getFullYear().toString(),
    goalReductionAmount: 0,
  });

  // Tab management
  const [activeTab, setActiveTab] = useState<
    "projects" | "school" | "emissions" | "pending"
  >("projects");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    goal: 50,
    deadlineYear: "2030",
  });
  const [selectedProject, setSelectedProject] = useState<string>("");

  // Tab configuration
  const tabs = [
    {
      id: "projects" as const,
      label: t("activeProjectsTitle"),
      icon: FolderOpen,
      show: true,
    },
    {
      id: "school" as const,
      label: "School Information",
      icon: School,
      show: !!teacherInfo?.school,
    },
    {
      id: "emissions" as const,
      label: "Emission Data",
      icon: TrendingUp,
      show: !!teacherInfo?.school,
    },
    {
      id: "pending" as const,
      label: "Pending",
      icon: Clock,
      show: !!teacherInfo?.school,
    },
  ];

  const fetchProjects = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/project?teacherId=${user.username}`);
      const data = await response.json();

      if (response.ok) {
        setProjects(data.projects || []);
        if (data.projects && data.projects.length > 0) {
          setSelectedProject(data.projects[0].id);
        }
      } else {
        setError(data.error || "Failed to fetch projects");
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchTeacherSchool = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `/api/teacher-school?teacherId=${user.username}`,
      );
      const data = await response.json();

      console.log("Teacher school response:", data); // Debug log

      if (response.ok) {
        // Set teacher info regardless
        setTeacherInfo(data.teacher);

        // Set school if exists
        if (data.school) {
          setTeacherSchool(data.school);
          setEditForm({
            goal: data.school.goal,
            deadlineYear: data.school.deadlineYear,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching teacher school:", error);
    }
  }, [user]);

  // Fetch projects and teacher school data when component mounts
  useEffect(() => {
    if (user && !user.passcode) {
      // Only for teachers (no passcode)
      fetchProjects();
      fetchTeacherSchool();
    } else {
      setLoading(false);
    }
  }, [user, fetchProjects, fetchTeacherSchool]);

  const openProjectModal = () => {
    const currentYear = new Date().getFullYear();
    setProjectForm({
      name: "",
      startDate: currentYear.toString(),
      finalGoal: currentYear.toString(),
      goalReductionAmount: 0,
    });
    setIsProjectModalOpen(true);
  };

  const handleProjectSubmit = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...projectForm,
          teacherId: user.username,
          teacherName: user.username,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add the new project to the list
        setProjects((prev) => [data.project, ...prev]);
        setIsProjectModalOpen(false);

        // Show success message with passcode
        alert(
          `Project created successfully! Student passcode: ${data.project.passcode}`,
        );
      } else {
        alert(`Error creating project: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Error creating project. Please try again.");
    }
  };

  const handleSchoolUpdate = (updatedSchool: SchoolType) => {
    setTeacherSchool(updatedSchool);
  };

  const [savingSchool, setSavingSchool] = useState(false);

  const handleSaveSchool = async () => {
    if (!teacherSchool?.id || !user?.token) return;

    setSavingSchool(true);
    try {
      const response = await fetch(`/api/school/${teacherSchool.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (response.ok) {
        setTeacherSchool({ ...teacherSchool, ...editForm });
        setIsEditing(false);
        alert("School updated successfully!");
      } else {
        alert(`Error updating school: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating school:", error);
      alert("Error updating school. Please try again.");
    } finally {
      setSavingSchool(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      goal: teacherSchool?.goal || 50,
      deadlineYear: teacherSchool?.deadlineYear || "2030",
    });
    setIsEditing(false);
  };

  // If user is a student, redirect them
  if (user && user.passcode) {
    return (
      <div className="container mx-auto min-h-screen px-6 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
          <p className="mb-4 text-gray-600">
            You are logged in as a student. This dashboard is for teachers only.
          </p>
          <button
            onClick={() => router.push(`/data-reporting/${user.passcode}`)}
            className="btn btn-primary"
          >
            Go to Student Calculator
          </button>
        </div>
      </div>
    );
  }

  // If not logged in
  if (!user) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Please Log In</h1>
          <p className="mb-4 text-gray-600">
            You need to be logged in as a teacher to access this dashboard.
          </p>
          <button
            onClick={() => router.push("/data-reporting")}
            className="btn btn-primary"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-red-600">Error</h1>
          <p className="mb-4 text-gray-600">{error}</p>
          <button onClick={fetchProjects} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-6 py-8"
      >
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("teacherDashboard")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("manageProjects")}</p>
          </div>

          {/* Enhanced Tabbed Interface */}
          <div className="">
            <div className="rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 shadow-sm">
              <div className="flex flex-wrap gap-1.5">
                {tabs
                  .filter((tab) => tab.show)
                  .map((tab) => {
                    const IconComponent = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        className={`group relative flex cursor-pointer items-center gap-2.5 rounded-lg px-5 py-3.5 text-sm font-medium transition-all duration-300 ${
                          isActive
                            ? "bg-primary scale-105 text-white shadow-md"
                            : "text-gray-600 hover:scale-102 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <IconComponent
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isActive ? "scale-110" : "group-hover:scale-105"
                          }`}
                        />
                        <span className="whitespace-nowrap">{tab.label}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          className="mx-auto max-w-6xl"
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "projects" && (
            <>
              {/* Add New Project Button */}
              <div className="mb-6">
                <button
                  className="bg-primary-600 hover:bg-primary-700 btn btn-primary"
                  onClick={openProjectModal}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t("addNewProject")}
                </button>
              </div>

              {/* Projects Grid */}
              <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="card transition-shadow hover:shadow-md"
                  >
                    <div>
                      <div className="mb-5 flex items-start justify-between text-xl font-bold">
                        <h3>{project.name}</h3>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            project.status === "active"
                              ? "bg-green-100 text-green-800"
                              : project.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {t(`status.${project.status}`)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">
                            {t("startDate")}
                          </p>
                          <p className="font-medium">
                            {typeof project.startDate === "number"
                              ? project.startDate
                              : new Date(project.startDate).getFullYear()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            {t("subGoalDate")}
                          </p>
                          <p className="font-medium">
                            {typeof project.subGoalDeadline === "number"
                              ? project.subGoalDeadline
                              : new Date(project.subGoalDeadline).getFullYear()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">
                            {t("reduction")}
                          </p>
                          <p className="font-medium text-green-600">
                            {project.subGoalReductionAmount}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex w-full justify-between">
                      <div className="flex gap-2">
                        {project.id && (
                          <Link
                            href={`/dashboard/projects/${project.id}`}
                            className="btn-outline btn btn-primary"
                          >
                            {t("viewDetails")}
                          </Link>
                        )}
                        <Link href="/monitoring" className="btn btn-secondary">
                          {t("monitoring")}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "school" && teacherSchool && (
            <div className="card">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h2 className="mb-2 text-2xl font-bold">
                    {teacherSchool.name}
                  </h2>
                  <p className="text-gray-600">School Information & Goals</p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-outline btn btn-sm"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Goals
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveSchool}
                      className="btn btn-primary btn-sm"
                      disabled={savingSchool}
                    >
                      {savingSchool ? (
                        <>
                          <span className="loading loading-spinner loading-xs"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn-outline btn btn-sm"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h3 className="mb-2 text-lg font-semibold">
                        Reduction Goal
                      </h3>
                      <p className="text-3xl font-bold text-green-600">
                        {teacherSchool.goal}%
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Target emission reduction
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h3 className="mb-2 text-lg font-semibold">
                        Target Year
                      </h3>
                      <p className="text-primary text-3xl font-bold">
                        {teacherSchool.deadlineYear}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        Deadline to achieve goal
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 rounded-lg bg-blue-50 p-4">
                    <h3 className="mb-2 font-semibold">School Goal Summary</h3>
                    <p className="text-gray-700">
                      <strong>{teacherSchool.name}</strong> aims to reduce
                      emissions by <strong>{teacherSchool.goal}%</strong> by the
                      year <strong>{teacherSchool.deadlineYear}</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="goal" className="mb-2 block font-medium">
                        Reduction Goal (%)
                      </label>
                      <input
                        id="goal"
                        name="goal"
                        type="number"
                        placeholder="Enter reduction goal"
                        className="input-bordered input w-full"
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
                      <p className="mt-1 text-sm text-gray-500">
                        Enter a percentage between 0 and 100
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="deadlineYear"
                        className="mb-2 block font-medium"
                      >
                        Target Year
                      </label>
                      <input
                        id="deadlineYear"
                        name="deadlineYear"
                        type="number"
                        placeholder="Enter target year"
                        className="input-bordered input w-full"
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
                      <p className="mt-1 text-sm text-gray-500">
                        Year when the goal should be achieved
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-yellow-50 p-4">
                    <h3 className="mb-2 font-semibold">Preview</h3>
                    <p className="text-gray-700">
                      <strong>{teacherSchool.name}</strong> will aim to reduce
                      emissions by <strong>{editForm.goal}%</strong> by the year{" "}
                      <strong>{editForm.deadlineYear}</strong>.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "emissions" && teacherSchool && (
            <EmissionDataManager
              school={teacherSchool}
              onUpdate={handleSchoolUpdate}
            />
          )}

          {activeTab === "pending" && (
            <>
              {/* Pending Teachers Manager - Shows only if user is referent teacher */}
              <div className="mb-8">
                <PendingTeachersManager />
              </div>

              {projects.length > 0 ? (
                <>
                  {/* Project Selector */}
                  {projects.length > 1 && (
                    <div className="mb-6">
                      <label className="mb-2 block text-sm font-medium">
                        Select Project to Review:
                      </label>
                      <select
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        className="select-bordered select w-full max-w-xs"
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
                    <h3 className="mb-2 text-xl font-semibold">
                      No Projects Found
                    </h3>
                    <p className="mb-4 text-gray-600">
                      Create a project to start receiving student action
                      submissions.
                    </p>
                    <button
                      onClick={openProjectModal}
                      className="btn btn-primary"
                    >
                      Create Project
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Project Creation Modal */}
      {isProjectModalOpen && (
        <ProjectFormModal
          form={projectForm}
          setForm={setProjectForm}
          onClose={() => setIsProjectModalOpen(false)}
          onSubmit={handleProjectSubmit}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;
