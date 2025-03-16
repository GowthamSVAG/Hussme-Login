const express = require("express");
const User = require("..//model");
const bcrypt = require("bcryptjs");
const generateToken = require("../Utils");
const verifyToken = require("../middleware");
const nodemailer = require("nodemailer");
const router = express.Router();

router.get("/test", (req, res) =>
  res.json({ message: "Testing route Successfully" })
);
// Ceate a new user
router.post("/user", async (req, res) => {
  const { username, email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();

    return res.status(201).json({ message: "User Created Succcessfully" });
  }

  res.status(404).json({ message: "User already Exists" });
});
// Check the user Authentication
router.post("/auth", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    {
      return res.status(401).json({
        message: "Password Incorrect",
      });
    }
  }
  const Token = generateToken(user);
  res.json({ Token });
});

// verify the token
router.get("/me", verifyToken, async (req, res) => {
  try {
    // Find the complete user data to include username
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Return complete user data (except password)
    res.json({
      email: user.email,
      username: user.username,
      _id: user._id
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Forgot Password
router.post("/reset-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not Found" });
  }
  const token = Math.random().toString(36).slice(-5);
  user.resetPasswordToken = token;
  user.resetpasswordExpire = Date.now() + 300000; // 5 minutes in milliseconds
  await user.save();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "svagowtham3004@gmail.com",
      pass: "mnzc jcaa sxrk gkjs",
    },
  });

  const message = {
    from: '"Hussme Support" <svagowtham3004@gmail.com>',
    to: user.email,
    subject: "Password Reset Request - Hussme Account",
    text: `Dear ${user.username},\n\nYou have requested to reset your password for your Hussme account. Your verification code is: ${token}\n\nThis code will expire in 5 minutes. If you did not request this password reset, please ignore this email or contact our support team immediately.\n\nBest regards,\nThe Hussme Team`,
    html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Password Reset</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          max-width: 200px;
          margin-bottom: 20px;
        }
        .content {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 30px;
          margin-bottom: 30px;
        }
        .verification-code {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 4px;
          padding: 20px;
          margin: 20px 0;
          background-color: #eaeaea;
          border-radius: 8px;
          color: #9747ff;
        }
        .button {
          display: block;
          width: 200px;
          padding: 12px 0;
          margin: 30px auto;
          background-color: #9747ff;
          color: white;
          text-align: center;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #777777;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eeeeee;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Hussme Password Reset</h1>
      </div>
      <div class="content">
        <p>Dear <strong>${user.username}</strong>,</p>
        <p>We received a request to reset the password for your Hussme account. To complete the process, please use the verification code below:</p>
        
        <div class="verification-code">${token}</div>
        
        <p>This code is valid for 5 minutes. For security reasons, please do not share this code with anyone.</p>
        
        <p>If you did not request a password reset, please ignore this email or contact our support team immediately as your account may be at risk.</p>
      </div>
      
      <p>Best regards,<br>The Hussme Team</p>
      
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Hussme. All rights reserved.</p>
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </body>
    </html>
    `
  };
  transporter.sendMail(message, (err, info) => {
    if (err) {
      res.status(404).json({ message: "Something Went Wrong" });
    }
    res.status(200).json({ message: "Email Sent!!" + info.response });
  });
});
//  Reset Password using email code
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetpasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(404).json({ message: "Invalid or Expired Token" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword; //updating the password
  user.resetPasswordToken = null; //removing the token
  user.resetpasswordExpire = null; //removing the expiry
  await user.save();
  res.status(200).json({ message: "Password Updated Successfully" });
});

module.exports = router;
