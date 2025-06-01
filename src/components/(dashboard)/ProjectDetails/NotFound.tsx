import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

const NotFound = ({ projectId }: { projectId: string }) => {
  const t = useTranslations("ProjectDetails");
  const router = useRouter();

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="py-12 text-center">
          <h2 className="mb-2 text-2xl font-bold">{t("notFound.title")}</h2>
          <p className="text-muted-foreground mb-6">
            {t("notFound.description", { id: projectId })}
          </p>
          <button onClick={() => router.push("/teacher-dashboard")}>
            {t("notFound.returnButton")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
