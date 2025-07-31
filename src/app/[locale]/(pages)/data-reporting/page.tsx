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
      className="flex flex-col justify-center items-center w-full"
    >
      <h2 className="my-2.5 max-w-6xl font-bold text-4xl lg:text-7xl text-center">
        {t("titleText1")}
      </h2>
      <p className="max-w-2xl text-gray-600 text-lg text-center">
        {t("titleText2")}
      </p>
      <p className="mb-10 max-w-2xl text-gray-600 text-lg text-center">
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
      <div className="flex justify-center gap-5 mt-15 w-full">
        <button
          className="rounded-full font-normal btn btn-primary"
          onClick={handleStudentLogin}
        >
          {t("button1")}
        </button>
        <button
          className="bg-white rounded-full font-normal btn btn-soft"
          onClick={handleTeacherLogin}
        >
          {t("button2")}
        </button>
      </div>

      {/* Role Conflict Modal */}
      {showRoleConflict.show && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50">
          <div className="bg-white shadow-xl mx-4 p-6 rounded-lg max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <User className="text-blue-500" size={24} />
              <h3 className="font-semibold text-lg">
                {showRoleConflict.type === "teacher"
                  ? tUser("teacherLoggedIn")
                  : tUser("studentLoggedIn")}
              </h3>
            </div>
            <p className="mb-6 text-gray-600">{tUser("logoutToSwitch")}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleRoleConflictClose}
                className="hover:bg-gray-100 px-4 py-2 rounded-lg text-gray-600 transition-colors"
              >
                {tUser("cancel")}
              </button>
              {showRoleConflict.type === "teacher" && (
                <button
                  onClick={handleGoToDashboard}
                  className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white transition-colors"
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
      className="flex flex-col justify-center items-center self-center w-full max-w-2xl"
    >
      <h3 className="mb-5 font-bold text-xl">{t("howItWorksTitle")}</h3>
      <div className="gap-5 grid md:grid-cols-3">
        {[1, 2, 3].map((number) => (
          <div
            key={number}
            className="flex flex-col justify-center items-center gap-2.5 bg-primary/10 shadow-sm p-5 rounded-xl text-center"
          >
            <span className="flex justify-center items-center bg-primary/10 p-2.5 rounded-full w-12 h-12 font-bold text-primary text-xl">
              {number}
            </span>
            <span>{t(`howItWorksBox${number}Title`)}</span>
            <p className="text-gray-600 text-sm">
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

  return (
    <div className="relative flex flex-col justify-between pt-15 w-full h-[calc(100vh-6rem)]">
      <div className="flex flex-col flex-1 lg:justify-between items-start mx-auto px-4 container">
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
