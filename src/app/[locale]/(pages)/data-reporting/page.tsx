"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useUser } from "@/context/UserContext";
import { useRouter } from "@/i18n/navigation";
import Project from "@/types/ProjectType";
import Modal from "@/components/Modal";
import LoginForm from "@/components/User/LoginForm ";
import SignUpForm from "@/components/User/SignUpForm";
import PassCodeForm from "@/components/User/PassCodeForm ";
import LoadingState from "@/components/ui/LoadingState";

const DataReportingIndex: React.FC = () => {
  const t = useTranslations("DataReporting");
  const { user } = useUser();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Function to open login modal
  const openLoginModal = () => {
    setShowLoginModal(true);
    const modal = document.getElementById("login") as HTMLDialogElement | null;
    if (modal) modal.showModal();
  };

  useEffect(() => {
    const fetchProjects = async () => {
      if (user === undefined) {
        // Still loading user state
        return;
      }

      if (!user) {
        // User not logged in, show login prompt
        setLoading(false);
        setShowLoginModal(true);
        return;
      }

      try {
        // If user has passcode (student), redirect directly to their project
        if (user.passcode) {
          router.push(`/data-reporting/${user.passcode}`);
          return;
        }

        // If user is teacher, fetch their projects
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

    fetchProjects();
  }, [user, router]);

  if (loading) {
    return (
      <LoadingState 
        messageKey="loadingProjects"
        namespace="DataReporting"
        spinnerSize="large"
      />
    );
  }

  // Show login prompt if user is not authenticated
  if (showLoginModal && !user) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto px-6 py-8 container"
        >
          <div className="text-center">
            <h1 className="mb-4 font-bold text-3xl tracking-tight">
              {t("title")}
            </h1>
            <p className="mb-8 text-gray-600">
              Please login to access the data reporting features
            </p>

            <div className="flex justify-center gap-4">
              <button onClick={openLoginModal} className="btn btn-primary">
                Teacher Login
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(true);
                  const modal = document.getElementById(
                    "passcode",
                  ) as HTMLDialogElement | null;
                  if (modal) modal.showModal();
                }}
                className="btn btn-secondary"
              >
                Student Connect
              </button>
            </div>
          </div>

          {/* Login/Register Modals */}
          <Modal id="login" title="Teacher Login">
            <LoginForm />
          </Modal>
          <Modal id="signup" title="Teacher Registration">
            <SignUpForm />
          </Modal>
          <Modal id="passcode" title="Student Connect">
            <PassCodeForm />
          </Modal>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <div className="mx-auto px-6 py-8 container">
          <div className="text-center">
            <h1 className="mb-4 font-bold text-red-600 text-2xl">
              {t("error")}
            </h1>
            <p className="mb-4 text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto px-6 py-8 container"
      >
        <div className="mb-8">
          <h1 className="font-bold text-3xl tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-gray-600">{t("selectProject")}</p>
        </div>

        <div className="gap-6 grid md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="hover:shadow-md transition-shadow cursor-pointer card"
              onClick={() => router.push(`/dashboard/projects/${project.id}`)}
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
                    {project.status}
                  </span>
                </div>
              </div>
              <div>
                <div className="gap-4 grid grid-cols-2 text-sm">
                  <div>
                    <p className="text-gray-500">{t("startDate")}</p>
                    <p className="font-medium">
                      {typeof project.startDate === "number"
                        ? project.startDate
                        : new Date(project.startDate).getFullYear()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t("subGoal")}</p>
                    <p className="font-medium">
                      {typeof project.subGoalDeadline === "number"
                        ? project.subGoalDeadline
                        : new Date(project.subGoalDeadline).getFullYear()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t("reductionGoal")}</p>
                    <p className="font-medium text-green-600">
                      {project.subGoalReductionAmount}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">{t("passcode")}</p>
                    <p className="font-mono font-medium text-sm">
                      {project.passcode}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <div className="flex-1 btn btn-primary">
                  {t("viewProjectDetails")}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/data-reporting/${project.passcode}`);
                  }}
                  className="btn btn-secondary"
                >
                  Student Calculator
                </button>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && !showLoginModal && (
          <div className="py-12 text-center">
            <h2 className="mb-2 font-semibold text-xl">
              {t("noProjectsFound")}
            </h2>
            <p className="mb-4 text-gray-600">{t("noProjectsDescription")}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DataReportingIndex;
