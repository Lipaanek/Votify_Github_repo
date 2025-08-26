import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export async function sendVerificationMail(email: string) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
    }
    });

    const info = await transporter.sendMail({
      from: `"VoxPlatform Test" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Test Verification Code",
      text: "Hello! This is a test email from VoxPlatform.",
    });

    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
