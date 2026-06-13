import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (options: EmailOptions) => {
  const proxyUrl = process.env.EMAIL_PROXY_URL;
  const secretKey = process.env.EMAIL_PROXY_SECRET;

  if (proxyUrl && secretKey) {
    try {
      // Use dynamic import for fetch or just global fetch in node 18+
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: options.email,
          subject: options.subject,
          message: options.message,
          secretKey,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown proxy error' }));
        throw new Error(`Proxy error: ${err.error || response.statusText}`);
      }

      console.log("Email sent via Vercel proxy");
      return;
    } catch (error) {
      console.error("Failed to send email via proxy", error);
      throw error;
    }
  }

  // Fallback to regular nodemailer
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
    from: process.env.EMAIL_FROM || `${process.env.FROM_NAME || 'Meta Gen AI'} <${process.env.FROM_EMAIL || 'noreply@metagenerator.com'}>`,
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
