import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../firebaseAdmin";

// Get project details by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    // Get project document
    const projectDoc = await adminDb.collection("projects").doc(id).get();

    if (!projectDoc.exists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectData = {
      id: projectDoc.id,
      ...projectDoc.data(),
    } as { id: string; school?: string; [key: string]: unknown };

    // Get complete school information
    let schoolData = null;
    let schoolGoalData = null;

    if (projectData.school) {
      // Find school by name to get complete school data
      const schoolQuery = await adminDb
        .collection("schools")
        .where("name", "==", projectData.school)
        .limit(1)
        .get();

      if (!schoolQuery.empty) {
        const schoolDoc = schoolQuery.docs[0];
        const schoolDocData = schoolDoc.data();

        // Complete school object
        schoolData = {
          id: schoolDoc.id,
          name: schoolDocData.name,
          goal: schoolDocData.goal,
          deadlineYear: schoolDocData.deadlineYear,
          createdAt: schoolDocData.createdAt,
        };

        // Backwards compatibility for existing code
        schoolGoalData = {
          goal: schoolDocData.goal,
          deadlineYear: schoolDocData.deadlineYear,
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
