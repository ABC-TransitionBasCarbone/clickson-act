"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion } from "motion/react";
import Modal from "@/components/Modal";
import SignUpForm from "@/components/User/SignUpForm";
import PassCodeForm from "@/components/User/PassCodeForm ";
import LoginForm from "@/components/User/LoginForm ";
import { useUser } from "@/context/UserContext";
import { useRouter } from "@/i18n/navigation";
import { User } from "lucide-react";

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
  const tUser = useTranslations("User");
  const router = useRouter();
  const { user } = useUser();
  const [showRoleConflict, setShowRoleConflict] = useState<{
    show: boolean;
    type: "teacher" | "student" | null;
  }>({ show: false, type: null });

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is already logged in as a student (has passcode)
    if (user && user.passcode) {
      // Student is already logged in, redirect to calculator
      router.push(`/data-reporting/${user.passcode}`);
    } else if (user && !user.passcode) {
      // User is logged in as teacher, show conflict modal
      setShowRoleConflict({ show: true, type: "teacher" });
    } else {
      // User is not logged in, open the passcode modal
      openModal("passcode");
    }
  };

  const handleTeacherLogin = () => {
    // Check if user is already logged in
    if (user && !user.passcode) {
      // User is already logged in as teacher, redirect to dashboard
      router.push("/dashboard");
    } else if (user && user.passcode) {
      // User is logged in as student, show conflict modal
      setShowRoleConflict({ show: true, type: "student" });
    } else {
      // User is not logged in, open the login modal
      openModal("login");
    }
  };

  const handleRoleConflictClose = () => {
    setShowRoleConflict({ show: false, type: null });
  };

  const handleGoToDashboard = () => {
    setShowRoleConflict({ show: false, type: null });
    router.push("/dashboard");
  };

  return (
    <>
      <div className="mt-15 flex w-full justify-center gap-5">
        <button
          className="btn btn-primary rounded-full font-normal"
          onClick={handleStudentLogin}
        >
          {t("button1")}
        </button>
        <button
          className="btn btn-soft rounded-full bg-white font-normal"
          onClick={handleTeacherLogin}
        >
          {t("button2")}
        </button>
      </div>

      {/* Role Conflict Modal */}
      {showRoleConflict.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3">
              <User className="text-blue-500" size={24} />
              <h3 className="text-lg font-semibold">
                {showRoleConflict.type === "teacher"
                  ? tUser("teacherLoggedIn")
                  : tUser("studentLoggedIn")}
              </h3>
            </div>
            <p className="mb-6 text-gray-600">{tUser("logoutToSwitch")}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleRoleConflictClose}
                className="rounded-lg px-4 py-2 text-gray-600 transition-colors hover:bg-gray-100"
              >
                {tUser("cancel")}
              </button>
              {showRoleConflict.type === "teacher" && (
                <button
                  onClick={handleGoToDashboard}
                  className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                >
                  {tUser("goToDashboard")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
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
  const t = useTranslations("DataReporting");
  const tUser = useTranslations("User");

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
      <Modal id="login" title={tUser("login")}>
        <LoginForm />
      </Modal>
      <Modal id="signup" title={tUser("signup")}>
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
