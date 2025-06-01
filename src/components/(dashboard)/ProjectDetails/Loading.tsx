import { useTranslations } from "next-intl";

const Loading = () => {
  const t = useTranslations("ProjectDetails");
  return (
    <div className="bg-gray-50">
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-6 py-8">
        <div className="text-center">
          <div className="border-primary mx-auto h-12 w-12 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground mt-4">{t("loading")}</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;
