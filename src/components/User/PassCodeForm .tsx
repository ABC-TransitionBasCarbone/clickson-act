"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { User, RectangleEllipsis } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useUser } from "@/context/UserContext";

interface PassCodeFormProps {
  onStayOnPage?: boolean;
  onLoginSuccess?: () => void;
}

const PassCodeForm: React.FC<PassCodeFormProps> = ({
  onStayOnPage = false,
  onLoginSuccess,
}) => {
  const t = useTranslations();
  const router = useRouter();
  const { user, setUser } = useUser();
  const [formData, setFormData] = useState({ passcode: "", username: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in when component mounts
  useEffect(() => {
    if (user && user.passcode) {
      // Check if the passcode modal is currently open
      const modal = document.getElementById(
        "passcode",
      ) as HTMLDialogElement | null;
      const unifiedModal = document.getElementById(
        "unified-auth-modal",
      ) as HTMLDialogElement | null;
      const isModalOpen = modal?.open || unifiedModal?.open;

      if (isModalOpen && !onStayOnPage) {
        // Close the modal and redirect
        if (modal) modal.close();
        if (unifiedModal) unifiedModal.close();
        router.push(`/data-reporting/${user.passcode}`);
      }
    }
  }, [user, router, onStayOnPage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
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
      if (!res.ok) throw new Error(data.error || t("User.loginFailed"));
      setUser({
        username: formData.username,
        passcode: formData.passcode,
        studentId: data.studentId,
      });

      // Call success callback if provided
      if (onLoginSuccess) {
        onLoginSuccess();
      }

      // Redirect student to their calculator (using i18n navigation) unless staying on page
      if (!onStayOnPage) {
        router.push(`/data-reporting/${formData.passcode}`);
      }
    } catch (err: unknown) {
      let message = t("User.unknownError");
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Show a message if user is already logged in with a passcode
  if (user && user.passcode) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4 text-gray-600">
          {t("User.alreadyLoggedInAs")} <strong>{user.username}</strong> {t("User.withPasscode")}{" "}
          <strong>{user.passcode}</strong>
        </p>
        <button
          onClick={() => router.push(`/data-reporting/${user.passcode}`)}
          className="btn btn-primary capitalize"
        >
          {t("User.continueToCalculator")}
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

      <button type="submit" className="btn btn-primary capitalize" disabled={loading}>
        {loading ? t("User.loading") || "Loading..." : t("DataReporting.joinPasscode")}
      </button>
    </form>
  );
};

export default PassCodeForm;
