import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
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
          fromName: options.fromName,
          fromEmail: options.fromEmail
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

  const senderName = options.fromName || process.env.FROM_NAME || 'Meta Gen AI';
  const senderEmail = options.fromEmail || process.env.FROM_EMAIL || process.env.EMAIL_USER || 'noreply@metagenerator.com';
  
  const message = {
    from: `${senderName} <${senderEmail}>`,
    to: options.email,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.message,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${options.subject}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 30px; margin-top: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { color: #111827; font-size: 24px; margin: 0; }
            .content { background: #fff; padding: 20px; border-radius: 6px; border: 1px solid #f3f4f6; font-size: 15px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${senderName}</h1>
            </div>
            <div class="content">
              ${options.message.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}
            </div>
            <div class="footer">
              <p>This is an automated message. Please do not reply directly to this email.</p>
              <p>&copy; ${new Date().getFullYear()} ${senderName}. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);
  if (info.messageId && !host) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  }
};

export default sendEmail;
