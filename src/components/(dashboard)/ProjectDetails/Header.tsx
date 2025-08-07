"use client";

import { ArrowLeft, School } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import Project from "@/types/ProjectType";

interface School {
  id: string;
  name: string;
  goal: number;
  deadlineYear: string;
}

const Header = ({ project }: { project: Project }) => {
  const router = useRouter();
  const t = useTranslations("ProjectDetails");
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchool = async () => {
      if (!project.schoolId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/school/${project.schoolId}`);
        if (response.ok) {
          const schoolData = await response.json();
          setSchool(schoolData);
        } else {
          console.error("Failed to fetch school data");
        }
      } catch (error) {
        console.error("Error fetching school:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchool();
  }, [project.schoolId]);

  return (
    <div className="mb-6 flex items-center">
      <button
        className="btn btn-ghost btn-sm mr-4"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("back")}
      </button>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        <p className="text-muted-foreground mt-1 flex items-center">
          <School className="mr-2 h-4 w-4" />
          {loading ? "Loading..." : school?.name || "Unknown School"}
        </p>
      </div>
    </div>
  );
};

export default Header;
