import { NextResponse } from "next/server";
import { adminDb } from "../../../firebaseAdmin";

// Get all schools
export async function GET() {
  try {
    const schoolsSnapshot = await adminDb.collection("schools").get();

    const schools = schoolsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      schools: schools,
    });
  } catch (error: unknown) {
    console.error("Error fetching schools:", error);
    return NextResponse.json(
      { error: "Failed to fetch schools. Please try again." },
      { status: 500 },
    );
  }
}
