import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "../../../../firebaseAdmin";
import { v4 as uuidv4 } from "uuid";
import { withRateLimit } from "../../../../lib/auth-middleware";

async function registerHandler(req: NextRequest) {
  try {
    console.log("Register endpoint called");

    if (!adminAuth || !adminDb) {
      console.error("Firebase Admin SDK not initialized");
      return NextResponse.json(
        {
          error:
            "Firebase Admin SDK not initialized. Check your service account credentials.",
        },
        { status: 500 },
      );
    }

    const body = await req.json();
    console.log("Request body received:", { ...body, password: "[REDACTED]" });

    const {
      email,
      password,
      name,
      firstName,
      lastName,
      country,
      city,
      postalCode,
      school,
      goal,
      deadlineYear,
    } = body;

    // Enhanced input validation
    if (!email || !password || !name) {
      console.error("Missing required fields:", {
        email: !!email,
        password: !!password,
        name: !!name,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      email: email.trim().toLowerCase(),
      name: name.trim(),
      firstName: firstName?.trim() || "",
      lastName: lastName?.trim() || "",
      country: country?.trim() || "",
      city: city?.trim() || "",
      postalCode: postalCode?.trim() || "",
      school: school?.trim() || "",
    };

    // Length validations
    if (sanitizedData.name.length > 100) {
      return NextResponse.json({ error: "Name too long" }, { status: 400 });
    }

    console.log("Creating user in Firebase Auth...");
    // Create user in Firebase Auth (Admin SDK)
    const userRecord = await adminAuth.createUser({
      email: sanitizedData.email,
      password,
      displayName: sanitizedData.name,
    });
    console.log("User created successfully:", userRecord.uid);

    console.log("Storing user data in Firestore...");
    let schoolId = null;

    // Handle school linking
    if (sanitizedData.school) {
      if (goal && deadlineYear) {
        // Creating a new school
        console.log("Creating new school entry:", sanitizedData.school);
        schoolId = uuidv4();

        await adminDb
          .collection("schools")
          .doc(schoolId)
          .set({
            id: schoolId,
            name: sanitizedData.school,
            goal: Number(goal),
            deadlineYear: String(deadlineYear),
            createdAt: new Date().toISOString(),
          });

        console.log("New school entry created successfully");
      } else {
        // Linking to existing school
        console.log("Looking for existing school:", sanitizedData.school);

        const existingSchoolQuery = await adminDb
          .collection("schools")
          .where("name", "==", sanitizedData.school)
          .limit(1)
          .get();

        if (!existingSchoolQuery.empty) {
          schoolId = existingSchoolQuery.docs[0].id;
          console.log("Found existing school with ID:", schoolId);
        } else {
          console.log("School not found, creating with defaults");
          // Create school with default values if it doesn't exist
          schoolId = uuidv4();
          await adminDb.collection("schools").doc(schoolId).set({
            id: schoolId,
            name: sanitizedData.school,
            goal: 40, // Default goal
            deadlineYear: "2030", // Default deadline
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    // Store complete teacher info in Firestore
    await adminDb.collection("teachers").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: sanitizedData.email,
      name: sanitizedData.name,
      firstName: sanitizedData.firstName,
      lastName: sanitizedData.lastName,
      country: sanitizedData.country,
      city: sanitizedData.city,
      postalCode: sanitizedData.postalCode,
      school: sanitizedData.school,
      schoolId: schoolId, // Link to school document
      createdAt: new Date().toISOString(),
      role: "teacher",
    });
    console.log("User data stored successfully");

    // Create a custom token for the authenticated user
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    return NextResponse.json({
      success: true,
      token: customToken,
      user: {
        uid: userRecord.uid,
        email: sanitizedData.email,
        username: sanitizedData.name,
        name: sanitizedData.name,
        role: "teacher",
      },
    });
  } catch (error: unknown) {
    console.error("Registration error:", error);

    // Log detailed error information server-side only
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      // Handle specific Firebase errors with safe messages
      if (error.message.includes("email-already-in-use")) {
        return NextResponse.json(
          { error: "Email already registered" },
          { status: 409 },
        );
      }
      if (error.message.includes("weak-password")) {
        return NextResponse.json(
          { error: "Password is too weak" },
          { status: 400 },
        );
      }
    }

    // Don't expose internal error details to client
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}

// Export with rate limiting (3 attempts per minute)
export const POST = withRateLimit(registerHandler, 3, 60000);
