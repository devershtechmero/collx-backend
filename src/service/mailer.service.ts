import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: Number(process.env.MAILER_PORT || 587),
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS
  }
});

const sender_email = process.env.SENDER_EMAIL;

const sendEmail = async (to: string, subject: string, html: string) => {
  if(!to || !subject || !html || !sender_email) throw new Error('Email params missing !');

  try{
    await transporter.sendMail({
      from: sender_email,
      to, subject, html
    });

    console.info(`Email sent to: ${to}`);
  }
  catch(err) {
    console.error('Error in sending email service', err);
    return null;
  }
}

export default sendEmail;