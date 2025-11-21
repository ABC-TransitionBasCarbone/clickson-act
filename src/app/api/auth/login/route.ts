import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../firebaseAdmin";
import { withRateLimit } from "../../../../lib/auth-middleware";

async function loginHandler(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    try {
      // Verify credentials using Firebase REST API for proper password authentication
      const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

      if (!firebaseApiKey) {
        console.error("Firebase API key not configured");
        return NextResponse.json(
          { error: "Authentication service not properly configured" },
          { status: 500 },
        );
      }

      // Use Firebase REST API to verify email/password
      const authResponse = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password: password,
            returnSecureToken: true,
          }),
        },
      );

      const authData = await authResponse.json();

      if (!authResponse.ok) {
        // Handle specific Firebase Auth errors
        if (authData.error?.message) {
          if (authData.error.message.includes("EMAIL_NOT_FOUND")) {
            return NextResponse.json(
              {
                error:
                  "No account found with this email address. If you are a student, please use the student login with your passcode.",
                isStudent: true,
              },
              { status: 401 },
            );
          } else if (authData.error.message.includes("INVALID_PASSWORD")) {
            return NextResponse.json(
              { error: "Invalid email or password" },
              { status: 401 },
            );
          } else if (authData.error.message.includes("USER_DISABLED")) {
            return NextResponse.json(
              { error: "This account has been disabled" },
              { status: 401 },
            );
          } else if (
            authData.error.message.includes("TOO_MANY_ATTEMPTS_TRY_LATER")
          ) {
            return NextResponse.json(
              { error: "Too many failed attempts. Please try again later." },
              { status: 429 },
            );
          }
        }

        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 },
        );
      }

      const uid = authData.localId;
      const idToken = authData.idToken; // Use the ID token from Firebase response
      const refreshToken = authData.refreshToken; // Get the refresh token
      const expiresIn = authData.expiresIn || 3600; // Default to 1 hour

      if (!uid || !idToken) {
        return NextResponse.json(
          { error: "Authentication failed" },
          { status: 401 },
        );
      }

      // Get user data from Firestore (check both teachers and admins collections)
      let userData = null;

      // First check teachers collection
      const teacherDoc = await adminDb.collection("teachers").doc(uid).get();
      if (teacherDoc.exists) {
        userData = teacherDoc.data();
        
        // Check if teacher is approved (if approval system is in place)
        // Teachers without an approved field are considered approved (backward compatibility)
        // Teachers with approved: false need approval from referent teacher
        if (userData?.approved === false) {
          return NextResponse.json(
            {
              error:
                "Your account is pending approval from the referent teacher. Please wait for approval before accessing the platform.",
              requiresApproval: true,
            },
            { status: 403 },
          );
        }
      } else {
        // Check admins collection
        const adminDoc = await adminDb.collection("admins").doc(uid).get();
        if (adminDoc.exists) {
          userData = adminDoc.data();
        } else {
          return NextResponse.json(
            {
              error:
                "Account not found. If you are a student, please use the student login with your passcode instead.",
              isStudent: true,
            },
            { status: 404 },
          );
        }
      }

      return NextResponse.json({
        success: true,
        token: idToken, // Use the ID token instead of creating a custom token
        refreshToken: refreshToken, // Include refresh token
        expiresIn: expiresIn, // Include expiry time
        user: {
          uid: uid,
          email: authData.email,
          username:
            userData?.name || `${userData?.firstName} ${userData?.lastName}`,
          name:
            userData?.name || `${userData?.firstName} ${userData?.lastName}`,
          role: userData?.role || "teacher",
          schoolId: userData?.schoolId || undefined,
        },
        message: "Login successful",
      });
    } catch (authError: unknown) {
      console.error("Authentication error:", authError);

      // Handle specific Firebase Auth errors
      if (
        authError instanceof Error &&
        "code" in authError &&
        authError.code === "auth/user-not-found"
      ) {
        return NextResponse.json(
          {
            error:
              "No account found with this email address. If you are a student, please use the student login with your passcode.",
            isStudent: true,
          },
          { status: 401 },
        );
      }

      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }
  } catch (error: unknown) {
    console.error("Login error:", error);
    // Don't expose internal error details to client
    return NextResponse.json(
      {
        error:
          "Authentication failed. Please check your credentials and try again.",
      },
      { status: 500 },
    );
  }
}

// Export with rate limiting (5 attempts per minute)
export const POST = withRateLimit(loginHandler, 5, 60000);
