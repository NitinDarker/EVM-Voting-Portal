import nodemailer from "nodemailer";

export async function sendOTP(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "evm.portal.verify@gmail.com", 
      pass: process.env.GMAIL_APP_PASSWORD, 
    },
  });

  await transporter.sendMail({
    from: "evm.portal.verify@gmail.com",
    to: email,
    subject: "Your OTP",
    text: `Your OTP is: ${otp}`,
  });
}
