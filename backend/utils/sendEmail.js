const nodemailer = require('nodemailer');

// Simple wrapper around nodemailer. See README or .env for SMTP configuration.
// If SMTP info is missing or send fails, the function will still resolve but log the error.

async function sendEmail({ to, subject, text, html }) {
  try {
    // create transporter from env config
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const message = {
      from: process.env.EMAIL_FROM || '"TrakIO" <no-reply@trakio.com>',
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(message);
    console.log('📧 Email sent to %s: %s', to, info.messageId);
  } catch (err) {
    console.error('❌ Failed to send email', err);
  }
}

module.exports = sendEmail;
