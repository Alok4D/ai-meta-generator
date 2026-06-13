import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, subject, message, secretKey } = body;

    // Use a basic secret key to prevent unauthorized usage
    if (secretKey !== process.env.EMAIL_PROXY_SECRET) {
      return NextResponse.json({ error: 'Unauthorized email proxy request' }, { status: 401 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject,
      text: message,
      html: `<p>${message.replace(/\n/g, '<br/>')}</p>`,
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error("Email proxy error:", error);
    return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 500 });
  }
}
