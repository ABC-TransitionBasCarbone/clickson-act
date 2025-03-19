"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Users, BarChart3, Building } from "lucide-react";
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

  const handleAddProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: "New Project",
      school: "Your School",
      students: 0,
      startDate: new Date().toISOString().split("T")[0],
      status: "pending",
      emissions: 0,
      reduction: 0,
    };

    setProjects([...projects, newProject]);
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
            onClick={handleAddProject}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("addNewProject")}
          </button>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="card">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">{t("totalProjects")}</h3>
              <BarChart3 className="text-muted-foreground h-4 w-4" />
            </div>
            <div>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-muted-foreground text-xs">
                {t("activeProjects", {
                  count: projects.filter((p) => p.status === "active").length,
                })}
              </p>
            </div>
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
                <div className="flex items-start justify-between">
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
                <p>{project.school}</p>
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
    </div>
  );
};

export default TeacherDashboard;
