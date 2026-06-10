import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (options: EmailOptions) => {
  let transporter;
  
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST;
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT) || 587;
  
  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: port === 465, // true for port 465
      auth: {
        user: user,
        pass: pass,
      },
    });
  } else {
    // Generate test account
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }

  const message = {
    from: process.env.EMAIL_FROM || `${process.env.FROM_NAME || 'Meta Generator'} <${process.env.FROM_EMAIL || 'noreply@metagenerator.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<p>${options.message.replace(/\n/g, '<br/>')}</p>`,
  };

  const info = await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);
  if (info.messageId && !host) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
};

export default sendEmail;
