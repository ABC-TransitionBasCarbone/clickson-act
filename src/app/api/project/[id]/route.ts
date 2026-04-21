import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../firebaseAdmin";
import { resolveProjectId } from "../../../../lib/project-utils";
import { buildSubcategoryKgLookupFromSchoolCategories } from "@/lib/subcategoryEmissionsKg";
import type { SchoolEmissionCategory } from "@/types/School";

/** Sum category amounts from school emissionCategories to get total school emissions (kgCO2e). */
function schoolTotalEmissionsFromCategories(
  emissionCategories: Array<{ amount?: number; value?: number }> | undefined,
): number {
  if (!emissionCategories || !Array.isArray(emissionCategories)) return 0;
  return emissionCategories.reduce(
    (sum, cat) =>
      sum +
      (typeof cat.amount === "number"
        ? cat.amount
        : typeof (cat as { value?: number }).value === "number"
          ? (cat as { value: number }).value
          : 0),
    0,
  );
}

// Get project details by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    // Resolve project ID from UUID or passcode
    const resolvedProjectId = await resolveProjectId(id);
    if (!resolvedProjectId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get project document
    const projectDoc = await adminDb
      .collection("projects")
      .doc(resolvedProjectId)
      .get();

    if (!projectDoc.exists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectData = {
      id: projectDoc.id,
      ...projectDoc.data(),
    } as {
      id: string;
      school?: string;
      schoolId?: string;
      [key: string]: unknown;
    };

    // Get complete school information
    let schoolData = null;
    let schoolGoalData = null;

    if (projectData.schoolId) {
      // Get school by ID
      const schoolDoc = await adminDb
        .collection("schools")
        .doc(projectData.schoolId)
        .get();

      if (schoolDoc.exists) {
        const schoolDocData = schoolDoc.data();
        const emissionCategories = schoolDocData?.emissionCategories as
          | SchoolEmissionCategory[]
          | undefined;

        schoolData = {
          id: schoolDoc.id,
          name: schoolDocData?.name || "Unknown School",
          goal: schoolDocData?.goal || 40,
          deadlineYear: schoolDocData?.deadlineYear || "2030",
          createdAt: schoolDocData?.createdAt || new Date().toISOString(),
          totalEmissions:
            schoolTotalEmissionsFromCategories(emissionCategories),
          subcategoryEmissionsKg:
            buildSubcategoryKgLookupFromSchoolCategories(emissionCategories),
        };

        // Backwards compatibility for existing code
        schoolGoalData = {
          goal: schoolDocData?.goal || 40,
          deadlineYear: schoolDocData?.deadlineYear || "2030",
        };
      } else if (projectData.school) {
        // Fallback: Find school by name for backward compatibility
        const schoolQuery = await adminDb
          .collection("schools")
          .where("name", "==", projectData.school)
          .limit(1)
          .get();

        if (!schoolQuery.empty) {
          const schoolQueryDoc = schoolQuery.docs[0];
          const schoolQueryData = schoolQueryDoc.data();
          const emissionCategories = schoolQueryData?.emissionCategories as
            | SchoolEmissionCategory[]
            | undefined;

          schoolData = {
            id: schoolQueryDoc.id,
            name: schoolQueryData.name,
            goal: schoolQueryData.goal,
            deadlineYear: schoolQueryData.deadlineYear,
            createdAt: schoolQueryData.createdAt,
            totalEmissions:
              schoolTotalEmissionsFromCategories(emissionCategories),
            subcategoryEmissionsKg:
              buildSubcategoryKgLookupFromSchoolCategories(emissionCategories),
          };

          schoolGoalData = {
            goal: schoolQueryData.goal,
            deadlineYear: schoolQueryData.deadlineYear,
          };
        } else {
          // Alternative approach: Try to get school data from the teacher who created the project
          if (projectData.teacherId) {
            const teacherQuery = await adminDb
              .collection("teachers")
              .where("name", "==", projectData.teacherId)
              .limit(1)
              .get();

            if (!teacherQuery.empty) {
              const teacherData = teacherQuery.docs[0].data();

              // If teacher has a schoolId, get the school from that
              if (teacherData.schoolId) {
                const schoolDoc = await adminDb
                  .collection("schools")
                  .doc(teacherData.schoolId)
                  .get();

                if (schoolDoc.exists) {
                  const schoolDocData = schoolDoc.data();
                  const emissionCategories =
                    schoolDocData?.emissionCategories as
                      | SchoolEmissionCategory[]
                      | undefined;

                  schoolData = {
                    id: schoolDoc.id,
                    name:
                      schoolDocData?.name ||
                      teacherData.school ||
                      projectData.school,
                    goal: schoolDocData?.goal || 50,
                    deadlineYear: schoolDocData?.deadlineYear || "2030",
                    createdAt:
                      schoolDocData?.createdAt || new Date().toISOString(),
                    totalEmissions:
                      schoolTotalEmissionsFromCategories(emissionCategories),
                    subcategoryEmissionsKg:
                      buildSubcategoryKgLookupFromSchoolCategories(
                        emissionCategories,
                      ),
                  };

                  schoolGoalData = {
                    goal: schoolDocData?.goal || 50,
                    deadlineYear: schoolDocData?.deadlineYear || "2030",
                  };
                }
              } else if (teacherData.school) {
                // Create a fallback school object from teacher's school name
                schoolData = {
                  id: `fallback-${Date.now()}`,
                  name: teacherData.school,
                  goal: 50, // Default goal
                  deadlineYear: "2030", // Default deadline
                  createdAt: new Date().toISOString(),
                };

                schoolGoalData = {
                  goal: 50,
                  deadlineYear: "2030",
                };
              }
            }
          }
        }
      }
    }

    // Ensure we always return school data - create from project data if needed
    if (!schoolData && projectData.school) {
      schoolData = {
        id: `project-school-${projectData.id}`,
        name: projectData.school,
        goal:
          Number(projectData.finalGoal) ||
          Number(projectData.goalReductionAmount) ||
          50,
        deadlineYear:
          projectData.finalGoalDate &&
          typeof projectData.finalGoalDate === "string"
            ? new Date(projectData.finalGoalDate).getFullYear().toString()
            : "2030",
        createdAt: projectData.createdAt || new Date().toISOString(),
      };

      schoolGoalData = {
        goal: schoolData.goal,
        deadlineYear: schoolData.deadlineYear,
      };
    }

    return NextResponse.json({
      success: true,
      project: projectData,
      school: schoolData,
      schoolGoal: schoolGoalData,
    });
  } catch (error: unknown) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      { error: "Failed to fetch project. Please try again." },
      { status: 500 },
    );
  }
}
