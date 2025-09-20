"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { PlusCircle, BarChart3, Building } from "lucide-react";
import Project from "@/types/ProjectType";
import ProjectForm from "@/types/ProjectForm";
import { School } from "@/types/School";
import { ProjectFormModal } from "./ProjectFormModal";
import { useUser } from "@/context/UserContext";
import { Link, useRouter } from "@/i18n/navigation";

const TeacherDashboard: React.FC = () => {
  const t = useTranslations("TeacherDashboard");
  const { user } = useUser();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [teacherSchool, setTeacherSchool] = useState<School | null>(null);
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

  const fetchProjects = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/project?teacherId=${user.username}`);
      const data = await response.json();

      if (response.ok) {
        setProjects(data.projects || []);
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

  // If user is a student, redirect them
  if (user && user.passcode) {
    return (
      <div className="mx-auto px-6 py-8 container">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl">Access Denied</h1>
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
      <div className="mx-auto px-6 py-8 container">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl">Please Log In</h1>
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
      <div className="mx-auto px-6 py-8 container">
        <div className="text-center">
          <div className="mx-auto border-gray-900 border-b-2 rounded-full w-32 h-32 animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto px-6 py-8 container">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-red-600 text-2xl">Error</h1>
          <p className="mb-4 text-gray-600">{error}</p>
          <button onClick={fetchProjects} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const avgReduction =
    projects.length > 0
      ? projects.reduce(
          (sum, project) => sum + (project.subGoalReductionAmount || 0),
          0,
        ) / projects.length
      : 0;

  return (
    <div className="bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto px-6 py-8 container"
      >
        <div className="flex md:flex-row flex-col md:justify-between md:items-center mb-8">
          <div>
            <h1 className="font-bold text-3xl tracking-tight">
              {t("teacherDashboard")}
            </h1>
            <p className="mt-1 text-muted-foreground">{t("manageProjects")}</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Link
              href="/dashboard/school-management"
              className="btn-outline btn"
            >
              School Management
            </Link>
            <button
              className="bg-primary-600 hover:bg-primary-700 btn btn-primary"
              onClick={openProjectModal}
            >
              <PlusCircle className="mr-2 w-4 h-4" />
              {t("addNewProject")}
            </button>
          </div>
        </div>

        <div className="gap-4 grid md:grid-cols-3 mb-8">
          <div className="relative card">
            <div className="flex flex-row justify-between items-center space-y-0 pb-2">
              <h3 className="font-medium text-sm">
                {teacherInfo?.school ? t("mySchool") : t("projects")}
              </h3>
              <Building className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              {teacherInfo?.school ? (
                <>
                  <div className="font-bold text-2xl">
                    {teacherSchool
                      ? `${teacherSchool.goal}% by ${teacherSchool.deadlineYear}`
                      : t("clickToSetGoals")}
                  </div>
                  <p className="text-muted-foreground text-xs text-wrap">
                    {teacherSchool?.name}
                  </p>
                </>
              ) : (
                <>
                  <div className="font-bold text-2xl">{projects.length}</div>
                  <p className="text-muted-foreground text-xs">
                    {t("projectsCreated")}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="flex flex-row justify-between items-center space-y-0 pb-2">
              <div className="font-medium text-sm">{t("totalProjects")}</div>
              <PlusCircle className="w-4 h-4 text-muted-foreground" />
            </h3>
            <div>
              <div className="font-bold text-2xl">{projects.length}</div>
              <p className="text-muted-foreground text-xs">
                {t("projectsCreated")}
              </p>
            </div>
          </div>

          <div className="card">
            <div className="flex flex-row justify-between items-center space-y-0 pb-2">
              <div className="font-medium text-sm">
                {t("emissionReduction")}
              </div>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <div className="font-bold text-2xl">
                {avgReduction.toFixed(1)}%
              </div>
              <p className="text-muted-foreground text-xs">
                {t("averageReduction")}
              </p>
            </div>
          </div>
        </div>

        <h2 className="mb-4 font-semibold text-xl">
          {t("activeProjectsTitle")}
        </h2>

        <div className="gap-6 grid md:grid-cols-2 lg:grid-cols-3 mb-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="hover:shadow-md transition-shadow card"
            >
              <div>
                <div className="flex justify-between items-start mb-5 font-bold text-xl">
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
                <div className="gap-4 grid grid-cols-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">{t("startDate")}</p>
                    <p className="font-medium">
                      {typeof project.startDate === "number"
                        ? project.startDate
                        : new Date(project.startDate).getFullYear()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("subGoalDate")}</p>
                    <p className="font-medium">
                      {typeof project.subGoalDeadline === "number"
                        ? project.subGoalDeadline
                        : new Date(project.subGoalDeadline).getFullYear()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("reduction")}</p>
                    <p className="font-medium text-green-600">
                      {project.subGoalReductionAmount}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-5 w-full">
                {/* Assuming project.id is available and can be used for the link */}
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
