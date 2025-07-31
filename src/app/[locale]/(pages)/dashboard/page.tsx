"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { PlusCircle, Users, BarChart3, Building, Pencil } from "lucide-react";
import Project from "@/types/ProjectType";
import ProjectForm from "@/types/ProjectForm";
import { ProjectFormModal } from "./ProjectFormModal";
import { useUser } from "@/context/UserContext";
import { Link, useRouter } from "@/i18n/navigation";

const TeacherDashboard: React.FC = () => {
  const t = useTranslations("TeacherDashboard");
  const { user } = useUser();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState<ProjectForm>({
    name: "",
    school: "",
    students: 0,
    startDate: new Date().toISOString().split("T")[0],
    finalGoal: new Date().toISOString().split("T")[0],
    subGoal: new Date().toISOString().split("T")[0],
    goalReductionAmount: 0,
    reductionSubGoal: new Date().toISOString().split("T")[0],
  });

  const [isSchoolGoalModalOpen, setIsSchoolGoalModalOpen] = useState(false);
  const [schoolGoal, setSchoolGoal] = useState({
    reduction: 90,
    deadlineYear: "2030",
  });

  // Fetch projects when component mounts
  useEffect(() => {
    if (user && !user.passcode) {
      // Only for teachers (no passcode)
      fetchProjects();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProjects = async () => {
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
  };

  const openProjectModal = () => {
    const today = new Date().toISOString().split("T")[0];
    setProjectForm({
      name: "",
      school: "",
      students: 0,
      startDate: today,
      finalGoal: today,
      subGoal: today,
      goalReductionAmount: 0,
      reductionSubGoal: today,
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

  const handleSchoolGoalSubmit = () => {
    setIsSchoolGoalModalOpen(false);
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

  const totalStudents = projects.reduce(
    (sum, project) => sum + (project.students || 0),
    0,
  );
  const avgReduction =
    projects.length > 0
      ? projects.reduce(
          (sum, project) => sum + (project.goalReductionAmount || 0),
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
          <button
            className="bg-primary-600 hover:bg-primary-700 mt-4 md:mt-0 btn btn-primary"
            onClick={openProjectModal}
          >
            <PlusCircle className="mr-2 w-4 h-4" />
            {t("addNewProject")}
          </button>
        </div>

        <div className="gap-4 grid md:grid-cols-3 mb-8">
          <div className="relative card">
            <div className="flex flex-row justify-between items-center space-y-0 pb-2">
              <h3 className="font-medium text-sm">{t("schoolGoal")}</h3>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <div className="font-bold text-2xl">
                {schoolGoal.reduction}% – {schoolGoal.deadlineYear}
              </div>
              <p className="text-muted-foreground text-xs">
                {t("emissionReductionGoal")} ({t("by")}{" "}
                {schoolGoal.deadlineYear})
              </p>
            </div>
            <Pencil
              onClick={() => setIsSchoolGoalModalOpen(true)}
              className="right-5 bottom-5 absolute w-4 h-4 text-muted-foreground cursor-pointer"
            />
          </div>

          <div className="card">
            <h3 className="flex flex-row justify-between items-center space-y-0 pb-2">
              <div className="font-medium text-sm">{t("totalStudents")}</div>
              <Users className="w-4 h-4 text-muted-foreground" />
            </h3>
            <div>
              <div className="font-bold text-2xl">{totalStudents}</div>
              <p className="text-muted-foreground text-xs">
                {t("acrossAllProjects")}
              </p>
            </div>
          </div>

          <div className="card">
            <div className="flex flex-row justify-between items-center space-y-0 pb-2">
              <div className="font-medium text-sm">
                {t("emissionReduction")}
              </div>
              <Building className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <div className="font-bold text-2xl">{avgReduction}%</div>
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
                    <p className="text-muted-foreground">{t("students")}</p>
                    <p className="font-medium">{project.students}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("subGoalDate")}</p>
                    <p className="font-medium">
                      {new Date(project.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("reduction")}</p>
                    <p className="font-medium text-green-600">
                      {project.goalReductionAmount}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-5 w-full">
                {/* Assuming project.id is available and can be used for the link */}
                {project.id && (
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="btn-outline btn btn-primary"
                  >
                    {t("viewDetails")}
                  </Link>
                )}
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

      {isSchoolGoalModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{t("editSchoolGoal")}</h3>
            <form className="space-y-6 py-4" onSubmit={handleSchoolGoalSubmit}>
              <div>
                <label htmlFor="reduction" className="block mb-1 font-medium">
                  {t("reductionGoal")} (%)
                </label>
                <input
                  id="reduction"
                  name="reduction"
                  type="number"
                  placeholder={t("reductionGoal")}
                  className="input-bordered w-full input"
                  value={schoolGoal.reduction}
                  onChange={(e) =>
                    setSchoolGoal((prev) => ({
                      ...prev,
                      reduction: Number(e.target.value),
                    }))
                  }
                  min={0}
                  max={100}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="deadlineYear"
                  className="block mb-1 font-medium"
                >
                  {t("deadlineYear")}
                </label>
                <input
                  id="deadlineYear"
                  name="deadlineYear"
                  type="number"
                  placeholder={t("deadlineYear")}
                  className="input-bordered w-full input"
                  value={schoolGoal.deadlineYear}
                  onChange={(e) =>
                    setSchoolGoal((prev) => ({
                      ...prev,
                      reduction: Number(e.target.value),
                    }))
                  }
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 10}
                  required
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsSchoolGoalModalOpen(false)}
                >
                  {t("cancel")}
                </button>
                <button type="submit" className="btn btn-primary">
                  {t("save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
