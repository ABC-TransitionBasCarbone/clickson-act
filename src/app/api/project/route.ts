import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../firebaseAdmin";
import { v4 as uuidv4 } from "uuid";

interface ProjectData {
  id: string;
  createdAt?: string;
  [key: string]: unknown;
}

// Generate a random 8-character passcode
function generatePasscode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a new project
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      startDate,
      finalGoal,
      goalReductionAmount,
      teacherId,
      teacherName,
    } = body;

    // Enhanced validation
    if (
      !name ||
      !startDate ||
      !finalGoal ||
      !goalReductionAmount ||
      !teacherId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get teacher's school information
    const teacherDoc = await adminDb
      .collection("teachers")
      .where("name", "==", teacherId)
      .limit(1)
      .get();

    if (teacherDoc.empty) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const teacherData = teacherDoc.docs[0].data();
    const schoolId = teacherData.schoolId;
    let schoolName = "Unknown School";

    // Get school information if teacher has a schoolId
    if (schoolId) {
      const schoolDoc = await adminDb.collection("schools").doc(schoolId).get();
      if (schoolDoc.exists) {
        const schoolData = schoolDoc.data();
        schoolName = schoolData?.name || "Unknown School";
      }
    }

    // Sanitize and validate inputs
    const sanitizedName = name.trim();
    const sanitizedTeacherName = teacherName?.trim() || "";

    if (sanitizedName.length < 1 || sanitizedName.length > 200) {
      return NextResponse.json(
        { error: "Project name must be between 1 and 200 characters" },
        { status: 400 },
      );
    }

    const goalAmount = parseFloat(goalReductionAmount) || 0;
    if (goalAmount < 0 || goalAmount > 100) {
      return NextResponse.json(
        { error: "Goal reduction amount must be between 0 and 100" },
        { status: 400 },
      );
    }

    // Generate UUID for project ID
    const projectId = uuidv4();

    // Generate unique passcode
    let passcode = generatePasscode();
    let isUnique = false;
    let attempts = 0;

    // Ensure passcode is unique by querying passcode field (max 10 attempts)
    while (!isUnique && attempts < 10) {
      const existingProjectQuery = await adminDb
        .collection("projects")
        .where("passcode", "==", passcode)
        .limit(1)
        .get();
      if (existingProjectQuery.empty) {
        isUnique = true;
      } else {
        passcode = generatePasscode();
        attempts++;
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: "Unable to generate unique passcode" },
        { status: 500 },
      );
    }

    // Create project document with UUID as ID
    const projectData = {
      id: projectId,
      name: sanitizedName,
      schoolId: schoolId,
      schoolName: schoolName,
      startDate,
      subGoalDeadline: finalGoal, // Using finalGoal as the sub-goal deadline
      subGoalReductionAmount: goalAmount,
      teacherId: teacherId || "",
      teacherName: sanitizedTeacherName,
      status: "active",
      createdAt: new Date().toISOString(),
      passcode,
    };

    await adminDb.collection("projects").doc(projectId).set(projectData);

    return NextResponse.json({
      success: true,
      project: projectData,
    });
  } catch (error: unknown) {
    console.error("Project creation error:", error);
    // Don't expose internal error details to client
    return NextResponse.json(
      { error: "Failed to create project. Please try again." },
      { status: 500 },
    );
  }
}

// Get projects for a teacher
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json(
        { error: "Teacher ID is required" },
        { status: 400 },
      );
    }

    // Get all projects for this teacher (removed orderBy to avoid index requirement)
    const projectsSnapshot = await adminDb
      .collection("projects")
      .where("teacherId", "==", teacherId)
      .get();

    const projects: ProjectData[] = projectsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by createdAt on the client side instead
    projects.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // Newest first
    });

    return NextResponse.json({ projects });
  } catch (error: unknown) {
    console.error("Project fetch error:", error);
    // Don't expose internal error details to client
    return NextResponse.json(
      { error: "Failed to fetch projects. Please try again." },
      { status: 500 },
    );
  }
}
