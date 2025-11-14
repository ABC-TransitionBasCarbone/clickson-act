"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import UnifiedAuthModal from "@/components/User/UnifiedAuthModal";

const ActionButtons = () => {
  const t = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="mt-10 flex w-full justify-center gap-5">
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-lg btn-primary w-fit rounded-full font-normal"
        >
          {t("HomePage.button1")}
        </button>
        <button
          className="btn btn-lg btn-soft hidden w-fit rounded-full bg-white font-normal"
        >
          {t("HomePage.button2")}
        </button>
      </div>
      <UnifiedAuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default ActionButtons;

