import nodemailer from "nodemailer";

// Function to create and configure the transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "smtp.elasticemail.com",
    port: 2525,
    auth: {
      user: "ildidvorani@gmail.com",
      pass: process.env.ELASTIC_PASS,
    },

    tls: {
      rejectUnauthorized: false,
    },
  });
};

const sendMail = async ({ name, email, message }) => {
  const transporter = createTransporter();

  const mailOptionsSelf = {
    from: process.env.APP_USER,
    to: process.env.APP_USER,
    subject: "New Form Submission",
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  const mailOptionsUser = {
    from: process.env.APP_USER,
    to: email,
    subject: "Thank you for your interest!",
    text: "We have received your form submission. Thanks.",
  };
  try {
    await transporter.sendMail(mailOptionsSelf);

    setTimeout(async () => {
      await transporter.sendMail(mailOptionsUser);
    }, 480000);

    return { success: true };
  } catch (error) {
    console.error("Error in sending email:", error);
    if (error.response && error.response.data) {
      console.error("OAuth2 Error Details:", error.response.data);
    }
    return { success: false, error: error.message, fullError: error };
  }
};

export default sendMail;
