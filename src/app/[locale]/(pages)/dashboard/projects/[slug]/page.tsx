"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import Loading from "@/components/(dashboard)/ProjectDetails/Loading";
import NotFound from "@/components/(dashboard)/ProjectDetails/NotFound";
import Header from "@/components/(dashboard)/ProjectDetails/Header";
import StatCards from "@/components/(dashboard)/ProjectDetails/StatCards";
import OverviewCard from "@/components/(dashboard)/ProjectDetails/OverviewCard";
import ActionsCard from "@/components/(dashboard)/ProjectDetails/ActionsCard";

import Project from "@/types/project";
import { motion } from "framer-motion";

const ProjectDetails = () => {
  const { slug: projectId } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setProject({
        id: projectId.toUpperCase(),
        name: "Green School Initiative",
        school: "Lincoln High School",
        students: 28,
        startDate: "2023-09-01",
        status: "active",
        emissions: 450,
        reduction: 32,
        description:
          "A project aimed at reducing the school's carbon footprint through various sustainability initiatives.",
        actions: [
          { name: "Installed LED lighting", date: "2023-09-15", reduction: 8 },
          {
            name: "Implemented recycling program",
            date: "2023-10-01",
            reduction: 12,
          },
          { name: "Reduced paper usage", date: "2023-10-20", reduction: 7 },
          { name: "Bike to school week", date: "2023-11-05", reduction: 5 },
        ],
        subGoalDate: "2028",
        finalGoalDate: "2030",
        subgoal: 25,
        finalGoal: 40,
      });
      setLoading(false);
    }, 1000);
  }, [projectId]);

  if (loading) return <Loading />;
  if (!project) return <NotFound projectId={projectId} />;

  return (
    <div className="bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-6 py-8"
      >
        <Header project={project} />
        <StatCards project={project} />
        <div className="mb-8 flex flex-col gap-6 md:flex-row">
          <OverviewCard project={project} />
          <ActionsCard actions={project.actions} />
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectDetails;
