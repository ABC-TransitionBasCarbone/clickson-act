"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { User, KeyRound } from "lucide-react";

const openModal = (id: string) => {
  const modal = document.getElementById(id) as HTMLDialogElement | null;
  if (modal) modal.showModal();
};

const LoginForm = () => {
  const t = useTranslations();
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login data:", formData);

    // Redirect to dashboard after login
    router.push("/dashboard");
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
        <KeyRound strokeWidth={1.5} size={20} />
        <input
          type="password"
          name="password"
          required
          placeholder={t("User.password")}
          minLength={8}
          value={formData.password}
          onChange={handleChange}
        />
      </label>

      <button type="submit" className="btn btn-primary capitalize">
        {t("User.login")}
      </button>

      <button
        type="button"
        className="btn btn-link capitalize"
        onClick={() => openModal("signup")}
      >
        {t("User.signup")}
      </button>
    </form>
  );
};

export default LoginForm;
