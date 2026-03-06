import nodemailer from "nodemailer";
import { EMAIL, EMAIL_APP_PASSWORD } from "../../../../config/config.service.js";
export const sendEmail= async ({to,cc,bcc,subject,html,text,attachments=[]})=>{
    // Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  service:"gmail",
  auth: {
    user: EMAIL,
    pass: EMAIL_APP_PASSWORD,
  },
});

// Send an email using async/await
(async () => {
  const info = await transporter.sendMail({
    to,
    cc,
    bcc,
    subject,
    html,
    text,
    attachments,
    from: `"Saraha App" <${EMAIL}>`,
    
  });

  console.log("Message sent:", info.messageId);
})();
}