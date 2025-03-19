"use client";
import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Modal from "@/components/Modal";
import { KeyRound, RectangleEllipsis, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { motion } from "motion/react";

const HeroSection = () => {
  const t = useTranslations();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex w-full flex-col items-center justify-center"
    >
      <h2 className="my-2.5 max-w-6xl text-center text-4xl font-bold lg:text-7xl">
        {t("Calculator.titleText1")}
      </h2>
      <p className="max-w-2xl text-center text-lg text-gray-600">
        {t("Calculator.titleText2")}
      </p>
      <p className="mb-10 max-w-2xl text-center text-lg text-gray-600">
        {t("Calculator.heroText1")}
      </p>
    </motion.div>
  );
};

const ActionButtons = ({ openModal }: { openModal: (id: string) => void }) => {
  const t = useTranslations();
  return (
    <div className="mt-15 flex w-full justify-center gap-5">
      <button
        className="btn btn-primary w-fit rounded-full font-normal"
        onClick={() => openModal("my_modal_1")}
      >
        {t("Calculator.button1")}
      </button>
      <button
        className="btn btn-soft w-fit rounded-full bg-white font-normal"
        onClick={() => openModal("my_modal_2")}
      >
        {t("Calculator.button2")}
      </button>
    </div>
  );
};

const HowItWorks = () => {
  const t = useTranslations();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex w-full max-w-2xl flex-col items-center justify-center self-center"
    >
      <h3 className="mb-5 text-xl font-bold">
        {t("Calculator.howItWorksTitle")}
      </h3>
      <div className="grid gap-5 md:grid-cols-3">
        {[1, 2, 3].map((number) => (
          <div
            key={number}
            className="bg-primary/10 flex flex-col items-center justify-center gap-2.5 rounded-xl p-5 text-center shadow-sm"
          >
            <span className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full p-2.5 text-xl font-bold">
              {number}
            </span>
            <span>{t(`Calculator.howItWorksBox${number}Title`)}</span>
            <p className="text-sm text-gray-600">
              {t(`Calculator.howItWorksBox${number}Text`)}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const LoginForm = () => {
  const t = useTranslations();
  return (
    <>
      <label className="input validator w-full">
        <User strokeWidth={1.5} size={20} />
        <input
          type="text"
          required
          placeholder={t("User.username")}
          pattern="[A-Za-z][A-Za-z0-9\-]*"
          minLength={3}
          maxLength={30}
        />
      </label>
      <label className="input validator w-full">
        <KeyRound strokeWidth={1.5} size={20} />

        <input
          type="password"
          required
          placeholder={t("User.password")}
          minLength={8}
        />
      </label>
      <Link
        href={"/dashboard/styfrstn"}
        className="btn btn-primary mt-4 capitalize"
      >
        {t("User.login")}
      </Link>
      <button className="btn btn-link capitalize">{t("User.signup")}</button>
    </>
  );
};

const PasscodeForm = () => {
  const t = useTranslations();
  return (
    <>
      <label className="input validator w-full">
        <User strokeWidth={1.5} size={20} />

        <input
          type="input"
          required
          placeholder={t("User.username")}
          pattern="[A-Za-z][A-Za-z0-9\-]*"
          minLength={3}
          maxLength={30}
        />
      </label>
      <label className="input validator w-full">
        <RectangleEllipsis strokeWidth={1.5} size={20} />
        <input
          type="password"
          required
          placeholder={t("User.passcode")}
          minLength={8}
        />
      </label>
      <Link
        href={"/calculator/student/styfrstn"}
        className="btn btn-primary mt-4"
      >
        {t("Calculator.joinPasscode")}
      </Link>
    </>
  );
};

const Calculator = () => {
  const t = useTranslations();
  const openModal = (id: string) => {
    const modal = document.getElementById(id) as HTMLDialogElement | null;
    if (modal) modal.showModal();
  };

  return (
    <div className="relative flex h-[calc(100vh-6rem)] w-full flex-col justify-between pt-15">
      <div className="container mx-auto mt-0 flex w-full flex-1 flex-col items-start px-4 lg:justify-between">
        <HeroSection />

        <HowItWorks />

        <ActionButtons openModal={openModal} />
      </div>

      <Modal id="my_modal_1" title={t("Calculator.joinClassroom")}>
        <PasscodeForm />
      </Modal>
      <Modal id="my_modal_2" title={t("User.login")}>
        <LoginForm />
      </Modal>
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
