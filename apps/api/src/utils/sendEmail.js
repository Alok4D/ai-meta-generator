"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendEmail = async (options) => {
    // If SMTP is not configured, use Ethereal for testing
    let transporter;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    else {
        // Generate test account
        const testAccount = await nodemailer_1.default.createTestAccount();
        transporter = nodemailer_1.default.createTransport({
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
        from: `${process.env.FROM_NAME || 'Meta Generator'} <${process.env.FROM_EMAIL || 'noreply@metagenerator.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: `<p>${options.message}</p>`,
    };
    const info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);
    if (info.messageId && !process.env.SMTP_HOST) {
        console.log("Preview URL: %s", nodemailer_1.default.getTestMessageUrl(info));
    }
};
exports.default = sendEmail;
//# sourceMappingURL=sendEmail.js.map