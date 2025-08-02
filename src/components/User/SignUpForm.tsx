"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { User, KeyRound, Mail, MapPin, Globe, Building2 } from "lucide-react";
import { useUser } from "@/context/UserContext";

const SignUpForm = () => {
  const t = useTranslations();
  const router = useRouter();
  const { user, setUser } = useUser();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    country: "",
    city: "",
    postalCode: "",
    school: "",
    customSchool: "",
    goal: 50,
    deadlineYear: "2030",
  });
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in when component mounts
  useEffect(() => {
    if (user) {
      // Check if the signup modal is currently open
      const modal = document.getElementById(
        "signup",
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          name: formData.firstName + " " + formData.lastName,
          country: formData.country,
          city: formData.city,
          postalCode: formData.postalCode,
          school:
            formData.school === "Other"
              ? formData.customSchool
              : formData.school,
          goal: formData.school === "Other" ? formData.goal : null,
          deadlineYear:
            formData.school === "Other" ? formData.deadlineYear : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      // Set user in context with authentication token
      setUser({
        username: data.user.username,
        passcode: "", // Teachers don't have passcodes
        uid: data.user.uid,
        token: data.token,
        role: data.user.role,
      });

      // Redirect teacher to dashboard after successful registration (using i18n navigation)
      router.push("/dashboard");
    } catch (err: unknown) {
      let message = "Unknown error";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    }
  };

  const schools = ["School A", "School B", "School C", "Other"];

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
          type="text"
          name="firstName"
          required
          placeholder={t("User.firstName")}
          value={formData.firstName}
          onChange={handleChange}
        />
      </label>

      <label className="w-full input validator">
        <User strokeWidth={1.5} size={20} />
        <input
          type="text"
          name="lastName"
          required
          placeholder={t("User.lastName")}
          value={formData.lastName}
          onChange={handleChange}
        />
      </label>

      <label className="w-full input validator">
        <Mail strokeWidth={1.5} size={20} />
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

      <label className="w-full input validator">
        <Globe strokeWidth={1.5} size={20} />
        <input
          type="text"
          name="country"
          required
          placeholder={t("User.country")}
          value={formData.country}
          onChange={handleChange}
        />
      </label>

      <label className="w-full input validator">
        <MapPin strokeWidth={1.5} size={20} />
        <input
          type="text"
          name="city"
          required
          placeholder={t("User.city")}
          value={formData.city}
          onChange={handleChange}
        />
      </label>

      <label className="w-full input validator">
        <input
          type="text"
          name="postalCode"
          required
          placeholder={t("User.postalCode")}
          value={formData.postalCode}
          onChange={handleChange}
        />
      </label>

      <label className="w-full input validator">
        <Building2 strokeWidth={1.5} size={20} />
        <select
          name="school"
          value={formData.school}
          onChange={handleChange}
          required
          className="outline-none w-full h-full"
        >
          <option value="">{t("User.selectSchool")}</option>
          {schools.map((school) => (
            <option key={school} value={school}>
              {school}
            </option>
          ))}
        </select>
      </label>

      {formData.school === "Other" && (
        <label className="w-full input validator">
          <Building2 strokeWidth={1.5} size={20} />
          <input
            type="text"
            name="customSchool"
            required
            placeholder={t("User.enterSchool")}
            value={formData.customSchool}
            onChange={handleChange}
          />
        </label>
      )}

      {/* Goal and Deadline Fields - Only show when creating new school */}
      {formData.school === "Other" && (
        <>
          {/* Goal Field */}
          <label className="w-full input validator">
            <span className="text-gray-600">%</span>
            <input
              type="number"
              name="goal"
              required
              placeholder={t("User.schoolGoal")}
              value={formData.goal}
              onChange={handleChange}
              min="0"
              max="100"
            />
          </label>

          {/* Deadline Year Field */}
          <label className="w-full input validator">
            <span className="text-gray-600">{t("User.year")}</span>
            <input
              type="number"
              name="deadlineYear"
              required
              placeholder={t("User.deadlineYear")}
              value={formData.deadlineYear}
              onChange={handleChange}
              min={new Date().getFullYear()}
              max={new Date().getFullYear() + 50}
            />
          </label>
        </>
      )}

      {error && <div className="text-red-500">{error}</div>}

      <button type="submit" className="capitalize btn btn-primary">
        {t("User.signup")}
      </button>
    </form>
  );
};

export default SignUpForm;
