"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { PlusCircle, BarChart3, Building, Edit } from "lucide-react";
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
  const [isSchoolEditModalOpen, setIsSchoolEditModalOpen] = useState(false);
  const [schoolEditForm, setSchoolEditForm] = useState({
    goal: 50,
    deadlineYear: "2030",
  });

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
          setSchoolEditForm({
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

  const handleSchoolEdit = async () => {
    if (!teacherInfo?.school) return;

    try {
      if (teacherSchool?.id) {
        // Update existing school
        const response = await fetch(`/api/school/${teacherSchool.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(schoolEditForm),
        });

        const data = await response.json();

        if (response.ok) {
          setTeacherSchool({ ...teacherSchool, ...schoolEditForm });
          setIsSchoolEditModalOpen(false);
          alert("School updated successfully!");
        } else {
          alert(`Error updating school: ${data.error}`);
        }
      } else {
        // Create new school entry for existing teacher
        const response = await fetch("/api/school", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: teacherInfo.school,
            goal: schoolEditForm.goal,
            deadlineYear: schoolEditForm.deadlineYear,
            teacherId: user?.username,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setTeacherSchool(data.school);
          setIsSchoolEditModalOpen(false);
          alert("School goals set successfully!");

          // Update teacher's schoolId link
          await fetch("/api/teacher/link-school", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              teacherId: user?.username,
              schoolId: data.school.id,
            }),
          });
        } else {
          alert(`Error setting school goals: ${data.error}`);
        }
      }
    } catch (error) {
      console.error("Error with school operation:", error);
      alert("Error processing request. Please try again.");
    }
  };

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
      <div className="container mx-auto px-6 py-8">
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
        className="container mx-auto px-6 py-8"
      >
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("teacherDashboard")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("manageProjects")}</p>
          </div>
          <button
            className="bg-primary-600 hover:bg-primary-700 btn btn-primary mt-4 md:mt-0"
            onClick={openProjectModal}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("addNewProject")}
          </button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="card relative">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">
                {teacherInfo?.school ? t("mySchool") : t("projects")}
              </h3>
              <Building className="text-muted-foreground h-4 w-4" />
            </div>
            <div>
              {teacherInfo?.school ? (
                <>
                  <div className="text-2xl font-bold">
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
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <p className="text-muted-foreground text-xs">
                    {t("projectsCreated")}
                  </p>
                </>
              )}
            </div>
            {teacherInfo?.school && (
              <button
                onClick={() => setIsSchoolEditModalOpen(true)}
                className="text-muted-foreground hover:text-primary absolute right-5 bottom-5 cursor-pointer"
                title={
                  teacherSchool ? t("editSchoolGoals") : t("setSchoolGoals")
                }
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="card">
            <h3 className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">{t("totalProjects")}</div>
              <PlusCircle className="text-muted-foreground h-4 w-4" />
            </h3>
            <div>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-muted-foreground text-xs">
                {t("projectsCreated")}
              </p>
            </div>
          </div>

          <div className="card">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">
                {t("emissionReduction")}
              </div>
              <BarChart3 className="text-muted-foreground h-4 w-4" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {avgReduction.toFixed(1)}%
              </div>
              <p className="text-muted-foreground text-xs">
                {t("averageReduction")}
              </p>
            </div>
          </div>
        </div>

        <h2 className="mb-4 text-xl font-semibold">
          {t("activeProjectsTitle")}
        </h2>

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
              <div className="mt-5 flex w-full justify-between">
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

      {/* School Edit Modal */}
      {isSchoolEditModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">{t("editSchool")}</h3>
            <form
              className="space-y-2.5 py-5"
              onSubmit={(e) => {
                e.preventDefault();
                handleSchoolEdit();
              }}
            >
              <div>
                <label htmlFor="goal" className="mb-1 block font-medium">
                  {t("reductionGoal")} (%)
                </label>
                <input
                  id="goal"
                  name="goal"
                  type="number"
                  placeholder={t("reductionGoal")}
                  className="input-bordered input w-full"
                  value={schoolEditForm.goal}
                  onChange={(e) =>
                    setSchoolEditForm((prev) => ({
                      ...prev,
                      goal: Number(e.target.value),
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
                  className="mb-1 block font-medium"
                >
                  {t("deadlineYear")}
                </label>
                <input
                  id="deadlineYear"
                  name="deadlineYear"
                  type="number"
                  placeholder={t("deadlineYear")}
                  className="input-bordered input w-full"
                  value={schoolEditForm.deadlineYear}
                  onChange={(e) =>
                    setSchoolEditForm((prev) => ({
                      ...prev,
                      deadlineYear: e.target.value,
                    }))
                  }
                  min={new Date().getFullYear()}
                  max={new Date().getFullYear() + 50}
                  required
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsSchoolEditModalOpen(false)}
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
