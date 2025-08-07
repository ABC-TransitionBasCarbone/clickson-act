import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../firebaseAdmin";

// Interface for project emissions data
interface ProjectEmissions {
  projectId: string;
  studentId?: string;
  studentName?: string;
  emissions: {
    categoryId: string;
    categoryName: string;
    value: string;
    subcategories: {
      id: string;
      name: string;
      value: string;
    }[];
  }[];
  totalEmissions?: number;
  dateCalculated: string;
  dateUpdated: string;
}

// Save or update project emissions
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;
    const body = await req.json();
    const { emissions, studentId, studentName, totalEmissions } = body;

    // Validate input
    if (!projectId || !emissions || !Array.isArray(emissions)) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, emissions" },
        { status: 400 },
      );
    }

    // Verify project exists
    const projectDoc = await adminDb
      .collection("projects")
      .doc(projectId)
      .get();
    if (!projectDoc.exists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const currentDate = new Date().toISOString();

    // Create emissions document
    const emissionsData: ProjectEmissions = {
      projectId,
      studentId: studentId || undefined,
      studentName: studentName || "Anonymous",
      emissions: emissions.map((emission: Record<string, unknown>) => ({
        categoryId: String(emission.categoryId || emission.id || ""),
        categoryName: String(emission.categoryName || emission.name || ""),
        value: String(emission.value || "0"),
        subcategories: Array.isArray(emission.subcategories)
          ? emission.subcategories.map((sub: Record<string, unknown>) => ({
              id: String(sub.id || ""),
              name: String(sub.name || ""),
              value: String(sub.value || "0"),
            }))
          : [],
      })),
      totalEmissions: totalEmissions || 0,
      dateCalculated: currentDate,
      dateUpdated: currentDate,
    };

    // Store emissions in project's emissions subcollection
    // Use studentId as document ID if provided, otherwise generate one
    const emissionsDocId = studentId || `emissions-${Date.now()}`;

    await adminDb
      .collection("projects")
      .doc(projectId)
      .collection("emissions")
      .doc(emissionsDocId)
      .set(emissionsData);

    // Also update the project document with aggregated emissions if needed
    const updatedEmissions = totalEmissions || 0;

    await adminDb.collection("projects").doc(projectId).update({
      emissions: updatedEmissions,
      lastEmissionsUpdate: currentDate,
    });

    return NextResponse.json({
      success: true,
      message: "Emissions data saved successfully",
      emissionsId: emissionsDocId,
      totalEmissions: updatedEmissions,
    });
  } catch (error) {
    console.error("Error saving project emissions:", error);
    return NextResponse.json(
      { error: "Failed to save emissions data" },
      { status: 500 },
    );
  }
}

// Get project emissions
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 },
      );
    }

    // Verify project exists
    const projectDoc = await adminDb
      .collection("projects")
      .doc(projectId)
      .get();
    if (!projectDoc.exists) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectData = projectDoc.data();

    // Get emissions data from project's emissions subcollection
    let emissionsQuery = adminDb
      .collection("projects")
      .doc(projectId)
      .collection("emissions");

    // If studentId is provided, filter by student
    if (studentId) {
      emissionsQuery = emissionsQuery.where(
        "studentId",
        "==",
        studentId,
      ) as ReturnType<typeof adminDb.collection>;
    }

    const emissionsSnapshot = await emissionsQuery
      .orderBy("dateCalculated", "desc")
      .get();

    const emissionsData = emissionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate total emissions from all students if no specific student requested
    let totalProjectEmissions = 0;
    if (!studentId && emissionsData.length > 0) {
      // Get the latest emissions from each student
      const studentEmissions = new Map();
      emissionsData.forEach((emission: Record<string, unknown>) => {
        const key = emission.studentId || emission.id;
        if (
          !studentEmissions.has(key) ||
          new Date(String(emission.dateCalculated)) >
            new Date(String(studentEmissions.get(key).dateCalculated))
        ) {
          studentEmissions.set(key, emission);
        }
      });

      totalProjectEmissions = Array.from(studentEmissions.values()).reduce(
        (sum: number, emission: Record<string, unknown>) =>
          sum + (Number(emission.totalEmissions) || 0),
        0,
      );
    }

    return NextResponse.json({
      success: true,
      projectId,
      projectName: projectData?.name,
      projectEmissions: projectData?.emissions || 0,
      totalCalculatedEmissions: totalProjectEmissions,
      emissionsData: emissionsData,
      count: emissionsData.length,
    });
  } catch (error) {
    console.error("Error fetching project emissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch emissions data" },
      { status: 500 },
    );
  }
}
