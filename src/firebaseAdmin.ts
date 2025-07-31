import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { ServiceAccount } from "firebase-admin";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Load service account from environment variables (preferred) or JSON file (fallback)
function loadServiceAccount(): ServiceAccount {
  try {
    // First, try to load from environment variables (more secure)
    if (
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PROJECT_ID
    ) {
      console.log("Loading service account from environment variables");

      let privateKey = process.env.FIREBASE_PRIVATE_KEY;

      // Handle different private key formats
      if (privateKey.includes("\\n")) {
        // Replace escaped newlines with actual newlines
        privateKey = privateKey.replace(/\\n/g, "\n");
      }

      // Ensure the private key has proper PEM format
      if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
        // If it's just the key content without headers, add them
        privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey.trim()}\n-----END PRIVATE KEY-----`;
      } else {
        // Clean up existing formatting
        privateKey = privateKey.trim();

        // Ensure proper line breaks after headers
        privateKey = privateKey.replace(
          "-----BEGIN PRIVATE KEY-----",
          "-----BEGIN PRIVATE KEY-----\n",
        );
        privateKey = privateKey.replace(
          "-----END PRIVATE KEY-----",
          "\n-----END PRIVATE KEY-----",
        );

        // Remove any duplicate newlines
        privateKey = privateKey.replace(/\n\n+/g, "\n");
      }

      const serviceAccount: ServiceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID!,
        privateKey: privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      };

      console.log("Service account loaded from environment variables");
      console.log("Project ID:", serviceAccount.projectId);
      console.log("Client email:", serviceAccount.clientEmail);
      console.log(
        "Private key format check:",
        privateKey.substring(0, 30) + "...",
      );

      return serviceAccount;
    }

    // Fallback to JSON file (deprecated - only for development)
    console.log("Environment variables not found, falling back to JSON file");
    const serviceAccountPath = join(process.cwd(), "serviceAccountKey.json");

    console.log("Looking for service account file at:", serviceAccountPath);

    // Check if file exists
    if (!existsSync(serviceAccountPath)) {
      throw new Error(
        `Service account credentials not found. Please set FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and FIREBASE_PROJECT_ID environment variables, or create 'serviceAccountKey.json' file.`,
      );
    }

    const serviceAccountData = readFileSync(serviceAccountPath, "utf8");
    const serviceAccount = JSON.parse(serviceAccountData);

    // Validate required fields
    const requiredFields = ["project_id", "private_key", "client_email"];
    for (const field of requiredFields) {
      if (!serviceAccount[field]) {
        throw new Error(`Missing required field in service account: ${field}`);
      }
    }

    // Process the private key if needed
    if (serviceAccount.private_key) {
      // Handle escaped newlines
      if (serviceAccount.private_key.includes("\\n")) {
        serviceAccount.private_key = serviceAccount.private_key.replace(
          /\\n/g,
          "\n",
        );
      }

      // Ensure proper PEM format
      if (!serviceAccount.private_key.includes("-----BEGIN PRIVATE KEY-----")) {
        serviceAccount.private_key = `-----BEGIN PRIVATE KEY-----\n${serviceAccount.private_key}\n-----END PRIVATE KEY-----`;
      }
    }

    console.log("Service account loaded from JSON file (deprecated)");
    console.log("Project ID:", serviceAccount.project_id);
    console.log("Client email:", serviceAccount.client_email);

    return serviceAccount;
  } catch (error) {
    console.error("Error loading service account:", error);

    if (error instanceof Error) {
      if (error.message.includes("ENOENT")) {
        throw new Error(
          "Service account credentials not found. Please set FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, and FIREBASE_PROJECT_ID environment variables.",
        );
      } else if (error.message.includes("Unexpected token")) {
        throw new Error(
          "Invalid JSON in service account file. Please check your credentials.",
        );
      }
    }

    throw new Error(
      "Failed to load Firebase service account. Please check your environment variables or service account file.",
    );
  }
}

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin(): App {
  try {
    const serviceAccount = loadServiceAccount();

    // Check if app is already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      console.log("Using existing Firebase Admin app");
      return existingApps[0];
    }

    console.log("Initializing new Firebase Admin app");
    const app = initializeApp({
      credential: cert(serviceAccount),
    });

    console.log("Firebase Admin SDK initialized successfully");
    return app;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    throw error;
  }
}

const app = initializeFirebaseAdmin();
const adminAuth = getAuth(app);
const adminDb = getFirestore(app);

export { app, adminAuth, adminDb };
