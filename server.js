/* eslint-disable no-undef */
import express from "express";
import Firestore from "@google-cloud/firestore";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
// import rateLimit from "express-rate-limit";
// import csrf from "csurf";

dotenv.config();

const app = express();
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(limiter);
// app.use("/csrf-endpoint", csrfProtection);

// const csrfProtection = csrf({ cookie: true });

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: "Too many requests from this IP, please try again after 15 minutes",
// });

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.error(
    "The FIREBASE_SERVICE_ACCOUNT environment variable is not set."
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const firestore = new Firestore({
  projectId: serviceAccount.project_id,
  credentials: serviceAccount, // use the parsed service account object
});

app.get("/", (req, res) => {
  res.send("Backend server is running.");
});

function validateFormInput(name, email) {
  const isNameValid = name && /^[A-Za-z\s]+$/.test(name);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email);

  return isNameValid && isEmailValid;
}

// function sanitizeString(str) {
//   return str.replace(
//     /[&<>"'/]/g,
//     (match) =>
//       ({
//         "&": "&amp;",
//         "<": "&lt;",
//         ">": "&gt;",
//         '"': "&quot;",
//         "'": "&#39;",
//         "/": "&#x2F;",
//       }[match])
//   );
// }

// function removeHtmlTags(str) {
//   if (str === null || str === "") return "";
//   return str.replace(/<[^>]*>/g, "");
// }

// app.get("/get-csrf-token", (req, res) => {
//   res.setHeader("Content-Type", "application/json");
//   res.json({ csrfToken: req.csrfToken() });

//   console.log(req, res);
// });

app.options("/submitForm", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST");
  res.header("Access-Control-Allow-Headers", "Content-Type");

  res.status(200).send();
});

app.post("/submitForm", async (req, res) => {
  const { name, email, message } = req.body;

  // name = sanitizeString(removeHtmlTags(name));
  // email = sanitizeString(removeHtmlTags(email));
  // message = sanitizeString(removeHtmlTags(message));

  console.log(req.body);
  if (!validateFormInput(name, email)) {
    return res
      .status(400)
      .send({ status: "failed", error: "Invalid input values." });
  }
  try {
    const docRef = firestore.collection("submissions").doc();

    await docRef.set({
      name,
      email,
      message,
      timestamp: new Date(),
    });

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.APP_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });

    let mailOptions = {
      from: process.env.APP_USER,
      to: process.env.APP_USER,
      subject: "New Form Submission",
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Email sent: ${info.response}`);
      }
    });

    setTimeout(() => {
      let mailOptionsUser = {
        from: process.env.APP_USER,
        to: email,
        subject: "Thank you for your interest!",
        text: "We have received your form submission. Thanks.",
      };
      transporter.sendMail(mailOptionsUser);
    }, 6000);

    res.status(200).send({ status: "success" });
  } catch (error) {
    res.status(500).send({ status: "failed", error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
