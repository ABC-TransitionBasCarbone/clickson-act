import { ArrowLeft, School } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Project from "@/types/Project";

const Header = ({ project }: { project: Project }) => {
  const router = useRouter();
  const t = useTranslations("ProjectDetails");

  return (
    <div className="mb-6 flex items-center">
      <button
        className="btn btn-ghost btn-sm mr-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("back")}
      </button>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        <p className="text-muted-foreground mt-1 flex items-center">
          <School className="mr-2 h-4 w-4" />
          {project.school}
        </p>
      </div>
    </div>
  );
};

export default Header;
