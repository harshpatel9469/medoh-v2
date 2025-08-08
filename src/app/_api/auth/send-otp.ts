import { NextApiRequest, NextApiResponse } from "next";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);

// In-memory storage for OTP (use DB/Redis in production)
const otpStore: Record<string, string> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { phoneNumber } = req.body;

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[phoneNumber] = otp; // Save temporarily

    try {
      await client.messages.create({
        body: `Your verification code is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: phoneNumber,
      });

      res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to send OTP" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

export { otpStore }; // export for verification route
