"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Users, BarChart3, Building, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type Project = {
  id: string;
  name: string;
  school: string;
  students: number;
  startDate: string;
  status: "active" | "completed" | "pending";
  emissions: number;
  reduction: number;
};

const TeacherDashboard: React.FC = () => {
  const t = useTranslations("TeacherDashboard");

  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Green School Initiative",
      school: "Lincoln High School",
      students: 28,
      startDate: "2023-09-01",
      status: "active",
      emissions: 450,
      reduction: 32,
    },
    {
      id: "2",
      name: "Energy Conservation Project",
      school: "Washington Elementary",
      students: 19,
      startDate: "2023-10-15",
      status: "active",
      emissions: 320,
      reduction: 15,
    },
    {
      id: "3",
      name: "Sustainable Transport Week",
      school: "Jefferson Middle School",
      students: 35,
      startDate: "2023-11-05",
      status: "completed",
      emissions: 580,
      reduction: 45,
    },
  ]);

  // State for controlling the Project Modal
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: "",
    school: "",
    students: 0,
    startDate: "",
    emissions: 0,
    reduction: 0,
  });

  // State for controlling the School Goal Modal
  const [isSchoolGoalModalOpen, setIsSchoolGoalModalOpen] = useState(false);
  const [schoolGoal, setSchoolGoal] = useState(90);

  // Open the Project Modal and reset form
  const openProjectModal = () => {
    setProjectForm({
      name: "",
      school: "",
      students: 0,
      startDate: new Date().toISOString().split("T")[0],
      emissions: 0,
      reduction: 0,
    });
    setIsProjectModalOpen(true);
  };

  // Handle the project form submission
  const handleProjectSubmit = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: projectForm.name || "New Project",
      school: projectForm.school || "Your School",
      students: projectForm.students || 0,
      startDate: projectForm.startDate,
      status: "pending",
      emissions: projectForm.emissions,
      reduction: projectForm.reduction,
    };

    setProjects([...projects, newProject]);
    setIsProjectModalOpen(false);
  };

  // Handle input changes for project form
  const handleProjectFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProjectForm((prev) => ({
      ...prev,
      [name]:
        name === "students" || name === "emissions" || name === "reduction"
          ? Number(value)
          : value,
    }));
  };

  // Handle the school goal update
  const handleSchoolGoalSubmit = () => {
    setIsSchoolGoalModalOpen(false);
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
              <h3 className="text-sm font-medium">{t("schoolGoal")}</h3>
              <BarChart3 className="text-muted-foreground h-4 w-4" />
            </div>
            <div>
              <div className="text-2xl font-bold">{schoolGoal}%</div>
              <p className="text-muted-foreground text-xs">
                {t("emissionReductionGoal")}
              </p>
            </div>
            <Pencil
              onClick={() => setIsSchoolGoalModalOpen(true)}
              className="text-muted-foreground absolute right-5 bottom-5 h-4 w-4 cursor-pointer"
            />
          </div>

          <div className="card">
            <h3 className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">{t("totalStudents")}</div>
              <Users className="text-muted-foreground h-4 w-4" />
            </h3>
            <div>
              <div className="text-2xl font-bold">
                {projects.reduce((acc, project) => acc + project.students, 0)}
              </div>
              <p className="text-muted-foreground text-xs">
                {t("acrossAllProjects")}
              </p>
            </div>
          </div>

          <div className="card">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">
                {t("emissionReduction")}
              </div>
              <Building className="text-muted-foreground h-4 w-4" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {projects.reduce((acc, project) => acc + project.reduction, 0)}%
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
                    <p className="text-muted-foreground">{t("students")}</p>
                    <p className="font-medium">{project.students}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("startDate")}</p>
                    <p className="font-medium">
                      {new Date(project.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      {t("currentEmissions")}
                    </p>
                    <p className="font-medium">{project.emissions} kg CO2e</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">{t("reduction")}</p>
                    <p className="font-medium text-green-600">
                      {project.reduction}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex w-full justify-between">
                <Link
                  href={`/dashboard/projects/tsrayfe`}
                  className="btn-outline btn btn-primary"
                >
                  {t("viewDetails")}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Project Creation Modal */}
      {isProjectModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">{t("createNewProject")}</h3>
            <div className="space-y-4 py-4">
              <div>
                <label htmlFor="name" className="label">
                  <span className="label-text">{t("projectNameLabel")}</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder={t("projectNamePlaceholder")}
                  className="input input-bordered w-full"
                  value={projectForm.name}
                  onChange={handleProjectFormChange}
                />
              </div>
              <div>
                <label htmlFor="startDate" className="label">
                  <span className="label-text">{t("startDateLabel")}</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  className="input input-bordered w-full"
                  value={projectForm.startDate}
                  onChange={handleProjectFormChange}
                />
              </div>
              <div>
                <label htmlFor="emissions" className="label">
                  <span className="label-text">{t("emissionsLabel")}</span>
                </label>
                <input
                  type="number"
                  id="emissions"
                  name="emissions"
                  placeholder={t("emissionsPlaceholder")}
                  className="input input-bordered w-full"
                  value={projectForm.emissions}
                  onChange={handleProjectFormChange}
                />
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setIsProjectModalOpen(false)}
              >
                {t("cancel")}
              </button>
              <button className="btn btn-primary" onClick={handleProjectSubmit}>
                {t("submit")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* School Goal Editing Modal */}
      {isSchoolGoalModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-bold">{t("editSchoolGoal")}</h3>
            <div className="py-4">
              <input
                type="number"
                placeholder={t("schoolGoal")}
                className="input input-bordered w-full"
                value={schoolGoal}
                onChange={(e) => setSchoolGoal(Number(e.target.value))}
              />
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setIsSchoolGoalModalOpen(false)}
              >
                {t("cancel")}
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSchoolGoalSubmit}
              >
                {t("save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
