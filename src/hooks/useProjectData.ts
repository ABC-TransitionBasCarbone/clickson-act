"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser } from "@/context/UserContext";
import { Action } from "@/types/Action";
import {
  buildSubcategoryKgLookupFromProjectEmissions,
  mergeSubcategoryKgLookups,
  type SubcategoryKgLookup,
} from "@/lib/subcategoryEmissionsKg";

interface ProjectData {
  id: string;
  name: string;
  schoolId?: string;
  startDate: string;
  subGoalDeadline?: string | number;
  subGoalReductionAmount?: number;
  status: "active" | "completed" | "pending";
  emissions?: number;
  reduction?: number;
  description?: string;
  teacherId?: string;
  teacherName?: string;
  passcode?: string;
  createdAt?: string;
  lastEmissionsUpdate?: string;
  // Legacy fields for backward compatibility
  school?: string;
  subGoal?: string;
  subGoalDate?: string;
  finalGoal?: string;
  goalReductionAmount?: number;
  // Fields with trailing spaces (database issue)
  "subGoalReductionAmount "?: number;
  "subGoalDeadline "?: string | number;
}

interface SchoolData {
  id: string;
  name: string;
  goal: number;
  deadlineYear: string;
  createdAt: string;
  /** Total school emissions in kgCO2e (from DB emissionCategories). */
  totalEmissions?: number;
  /** Teacher-entered kg CO₂e per subcategory (ids + categoryId-subcategoryId). */
  subcategoryEmissionsKg?: SubcategoryKgLookup;
}

interface ProjectEmissions {
  projectId: string;
  totalCalculatedEmissions: number;
  emissionsData: Array<{
    id: string;
    studentId?: string;
    studentName?: string;
    totalEmissions: number;
    dateCalculated: string;
    emissions: Array<{
      categoryId: string;
      categoryName: string;
      value: string;
      subcategories: Array<{
        id: string;
        name: string;
        value: string;
      }>;
    }>;
  }>;
  count: number;
}

interface ProjectActionRecord extends Action {
  calculatedReduction: number;
  status: "Available" | "Selected" | "In Progress" | "Completed";
  studentName: string;
  dateAdded: string;
  dateCompleted?: string;
  selected?: boolean;
}

interface ProjectActions {
  actions: ProjectActionRecord[];
  count: number;
}

export const useProjectData = (passcode?: string) => {
  const { user } = useUser();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [schoolData, setSchoolData] = useState<SchoolData | null>(null);
  const [projectEmissions, setProjectEmissions] =
    useState<ProjectEmissions | null>(null);
  const [projectActions, setProjectActions] = useState<ProjectActions | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use passcode from parameter or user context
  const effectivePasscode = passcode || user?.passcode;

  const fetchProjectData = useMemo(() => {
    return async () => {
      if (!effectivePasscode) {
        setError("No passcode available");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel to reduce total request time
        const [projectResponse, emissionsResponse, actionsResponse] =
          await Promise.all([
            fetch(`/api/project/${effectivePasscode}`),
            fetch(`/api/project/${effectivePasscode}/emissions`),
            fetch(`/api/project/${effectivePasscode}/actions`),
          ]);

        // Process project data
        if (!projectResponse.ok) {
          throw new Error("Failed to fetch project data");
        }
        const projectResult = await projectResponse.json();
        if (projectResult.success) {
          setProjectData(projectResult.project);
          setSchoolData(projectResult.school);
        } else {
          throw new Error(
            projectResult.error || "Failed to fetch project data",
          );
        }

        // Process emissions data
        if (emissionsResponse.ok) {
          const emissionsResult = await emissionsResponse.json();
          if (emissionsResult.success) {
            setProjectEmissions(emissionsResult);
          }
        }

        // Process actions data
        if (actionsResponse.ok) {
          const actionsResult = await actionsResponse.json();
          if (actionsResult.success) {
            setProjectActions(actionsResult);
          }
        }
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch project data",
        );
      } finally {
        setLoading(false);
      }
    };
  }, [effectivePasscode]);

  const refetchProjectData = useMemo(() => {
    return () => {
      fetchProjectData();
    };
  }, [fetchProjectData]);

  useEffect(() => {
    if (effectivePasscode) {
      fetchProjectData();
    } else {
      setProjectData(null);
      setSchoolData(null);
      setProjectEmissions(null);
      setProjectActions(null);
    }
  }, [effectivePasscode, fetchProjectData]);

  // Calculate current emissions from the most recent data
  const currentEmissions = useMemo(
    () =>
      projectEmissions?.totalCalculatedEmissions || projectData?.emissions || 0,
    [projectEmissions?.totalCalculatedEmissions, projectData?.emissions],
  );

  // Memoize available and completed actions to prevent infinite re-renders
  const availableActions = useMemo(
    () =>
      projectActions?.actions.filter(
        (action) =>
          action.status === "Available" || action.status === "Selected",
      ) || [],
    [projectActions?.actions],
  );

  const completedActions = useMemo(
    () =>
      projectActions?.actions.filter(
        (action) => action.status === "Completed",
      ) || [],
    [projectActions?.actions],
  );

  // School total emissions from DB (teacher-entered emission categories). Use for chart scale.
  const schoolTotalEmissions = schoolData?.totalEmissions;

  /** Merged lookup: school inventory overrides/supplements project calculator subcategory totals. */
  const subcategoryEmissionsKg = useMemo(
    () =>
      mergeSubcategoryKgLookups(
        buildSubcategoryKgLookupFromProjectEmissions(
          projectEmissions?.emissionsData,
        ),
        schoolData?.subcategoryEmissionsKg,
      ),
    [projectEmissions?.emissionsData, schoolData?.subcategoryEmissionsKg],
  );

  const totalReduction = useMemo(
    () =>
      [...completedActions, ...availableActions].reduce(
        (sum, action) => sum + action.calculatedReduction,
        0,
      ),
    [completedActions, availableActions],
  );

  return {
    projectData,
    schoolData,
    projectEmissions,
    projectActions,
    currentEmissions,
    schoolTotalEmissions,
    subcategoryEmissionsKg,
    totalReduction,
    availableActions,
    completedActions,
    loading,
    error,
    refetch: refetchProjectData,
  };
};
