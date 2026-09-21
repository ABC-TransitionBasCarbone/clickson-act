import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFoundPage() {
  const t = await getTranslations("NotFoundPage");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-primary/20 mb-2 text-8xl font-bold tracking-tight lg:text-9xl">
        404
      </p>
      <h1 className="mb-3 text-3xl font-bold lg:text-4xl">{t("title")}</h1>
      <p className="mb-8 max-w-md text-lg text-gray-600">{t("description")}</p>
      <Link
        href="/"
        className="btn btn-lg btn-primary w-fit rounded-full font-normal"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
