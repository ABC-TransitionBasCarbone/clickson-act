"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { User, RectangleEllipsis } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useUser } from "@/context/UserContext";

const PassCodeForm = () => {
  const t = useTranslations();
  const router = useRouter();
  const { user, setUser } = useUser();
  const [formData, setFormData] = useState({ passcode: "", username: "" });
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in when component mounts
  useEffect(() => {
    if (user && user.passcode) {
      // Check if the passcode modal is currently open
      const modal = document.getElementById(
        "passcode",
      ) as HTMLDialogElement | null;
      const isModalOpen = modal?.open;

      if (isModalOpen) {
        // Close the modal and redirect
        if (modal) modal.close();
        router.push(`/data-reporting/${user.passcode}`);
      }
    }
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passcode: formData.passcode,
          name: formData.username,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setUser({
        username: formData.username,
        passcode: formData.passcode,
        studentId: data.studentId,
      });
      // Redirect student to their calculator (using i18n navigation)
      router.push(`/data-reporting/${formData.passcode}`);
    } catch (err: unknown) {
      let message = "Unknown error";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    }
  };

  // Show a message if user is already logged in with a passcode
  if (user && user.passcode) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4 text-gray-600">
          You are already logged in as <strong>{user.username}</strong> with
          passcode <strong>{user.passcode}</strong>
        </p>
        <button
          onClick={() => router.push(`/data-reporting/${user.passcode}`)}
          className="btn btn-primary capitalize"
        >
          Continue to Calculator
        </button>
      </div>
    );
  }

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

      {error && <div className="text-red-500">{error}</div>}

      <button type="submit" className="btn btn-primary capitalize">
        {t("DataReporting.joinPasscode")}
      </button>
    </form>
  );
};

export default PassCodeForm;
