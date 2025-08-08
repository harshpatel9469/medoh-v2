import  { type NextRequest, NextResponse } from 'next/server'
import sgMail from "@sendgrid/mail"
 
export async function POST(
  req: NextRequest
) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)
    const body = await req.json();

    const msg = {
      to: "contact@medohhealth.com",
      from: { email: "contact@medohhealth.com", name: body.name},
      replyTo: body.email,
      subject: body.subject,
      text: body.message,
  };

  try {
    await sgMail.send(msg);
    return NextResponse.json({ msg: 'Email sent sucessfully' }, { status: 200 });
  }
  catch {
    return NextResponse.json({ msg: 'Failed to send email' }, { status: 400 });
  }
}