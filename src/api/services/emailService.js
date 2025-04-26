const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPasswordResetEmail = async (toEmail, newPassword) => {
  const mailOptions = {
    to: toEmail,
    subject: 'Your New Password',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 10px;">
        <img src="https://cdn-icons-png.flaticon.com/512/3081/3081559.png" alt="Logo" style="width: 80px; height: auto; margin-bottom: 20px;" />
        <p>Hello,</p>
        <p>Your new password is:</p>
        <p style="font-size: 18px; font-weight: bold; color: #333;">${newPassword}</p>
        <p>Please change it after logging in.</p>
        <p>If you didn’t request this, please contact support immediately.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new Error('Failed to send password reset email.');
  }
};

module.exports = { sendPasswordResetEmail };
