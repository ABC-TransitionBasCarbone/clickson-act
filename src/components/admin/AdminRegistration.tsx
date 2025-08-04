"use client";

import React, { useState } from "react";
import { User, KeyRound, Mail, Shield } from "lucide-react";

const AdminRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

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
          country: "",
          city: "",
          postalCode: "",
          school: "",
          goal: null,
          deadlineYear: null,
          role: "admin", // Set role to admin
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");

      setSuccess("Admin account created successfully!");
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
    } catch (err: unknown) {
      let message = "Unknown error";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <Shield className="text-primary mx-auto mb-4 h-12 w-12" />
        <p className="mt-2 text-gray-600">Register a new administrator</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="input validator w-full">
          <User strokeWidth={1.5} size={20} />
          <input
            type="text"
            name="firstName"
            required
            placeholder="First Name"
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
            placeholder="Last Name"
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
            placeholder="Email"
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
            placeholder="Password"
            minLength={6}
            value={formData.password}
            onChange={handleChange}
          />
        </label>

        {error && (
          <div className="rounded bg-red-50 p-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded bg-green-50 p-3 text-sm text-green-500">
            {success}
          </div>
        )}

        <button type="submit" className="btn btn-primary w-full">
          Create Admin Account
        </button>
      </form>
    </div>
  );
};

export default AdminRegistration;
