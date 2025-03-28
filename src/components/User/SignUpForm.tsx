"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { User, KeyRound, Mail, MapPin, Globe, Building2 } from "lucide-react";

const SignUpForm = () => {
  const t = useTranslations();
  const router = useRouter();
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
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Signup data:", formData);
    router.push("/dashboard");
  };

  const schools = ["School A", "School B", "School C", "Other"];

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <label className="input validator w-full">
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

      <label className="input validator w-full">
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

      <label className="input validator w-full">
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

      <label className="input validator w-full">
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

      <label className="input validator w-full">
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

      <label className="input validator w-full">
        <input
          type="text"
          name="postalCode"
          required
          placeholder={t("User.postalCode")}
          value={formData.postalCode}
          onChange={handleChange}
        />
      </label>

      <label className="input validator w-full">
        <Building2 strokeWidth={1.5} size={20} />
        <select
          name="school"
          value={formData.school}
          onChange={handleChange}
          required
          className="h-full w-full outline-none"
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
        <label className="input validator w-full">
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

      <button type="submit" className="btn btn-primary capitalize">
        {t("User.signup")}
      </button>
    </form>
  );
};

export default SignUpForm;
