import { adminDb } from "../firebaseAdmin";

/**
 * Resolve project ID from UUID or passcode
 * @param identifier - Either a UUID (project ID) or passcode
 * @returns The resolved project ID (UUID) or null if not found
 */
export async function resolveProjectId(
  identifier: string,
): Promise<string | null> {
  // Check if identifier is a UUID (36 chars) or passcode (8 chars)
  const isUUID = identifier.length === 36 && identifier.includes("-");

  if (isUUID) {
    // Use as document ID (project ID)
    const projectDoc = await adminDb.collection("projects").doc(identifier).get();
    return projectDoc.exists ? identifier : null;
  } else {
    // Query by passcode field
    const projectQuery = await adminDb
      .collection("projects")
      .where("passcode", "==", identifier)
      .limit(1)
      .get();

    return projectQuery.empty ? null : projectQuery.docs[0].id;
  }
}

