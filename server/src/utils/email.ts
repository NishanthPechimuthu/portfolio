import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { env } from 'process';

const resend = new Resend(env.RESEND_KEY || '');

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const fromName = env.RESEND_NAME || env.EMAIL_NAME || 'Portfolio Admin';
  const fromEmail = env.RESEND_EMAIL || env.REPLY_EMAIL || 'contact@yourdomain.com';
  
  try {
    if (!env.RESEND_KEY) {
      throw new Error('No RESEND_KEY provided, skipping Resend.');
    }

    // Try sending with Resend
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject,
      html,
    });

    if (error) {
      throw new Error(error.message);
    }
    
    return { success: true, provider: 'resend', id: data?.id };
  } catch (error: any) {
    console.warn(`Resend failed: ${error.message}. Falling back to SMTP...`);
    
    // Fallback to Nodemailer
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
      throw new Error('SMTP credentials are not fully configured for fallback.');
    }

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT) || 587,
      secure: Number(env.SMTP_PORT) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    const smtpFromName = env.EMAIL_NAME || fromName;
    const smtpFromEmail = env.SMTP_FROM || env.REPLY_EMAIL || env.SMTP_USER;

    const info = await transporter.sendMail({
      from: `"${smtpFromName}" <${smtpFromEmail}>`,
      to,
      subject,
      html,
    });

    return { success: true, provider: 'smtp', id: info.messageId };
  }
}
