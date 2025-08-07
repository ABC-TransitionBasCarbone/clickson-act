import { Copy, CopyCheckIcon, Leaf, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Project from "@/types/ProjectType";

const StatCards = ({ project }: { project: Project }) => {
  const t = useTranslations("ProjectDetails");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(project.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mb-8 grid gap-6 md:grid-cols-3">
      <div className="card">
        <h3 className="flex justify-between pb-2 text-sm font-medium">
          {t("projectId")}
        </h3>
        <div className="flex gap-2.5 font-mono text-xl">
          {project.id}
          <button
            onClick={handleCopy}
            className="text-muted-foreground hover:cursor-pointer hover:text-black"
          >
            {copied ? (
              <CopyCheckIcon className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          {t("projectIdHint")}
        </p>
      </div>

      <div className="card">
        <h3 className="flex justify-between pb-2 text-sm font-medium">
          {t("startDate")}
          <Users className="text-muted-foreground h-4 w-4" />
        </h3>
        <div className="text-2xl font-bold">
          {typeof project.startDate === "number"
            ? project.startDate
            : new Date(project.startDate).getFullYear()}
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          {t("startDateHint")}
        </p>
      </div>

      <div className="card">
        <h3 className="flex justify-between pb-2 text-sm font-medium">
          {t("reduction")}
          <Leaf className="text-muted-foreground h-4 w-4" />
        </h3>
        <div className="text-2xl font-bold">
          {project.subGoalReductionAmount}%
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          {t("reductionHint")}
        </p>
      </div>
    </div>
  );
};

export default StatCards;
