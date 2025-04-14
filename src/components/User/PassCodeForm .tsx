"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { User, RectangleEllipsis } from "lucide-react";
import { useRouter } from "@/i18n/navigation";

const PassCodeForm = () => {
  const t = useTranslations();
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", passcode: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Passcode data:", formData);

    router.push("/calculator/test");
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <label className="input validator w-full">
        <User strokeWidth={1.5} size={20} />
        <input
          type="text"
          name="username"
          required
          placeholder={t("User.username")}
          pattern="[A-Za-z][A-Za-z0-9\-]*"
          minLength={3}
          maxLength={30}
          value={formData.username}
          onChange={handleChange}
        />
      </label>

      <label className="input validator w-full">
        <RectangleEllipsis strokeWidth={1.5} size={20} />
        <input
          type="text"
          name="passcode"
          required
          placeholder={t("User.passcode")}
          minLength={8}
          value={formData.passcode}
          onChange={handleChange}
        />
      </label>

      <button type="submit" className="btn btn-primary capitalize">
        {t("Calculator.joinPasscode")}
      </button>
    </form>
  );
};

export default PassCodeForm;
