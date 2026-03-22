import nodemailer from "nodemailer";
import { EMAIL, EMAIL_APP_PASSWORD } from "../../../../config/config.service.js";
export const sendEmail= async ({to,cc,bcc,subject,text,html,attachments=[]})=>{
    // Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
const transporter = nodemailer.createTransport({
  service:"gmail",
  auth: {
    user: EMAIL,
    pass: EMAIL_APP_PASSWORD,
  },
  // tls:{
  //   rejectUnauthorized:false
  // }
});

// Send an email using async/await
(async () => {
  const info = await transporter.sendMail({
    from: `"Saraha App" <${EMAIL}>`,
    to,
    cc,
    bcc,
    subject,
    text,
    html,
    attachments,
    
  });

  console.log("Message sent:", info.messageId);
})();
}