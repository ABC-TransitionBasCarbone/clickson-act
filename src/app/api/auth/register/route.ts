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
      role = "teacher", // Default to teacher, can be overridden for admin
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

    // Check for duplicate email in teachers/admins collections BEFORE creating user
    const existingTeacherQuery = await adminDb
      .collection("teachers")
      .where("email", "==", sanitizedData.email)
      .limit(1)
      .get();

    if (!existingTeacherQuery.empty) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
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
    let needsApproval = false; // Track if teacher needs approval from referent

    // Handle school linking
    if (sanitizedData.school) {
      if (goal && deadlineYear) {
        // Creating a new school - check if school name already exists
        const existingSchoolByName = await adminDb
          .collection("schools")
          .where("name", "==", sanitizedData.school)
          .limit(1)
          .get();

        if (!existingSchoolByName.empty) {
          return NextResponse.json(
            { error: "A school with this name already exists. Please select it from the list or choose a different name." },
            { status: 409 },
          );
        }

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
            referentTeacherId: userRecord.uid, // First teacher is referent
          });

        console.log("New school entry created successfully");
        // First teacher doesn't need approval
        needsApproval = false;
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
          const schoolData = existingSchoolQuery.docs[0].data();
          console.log("Found existing school with ID:", schoolId);
          
          // If school already has a referent teacher, mark this teacher as pending
          if (schoolData.referentTeacherId) {
            console.log("School has referent teacher, marking new teacher as pending");
            needsApproval = true;
            
            // Add this teacher to the pending list
            const pendingTeacher = {
              teacherId: userRecord.uid,
              teacherName: sanitizedData.name,
              teacherEmail: sanitizedData.email,
              requestedAt: new Date().toISOString(),
            };
            
            const pendingTeachers = schoolData.pendingTeachers || [];
            pendingTeachers.push(pendingTeacher);
            
            await adminDb.collection("schools").doc(schoolId).update({
              pendingTeachers: pendingTeachers,
            });
          } else {
            // This is the first teacher for this school - set as referent
            console.log("Setting teacher as referent for school");
            await adminDb.collection("schools").doc(schoolId).update({
              referentTeacherId: userRecord.uid,
            });
            needsApproval = false;
          }
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
            referentTeacherId: userRecord.uid, // First teacher is referent
          });
          // First teacher doesn't need approval
          needsApproval = false;
        }
      }
    }

    // Store complete user info in Firestore
    const collectionName = role === "admin" ? "admins" : "teachers";
    const teacherData: Record<string, unknown> = {
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
      role: role,
    };
    
    // Only set approval flag for teachers (not admins)
    // If teacher needs approval (school has referent), set approved: false
    // Otherwise (first teacher, no school, or admin), teacher is auto-approved
    if (role === "teacher") {
      // If we determined teacher needs approval, set approved: false
      // Otherwise, set approved: true (or omit for backward compatibility)
      if (needsApproval) {
        teacherData.approved = false;
      } else {
        teacherData.approved = true; // Auto-approve first teacher or if no school
      }
    }
    
    await adminDb.collection(collectionName).doc(userRecord.uid).set(teacherData);
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
        role: role,
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
