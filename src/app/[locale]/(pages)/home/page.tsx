import React from "react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

// Disable static generation for this page
export const dynamic = "force-dynamic";

const HeroSection = async () => {
  const t = await getTranslations();
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <p className="bg-primary/20 text-primary mb-4 inline-block w-fit rounded-full px-3 py-1 text-sm font-medium">
        {t("HomePage.subtitle")}
      </p>
      <h1 className="my-2.5 max-w-6xl text-center text-4xl font-bold lg:text-7xl">
        <span className="text-primary">{t("HomePage.titleText1")} </span>
        {t("HomePage.titleText2")}
      </h1>
      <p className="mt-5 max-w-2xl text-center text-lg text-gray-600">
        {t("HomePage.heroText1")}
      </p>
    </div>
  );
};

const ActionButtons = async () => {
  const t = await getTranslations();
  return (
    <div className="mt-10 flex w-full justify-center gap-5">
      <Link
        href={"/data-reporting"}
        className="btn btn-lg btn-primary w-fit rounded-full font-normal"
      >
        {t("HomePage.button1")}
      </Link>
      <Link
        href={"/about"}
        className="btn btn-lg btn-soft w-fit rounded-full bg-white font-normal"
      >
        {t("HomePage.button2")}
      </Link>
    </div>
  );
};

const HomePage = async () => {
  return (
    <div className="relative flex h-[calc(100vh-1rem)] w-full flex-col justify-between pt-15">
      <div className="container mx-auto mt-0 flex w-full flex-1 flex-col items-start px-4">
        <HeroSection />
        <ActionButtons />
      </div>
      <span>
        <Image
          src="/images/waveBG.png"
          alt="waveBG"
          width={1920}
          height={300}
          className="h-auto w-full"
          priority
        />
      </span>
    </div>
  );
};

export default HomePage;
