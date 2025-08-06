"use client";
import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { motion } from "motion/react";

const HeroSection = () => {
  const t = useTranslations();
  return (
    <div className="flex w-full flex-col items-center justify-center">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-primary/20 text-primary mb-4 inline-block w-fit rounded-full px-3 py-1 text-sm font-medium"
      >
        {t("HomePage.subtitle")}
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="my-2.5 max-w-6xl text-center text-4xl font-bold lg:text-7xl"
      >
        <span className="text-primary">{t("HomePage.titleText1")} </span>
        {t("HomePage.titleText2")}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-5 max-w-2xl text-center text-lg text-gray-600"
      >
        {t("HomePage.heroText1")}
      </motion.p>
    </div>
  );
};

const ActionButtons = () => {
  const t = useTranslations();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-10 flex w-full justify-center gap-5"
    >
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
    </motion.div>
  );
};

const HomePage = () => {
  return (
    <div className="relative flex h-[calc(100vh-1rem)] w-full flex-col justify-between pt-15">
      <div className="container mx-auto mt-0 flex w-full flex-1 flex-col items-start px-4">
        <HeroSection />
        <ActionButtons />
      </div>
      <motion.span
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          src="/images/waveBG.png"
          alt="waveBG"
          layout="responsive"
          width={1920}
          height={300}
          objectFit="cover"
        />
      </motion.span>
    </div>
  );
};

export default HomePage;
