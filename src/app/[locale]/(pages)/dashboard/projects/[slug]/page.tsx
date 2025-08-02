"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import Loading from "@/components/(dashboard)/ProjectDetails/Loading";
import NotFound from "@/components/(dashboard)/ProjectDetails/NotFound";
import Header from "@/components/(dashboard)/ProjectDetails/Header";
import StatCards from "@/components/(dashboard)/ProjectDetails/StatCards";
import OverviewCard from "@/components/(dashboard)/ProjectDetails/OverviewCard";
import ActionsCard from "@/components/(dashboard)/ProjectDetails/ActionsCard";
import SchoolGoalCard from "@/components/SchoolGoalCard";

import Project from "@/types/ProjectType";
import { School } from "@/types/School";
import { motion } from "framer-motion";

const ProjectDetails = () => {
  const { slug: projectId } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [schoolGoal, setSchoolGoal] = useState<{
    goal: number;
    deadlineYear: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/project/${projectId}`);
        const data = await response.json();

        if (response.ok) {
          console.log("Project data:", data.project); // Debug log
          console.log("School data:", data.school); // Debug log
          console.log("School goal data:", data.schoolGoal); // Debug log
          setProject(data.project);
          setSchool(data.school);
          setSchoolGoal(data.schoolGoal);
        } else {
          setError(data.error || "Failed to fetch project");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to fetch project details");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-2 font-bold text-red-600 text-2xl">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!project) return <NotFound projectId={String(projectId)} />;

  return (
    <div className="bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto px-6 py-8 container"
      >
        <Header project={project} />
        <StatCards project={project} />
        <div className="flex md:flex-row flex-col gap-6 mb-8">
          <OverviewCard school={school} />
          <ActionsCard actions={project.actions || []} />
        </div>
        {/* Goal Graph after overview and completed actions */}
        <SchoolGoalCard
          schoolGoal={schoolGoal?.goal || 40} // School's overall goal (e.g., 30%)
          subGoal={Number(project.goalReductionAmount) || 25} // This project's contribution (e.g., 10%)
          subGoalYear={
            project.finalGoal
              ? new Date(project.finalGoal).getFullYear().toString()
              : "2028"
          } // Project deadline year
          finalGoalYear={schoolGoal?.deadlineYear || "2030"} // School deadline year
          baseReductionPerYear={5} // Placeholder, adjust as needed
          startYear={
            project.startDate
              ? new Date(project.startDate).getFullYear().toString()
              : "2023"
          }
        />
      </motion.div>
    </div>
  );
};

export default ProjectDetails;
