import Firestore from "@google-cloud/firestore";
import serviceAccount from "../config/serviceAccount.json" assert { type: "json" };

const firestore = new Firestore({
  projectId: serviceAccount.project_id,
  credentials: serviceAccount,
});

async function saveFormSubmission(submissionData) {
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

export default saveFormSubmission;
