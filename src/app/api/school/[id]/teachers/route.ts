import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../firebaseAdmin";

// Get all teachers for a school
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get all teachers for this school
    const teachersQuery = await adminDb
      .collection("teachers")
      .where("schoolId", "==", id)
      .get();

    const teachers = teachersQuery.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      teachers,
    });
  } catch (error: unknown) {
    console.error("Error fetching school teachers:", error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 },
    );
  }
}

