import sgMail from "@sendgrid/mail";

export const sendEmail = async (name: string, email: string, subject:string, message:string) => {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string)

    const msg = {
        to: "contact@medohhealth.com",
        from: { email: "contact@medohhealth.com", name: "Contact Us" },
        replyTo: email,
        subject: subject,
        text: message,
    };

    const response = await sgMail.send(msg);
};