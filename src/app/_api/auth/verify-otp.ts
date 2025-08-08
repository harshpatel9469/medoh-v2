import { NextApiRequest, NextApiResponse } from "next";
import { otpStore } from "./send-otp";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { phoneNumber, code } = req.body;
    const validOtp = otpStore[phoneNumber];

    if (validOtp && validOtp === code) {
      delete otpStore[phoneNumber]; // remove OTP after use
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
