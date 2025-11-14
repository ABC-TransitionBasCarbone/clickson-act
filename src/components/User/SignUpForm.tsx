"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { User, KeyRound, Mail, MapPin, Globe, Building2 } from "lucide-react";
import { useUser } from "@/context/UserContext";

// List of countries for the select dropdown
const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

interface SignUpFormProps {
  onStayOnPage?: boolean;
  onSignupSuccess?: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  onStayOnPage = false,
  onSignupSuccess,
}) => {
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
  const [schools, setSchools] = useState<
    Array<{ id: string; name: string; goal: number; deadlineYear: string }>
  >([]);
  const [loading, setLoading] = useState(true);

  // Fetch schools from database
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch("/api/schools");
        const data = await response.json();

        if (data.success) {
          setSchools(data.schools);
        } else {
          console.error("Failed to fetch schools:", data.error);
        }
      } catch (error) {
        console.error("Error fetching schools:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  // Check if user is already logged in when component mounts
  useEffect(() => {
    if (user) {
      // Check if the signup modal is currently open
      const modal = document.getElementById(
        "signup",
      ) as HTMLDialogElement | null;
      const unifiedModal = document.getElementById(
        "unified-auth-modal",
      ) as HTMLDialogElement | null;
      const isModalOpen = modal?.open || unifiedModal?.open;

      if (isModalOpen && !onStayOnPage) {
        // Close the modal if it's open
        if (modal) modal.close();
        if (unifiedModal) unifiedModal.close();

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
  }, [user, router, onStayOnPage]);

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
      if (!res.ok) throw new Error(data.error || t("User.registrationFailed"));

      // Set user in context with authentication token
      setUser({
        username: data.user.username,
        passcode: "", // Teachers don't have passcodes
        uid: data.user.uid,
        token: data.token,
        role: data.user.role,
      });

      // Call success callback if provided
      if (onSignupSuccess) {
        onSignupSuccess();
      }

      // Redirect teacher to dashboard after successful registration (using i18n navigation) unless staying on page
      if (!onStayOnPage) {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      let message = t("User.unknownError");
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    }
  };

  // Show a message if user is already logged in
  if (user) {
    return (
      <div className="p-4 text-center">
        <p className="mb-4 text-gray-600">
          {t("User.alreadyLoggedInAs")} <strong>{user.username}</strong>
          {user.passcode && (
            <span className="mt-1 block text-sm text-gray-500">
              {t("User.passcodeColon")} {user.passcode}
            </span>
          )}
        </p>
        {user.passcode ? (
          <button
            onClick={() => router.push(`/data-reporting/${user.passcode}`)}
            className="btn btn-primary capitalize"
          >
            {t("User.goToCalculator")}
          </button>
        ) : (
          <button
            onClick={() => router.push("/dashboard")}
            className="btn btn-primary capitalize"
          >
            {t("User.goToDashboard")}
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
          type="text"
          name="firstName"
          required
          placeholder={t("User.firstName") + " *"}
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
          placeholder={t("User.lastName") + " *"}
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
          placeholder={t("User.email") + " *"}
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
          placeholder={t("User.password") + " *"}
          minLength={8}
          value={formData.password}
          onChange={handleChange}
        />
      </label>

      <label className="input validator w-full">
        <Globe strokeWidth={1.5} size={20} />
        <select
          name="country"
          value={formData.country}
          onChange={handleChange}
          required
          className="h-full w-full outline-none"
        >
          <option value="">{t("User.country") + " *"}</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </label>

      <label className="input validator w-full">
        <MapPin strokeWidth={1.5} size={20} />
        <input
          type="text"
          name="city"
          required
          placeholder={t("User.city") + " *"}
          value={formData.city}
          onChange={handleChange}
        />
      </label>

      <label className="input validator w-full">
        <input
          type="text"
          name="postalCode"
          required
          placeholder={t("User.postalCode") + " *"}
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
          disabled={loading}
        >
          <option value="">
            {loading ? t("User.loadingSchools") : t("User.selectSchool") + " *"}
          </option>
          {schools.map((school) => (
            <option key={school.id} value={school.name}>
              {school.name}
            </option>
          ))}
          <option value="Other">{t("User.other")}</option>
        </select>
      </label>

      {formData.school === "Other" && (
        <label className="input validator w-full">
          <Building2 strokeWidth={1.5} size={20} />
          <input
            type="text"
            name="customSchool"
            required
            placeholder={t("User.enterSchool") + " *"}
            value={formData.customSchool}
            onChange={handleChange}
          />
        </label>
      )}

      {/* Goal and Deadline Fields - Only show when creating new school */}
      {formData.school === "Other" && (
        <>
          {/* Goal Field */}
          <div className="w-full">
            <label className="input validator w-full">
              <span className="text-gray-600">%</span>
              <input
                type="number"
                name="goal"
                required
                placeholder={t("User.schoolGoal") + " *"}
                value={formData.goal}
                onChange={handleChange}
                min="0"
                max="100"
              />
            </label>
            <p className="mt-1 text-gray-500 text-xs">
              {t("User.schoolGoalHelp")}
            </p>
          </div>

          {/* Deadline Year Field */}
          <div className="w-full">
            <label className="input validator w-full">
              <span className="text-gray-600">{t("User.deadlineYear")}</span>
              <input
                type="number"
                name="deadlineYear"
                required
                placeholder={t("User.deadlineYear") + " *"}
                value={formData.deadlineYear}
                onChange={handleChange}
                min={new Date().getFullYear()}
                max={new Date().getFullYear() + 50}
              />
            </label>
            <p className="mt-1 text-gray-500 text-xs">
              {t("User.deadlineYearHelp")}
            </p>
          </div>
        </>
      )}

      {error && <div className="text-red-500">{error}</div>}

      <button type="submit" className="btn btn-primary capitalize">
        {t("User.signup")}
      </button>

      {!onStayOnPage && (
        <button
          type="button"
          className="btn btn-link capitalize"
          onClick={() => {
            const loginModal = document.getElementById(
              "login",
            ) as HTMLDialogElement;
            const signupModal = document.getElementById(
              "signup",
            ) as HTMLDialogElement;
            if (signupModal) signupModal.close();
            if (loginModal) loginModal.showModal();
          }}
        >
          Already have an account? Login
        </button>
      )}
    </form>
  );
};

export default SignUpForm;
