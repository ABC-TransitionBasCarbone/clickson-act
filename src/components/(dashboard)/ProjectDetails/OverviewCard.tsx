import { useTranslations, useLocale } from "next-intl";
import { Edit, Share2 } from "lucide-react";
import { useState } from "react";
import { usePathname } from "@/i18n/navigation";
import Project from "@/types/ProjectType";
import ProjectForm from "@/types/ProjectForm";
import { ProjectFormModal } from "@/app/[locale]/(pages)/dashboard/ProjectFormModal";

type Props = {
  project: Project;
};

export default function OverviewCard({ project }: Props) {
  const t = useTranslations("ProjectDetails.overview");
  const locale = useLocale();
  const pathname = usePathname();
  const [shareButtonText, setShareButtonText] = useState("shareButtonText");

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editableProject, setEditableProject] = useState<ProjectForm>({
    name: project.name,
    school: project.school,
    students: project.students,
    startDate: project.startDate,
    finalGoal: project.finalGoalDate || new Date().toISOString().split("T")[0], // ProjectForm expects finalGoal as date
    goalReductionAmount: Number(project.finalGoal) || 0, // ProjectForm expects number
    subGoal: new Date().toISOString().split("T")[0],
    reductionSubGoal: new Date().toISOString().split("T")[0],
  });
  const [localProject, setLocalProject] = useState(project);

  const handleShareClick = () => {
    // Create the full URL with locale
    const fullUrl = `${window.location.origin}/${locale}${pathname}`;

    navigator.clipboard
      .writeText(fullUrl)
      .then(() => {
        setShareButtonText("shareButtonTextCopied");
        setTimeout(() => {
          setShareButtonText("shareButtonText");
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy URL: ", err);
      });
  };

  const handleEditClick = () => {
    setEditableProject({
      name: localProject.name,
      school: localProject.school,
      students: localProject.students,
      startDate: localProject.startDate,
      finalGoal:
        localProject.finalGoalDate || new Date().toISOString().split("T")[0],
      goalReductionAmount: Number(localProject.finalGoal) || 0,
      subGoal: new Date().toISOString().split("T")[0],
      reductionSubGoal: new Date().toISOString().split("T")[0],
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = () => {
    setLocalProject((prev) => ({
      ...prev,
      name: editableProject.name,
      startDate: editableProject.startDate,
      finalGoalDate: editableProject.finalGoal,
      finalGoal: String(editableProject.goalReductionAmount),
    }));
    setIsEditOpen(false);
  };

  return (
    <div className="flex-1 card">
      <span>
        <h3 className="font-bold text-2xl">Project Overview</h3>
        <span className="text-muted-foreground text-xs">
          Started on {new Date(localProject.startDate).toLocaleDateString()}
        </span>
      </span>
      <div>
        <p>{localProject.description}</p>
        <div className="flex flex-col items-start gap-5 mt-6 pt-4 border-gray-100 border-t">
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
            <span>
              {project.subgoal}% ({project.subGoalDate})
            </span>
          </div>
          <div className="flex gap-2.5">
            <h3 className="font-medium">Final Goal:</h3>
            <span>
              {project.finalGoal}% ({project.finalGoalDate})
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-auto">
        <button
          className="bg-white mt-auto w-fit btn btn-soft"
          onClick={handleEditClick}
        >
          <Edit className="mr-2 w-4 h-4" />
          {t("editProject")}
        </button>
        <button
          className="bg-white mt-auto w-fit btn btn-soft"
          onClick={handleShareClick}
        >
          <Share2 className="mr-2 w-4 h-4" />
          {t(shareButtonText)}
        </button>
      </div>
      {isEditOpen && (
        <ProjectFormModal
          form={editableProject}
          setForm={setEditableProject}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}
