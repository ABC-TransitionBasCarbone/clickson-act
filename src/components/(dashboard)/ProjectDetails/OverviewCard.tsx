import { useTranslations } from "next-intl";
import { Edit, Share2 } from "lucide-react";
import { useState } from "react";
import Project from "@/types/ProjectType";

type Props = {
  project: Project;
};

export default function OverviewCard({ project }: Props) {
  const t = useTranslations("ProjectDetails.overview");
  const [shareButtonText, setShareButtonText] = useState("shareButtonText");

  const handleShareClick = () => {
    navigator.clipboard
      .writeText(window.location.href)
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

  return (
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
      <div className="mt-auto flex justify-between">
        <button className="btn btn-soft mt-auto w-fit bg-white">
          <Edit className="mr-2 h-4 w-4" />
          {t("editProject")}
        </button>
        <button
          className="btn btn-soft mt-auto w-fit bg-white"
          onClick={handleShareClick}
        >
          <Share2 className="mr-2 h-4 w-4" />
          {t(shareButtonText)}
        </button>
      </div>
    </div>
  );
}
