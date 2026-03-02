const transporter = require("../config/emailConfig");

const sendOTPEmail = async (email, firstName, otp) => {
  const mailOptions = {
    from: `"Rezell" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify your CampusCart account",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color: #6366f1;">Welcome to CampusCart 👋</h2>
        <p>Hi <strong>${firstName}</strong>,</p>
        <p>Use the OTP below to verify your account.</p>
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
          If you did not request this, please ignore this email.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOTPEmail;