"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  School,
  Clock,
  Leaf,
  Share2,
  Edit,
} from "lucide-react";

import Project from "@/types/project";
import { useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";

const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareButtonText, setShareButtonText] = useState("Share");

  useEffect(() => {
    // In a real app, fetch project details from API
    // For now, we'll simulate with mock data
    setLoading(true);
    setTimeout(() => {
      setProject({
        id: projectId || "TSYARSET",
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
      });
      setLoading(false);
    }, 1000);
  }, [projectId]);

  const handleShareClick = () => {
    // Copy current URL to clipboard
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setShareButtonText("Link Copied");
        // Reset button text after 2 seconds
        setTimeout(() => {
          setShareButtonText("Share");
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy URL: ", err);
      });
  };

  if (loading) {
    return (
      <div className="bg-gray-50">
        <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-6 py-8">
          <div className="text-center">
            <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground mt-4">
              Loading project details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          <div className="py-12 text-center">
            <h2 className="mb-2 text-2xl font-bold">Project Not Found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn&apos;t find the project with ID: {projectId}
            </p>
            <button onClick={() => router.push("/teacher-dashboard")}>
              Return to Dashboard
            </button>
          </div>
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
        <div className="mb-6 flex items-center">
          <button
            className="btn btn-ghost btn-sm mr-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {project.name}
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center">
              <School className="mr-2 h-4 w-4" />
              {project.school}
            </p>
          </div>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="card">
            <h3 className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-medium">Project ID</span>
              <div className="h-4 w-4" />
            </h3>
            <span>
              <div className="font-mono text-xl">{project.id}</div>
              <p className="text-muted-foreground text-xs">
                Share with students
              </p>
            </span>
          </div>
          <div className="card">
            <span className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Students</h3>
              <Users className="text-muted-foreground h-4 w-4" />
            </span>
            <div>
              <div className="text-2xl font-bold">{project.students}</div>
              <p className="text-muted-foreground text-xs">
                Participating students
              </p>
            </div>
          </div>
          <div className="card">
            <span className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Emission Reduction</h3>
              <Leaf className="text-muted-foreground h-4 w-4" />
            </span>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {project.reduction}%
              </div>
              <div className="mt-2">
                {/* <Progress value={project.reduction} className="h-2" /> */}
              </div>
              <p className="text-muted-foreground mt-2 text-xs">
                Current reduction goal progress
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-6 md:flex-row">
          <div className="card flex-1">
            <span>
              <h3 className="text-2xl font-bold">Project Overview</h3>
              <span className="text-muted-foreground text-xs">
                Started on {new Date(project.startDate).toLocaleDateString()}
              </span>
            </span>
            <div>
              <p>{project.description}</p>
              <div className="mt-6 flex flex-col items-start gap-5 border-t border-gray-100 pt-4">
                <div className="flex gap-2.5">
                  <h3 className="font-medium">Current Status:</h3>
                  <div className="flex items-center">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        project.status === "active"
                          ? "bg-green-100 text-green-800"
                          : project.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {project.status.charAt(0).toUpperCase() +
                        project.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <h3 className="font-medium">Current Goal:</h3>
                  <span>25% (2028)</span>
                </div>
                <div className="flex gap-2.5">
                  <h3 className="font-medium">Final Goal:</h3>
                  <span>60% (2030)</span>
                </div>
              </div>
            </div>
            <div className="mt-auto flex justify-between">
              <button className="btn-outline btn btn-sm">
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </button>
              <button
                className="btn-outline btn btn-sm"
                onClick={handleShareClick}
              >
                <Share2 className="mr-2 h-4 w-4" />
                {shareButtonText}
              </button>
            </div>
          </div>

          <div className="card flex-1">
            <span>
              <h3 className="text-2xl font-bold">Completed Actions</h3>
              <div className="text-muted-foreground mb-2.5 text-xs">
                Recent actions taken to reduce emissions
              </div>
            </span>
            <div>
              <div className="space-y-4">
                {project.actions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between border-b border-gray-100 pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{action.name}</p>
                      <p className="text-muted-foreground text-sm">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {new Date(action.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="font-medium text-green-600">
                      -{action.reduction}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <button className="btn btn-sm w-full">View All Actions</button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectDetails;
