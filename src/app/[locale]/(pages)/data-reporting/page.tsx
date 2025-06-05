"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion } from "motion/react";
import Modal from "@/components/Modal";
import SignUpForm from "@/components/User/SignUpForm";
import PassCodeForm from "@/components/User/PassCodeForm ";
import LoginForm from "@/components/User/LoginForm ";
import { useUser } from "@/context/UserContext";
import { useRouter } from "@/i18n/navigation";

const HeroSection = () => {
  const t = useTranslations("DataReporting");
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex w-full flex-col items-center justify-center"
    >
      <h2 className="my-2.5 max-w-6xl text-center text-4xl font-bold lg:text-7xl">
        {t("titleText1")}
      </h2>
      <p className="max-w-2xl text-center text-lg text-gray-600">
        {t("titleText2")}
      </p>
      <p className="mb-10 max-w-2xl text-center text-lg text-gray-600">
        {t("heroText1")}
      </p>
    </motion.div>
  );
};

const ActionButtons = () => {
  const t = useTranslations("DataReporting");
  const router = useRouter();
  const { user } = useUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (user) openModal("passcode");

    router.push(`/data-reporting/${user?.passcode}`);
  };

  return (
    <div className="mt-15 flex w-full justify-center gap-5">
      <button
        className="btn btn-primary rounded-full font-normal"
        onClick={handleSubmit}
      >
        {t("button1")}
      </button>
      <button
        className="btn btn-soft rounded-full bg-white font-normal"
        onClick={() => openModal("login")}
      >
        {t("button2")}
      </button>
    </div>
  );
};

const HowItWorks = () => {
  const t = useTranslations("DataReporting");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex w-full max-w-2xl flex-col items-center justify-center self-center"
    >
      <h3 className="mb-5 text-xl font-bold">{t("howItWorksTitle")}</h3>
      <div className="grid gap-5 md:grid-cols-3">
        {[1, 2, 3].map((number) => (
          <div
            key={number}
            className="bg-primary/10 flex flex-col items-center justify-center gap-2.5 rounded-xl p-5 text-center shadow-sm"
          >
            <span className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full p-2.5 text-xl font-bold">
              {number}
            </span>
            <span>{t(`howItWorksBox${number}Title`)}</span>
            <p className="text-sm text-gray-600">
              {t(`howItWorksBox${number}Text`)}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const openModal = (id: string) => {
  const modal = document.getElementById(id) as HTMLDialogElement | null;
  if (modal) modal.showModal();
};

const Calculator = () => {
  const t = useTranslations();

  return (
    <div className="relative flex h-[calc(100vh-6rem)] w-full flex-col justify-between pt-15">
      <div className="container mx-auto flex flex-1 flex-col items-start px-4 lg:justify-between">
        <HeroSection />
        <HowItWorks />
        <ActionButtons />
      </div>

      {/* Modals */}
      <Modal id="passcode" title={t("joinClassroom")}>
        <PassCodeForm />
      </Modal>
      <Modal id="login" title={t("User.login")}>
        <LoginForm />
      </Modal>
      <Modal id="signup" title={t("User.signup")}>
        <SignUpForm />
      </Modal>

      {/* Background Image */}
      <Image
        src="/images/waveBG.png"
        alt="waveBG"
        layout="responsive"
        width={1920}
        height={300}
        objectFit="cover"
      />
    </div>
  );
};

export default Calculator;
