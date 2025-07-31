"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { User, KeyRound } from "lucide-react";
import { useUser } from "@/context/UserContext";

const openModal = (id: string) => {
  const modal = document.getElementById(id) as HTMLDialogElement | null;
  if (modal) modal.showModal();
};

const LoginForm = () => {
  const t = useTranslations();
  const router = useRouter();
  const { user, setUser } = useUser();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in when component mounts
  useEffect(() => {
    if (user) {
      // Check if the login modal is currently open
      const modal = document.getElementById(
        "login",
      ) as HTMLDialogElement | null;
      const isModalOpen = modal?.open;

      if (isModalOpen) {
        // Close the modal if it's open
        if (modal) modal.close();

        // Redirect based on user type
        if (user.passcode) {
          // Student - redirect to their calculator
          router.push(`/data-reporting/${user.passcode}`);
        } else {
          // Teacher - redirect to dashboard
          router.push("/dashboard");
        }
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      // Set user in context (no passcode for teachers)
      setUser({
        username: data.user.username,
        passcode: "", // Teachers don't have passcodes
      });

      // Redirect to dashboard after teacher login (using i18n navigation)
      router.push("/dashboard");
    } catch (err: unknown) {
      let message = "Unknown error";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    }
  };

  const handleSignupClick = () => {
    // Check if user is already logged in
    if (user && !user.passcode) {
      // Close current modal and redirect to dashboard
      const modal = document.getElementById(
        "login",
      ) as HTMLDialogElement | null;
      if (modal) modal.close();
      router.push("/dashboard");
    } else if (user && user.passcode) {
      // User is logged in as student, redirect to their calculator
      const modal = document.getElementById(
        "login",
      ) as HTMLDialogElement | null;
      if (modal) modal.close();
      router.push(`/data-reporting/${user.passcode}`);
    } else {
      // User is not logged in, open the signup modal
      openModal("signup");
    }
  };

  // Show a message if user is already logged in
  if (user) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4 text-gray-600">
          You are already logged in as <strong>{user.username}</strong>
          {user.passcode && (
            <span className="block mt-1 text-gray-500 text-sm">
              Passcode: {user.passcode}
            </span>
          )}
        </p>
        {user.passcode ? (
          <button
            onClick={() => router.push(`/data-reporting/${user.passcode}`)}
            className="capitalize btn btn-primary"
          >
            Go to Calculator
          </button>
        ) : (
          <button
            onClick={() => router.push("/dashboard")}
            className="capitalize btn btn-primary"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <label className="w-full input validator">
        <User strokeWidth={1.5} size={20} />
        <input
          type="email"
          name="email"
          required
          placeholder={t("User.email")}
          value={formData.email}
          onChange={handleChange}
        />
      </label>

      <label className="w-full input validator">
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

      {error && <div className="text-red-500">{error}</div>}

      <button type="submit" className="capitalize btn btn-primary">
        {t("User.login")}
      </button>

      <button
        type="button"
        className="capitalize btn btn-link"
        onClick={handleSignupClick}
      >
        {t("User.signup")}
      </button>
    </form>
  );
};

export default LoginForm;
