import Firestore from "@google-cloud/firestore";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let firestore;

async function initializeFirestore() {
  let serviceAccount;

  if (process.env.NODE_ENV === "production") {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    const serviceAccountPath = resolve(
      __dirname,
      "../config/serviceAccount.json"
    );
    try {
      const data = await fs.readFile(serviceAccountPath, "utf-8");
      serviceAccount = JSON.parse(data);
    } catch (error) {
      console.error("Error reading service account file:", error);
      throw error;
    }
  }

  firestore = new Firestore({
    projectId: serviceAccount.project_id,
    credentials: serviceAccount,
  });
}

initializeFirestore().catch((error) => {
  console.error("Error initializing Firestore:", error);
  // Handle initialization failure (e.g., exit process, retry, etc.)
});

export default async function saveFormSubmission(submissionData) {
  if (!firestore) {
    throw new Error("Firestore is not initialized");
  }
  try {
    const docRef = firestore.collection("submissions").doc();
    await docRef.set({
      ...submissionData,
      timestamp: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving form submission: ", error);
    throw error;
  }
}
