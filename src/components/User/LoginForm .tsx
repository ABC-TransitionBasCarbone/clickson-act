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

      // Set user in context with authentication token
      setUser({
        username: data.user.username,
        passcode: "", // Teachers don't have passcodes
        uid: data.user.uid,
        token: data.token,
        role: data.user.role,
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
            <span className="mt-1 block text-sm text-gray-500">
              Passcode: {user.passcode}
            </span>
          )}
        </p>
        {user.passcode ? (
          <button
            onClick={() => router.push(`/data-reporting/${user.passcode}`)}
            className="btn btn-primary capitalize"
          >
            Go to Calculator
          </button>
        ) : (
          <button
            onClick={() => router.push("/dashboard")}
            className="btn btn-primary capitalize"
          >
            Go to Dashboard
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <label className="input validator w-full">
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

      {error && <div className="text-red-500">{error}</div>}

      <div className="flex flex-col">
        <button type="submit" className="btn btn-primary capitalize">
          {t("User.login")}
        </button>

        <button
          type="button"
          className="btn btn-link capitalize"
          onClick={handleSignupClick}
        >
          {t("User.signup")}
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
