const transporter = require("../config/emailConfig");
const logger = require("./logger");

const escapeHtml = (str = "") =>
  str.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );

const sendOTPEmail = async (email, firstName, otp, purpose = "verify") => {
  if (!email || !otp) {
    throw new Error("sendOTPEmail: 'email' and 'otp' are required");
  }

  const safeName = escapeHtml(firstName || "there");
  const isReset = purpose === "reset";

  const heading = isReset
    ? "Reset your password 🔐"
    : "Welcome to CampusCart 👋";
  const subject = isReset
    ? "Your CampusCart password reset code"
    : "Verify your CampusCart account";
  const bodyLine = isReset
    ? "Use the OTP below to reset your password."
    : "Use the OTP below to verify your account.";
  const ignoreLine = isReset
    ? "If you did not request a password reset, please ignore this email and your password will remain unchanged."
    : "If you did not request this, please ignore this email.";

  const mailOptions = {
    from: `"Rezell" <${process.env.SMTP_USER}>`,
    to: email,
    subject,
    text: `Hi ${firstName || "there"},\n\nYour CampusCart ${isReset ? "password reset" : "verification"} code is: ${otp}\n\nThis code is valid for 10 minutes. ${ignoreLine}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #6366f1;">${heading}</h2>
        <p>Hi <strong>${safeName}</strong>,</p>
        <p>${bodyLine}</p>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>

        <div style="
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 8px;
          color: #6366f1;
          background: #f1f0ff;
          padding: 16px 32px;
          border-radius: 12px;
          display: inline-block;
          margin: 16px 0;
        ">
          ${otp}
        </div>

        <p style="color: #888; font-size: 13px;">
          ${ignoreLine}
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    logger.error(`Failed to send OTP email to ${email}:`, err.message);
    throw err;
  }
};

module.exports = sendOTPEmail;
