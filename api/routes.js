import express from "express";
import sendMail from "./utils/sendMail.js";
import verifyRecaptcha from "./utils/verifyCaptcha.js";
// import processRateLimiter from "./middleware/rateLimit.js";
import sanitizeInput from "./utils/sanitizeInput.js";
import validateInput from "./utils/validate.js";
import saveFormSubmission from "./utils/firestore.js";

const router = express.Router();

router.get("/csrf", (req, res) => {
  res.send({ csrfToken: req.csrfToken() });
});

router.post("/process", async (req, res) => {
  let { name, email, message, recaptchaToken } = req.body;

  const nameError = validateInput.name(name);
  const emailError = validateInput.email(email);

  if (nameError || emailError) {
    return res.status(400).send({
      status: "failed",
      errors: { nameError, emailError },
    });
  }

  try {
    name = sanitizeInput.text(name);
    email = sanitizeInput.text(email);
    message = sanitizeInput.message(message);

    const recaptchaResult = await verifyRecaptcha(recaptchaToken);

    if (!recaptchaResult.success || recaptchaResult.score < 0.5) {
      console.log(recaptchaResult);
      return res
        .status(400)
        .send({ status: "failed", error: "reCAPTCHA verification failed" });
    }

    await saveFormSubmission({ name, email, message });

    const mailResult = await sendMail({ name, email, message });

    if (mailResult.success) {
      res.status(200).send({ status: "success" });
    } else {
      res.status(500).send({ status: "failed", error: result.error });
    }
  } catch (error) {
    res.status(500).send({ status: "failed", error: error.message });
  }
});

export default router;
