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
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });

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
router.post("/data", verifyToken, (req, res) => {
  res.json({ message: `Welcome,${req.user.email}! This is protected data` });
});
// Forgot Password
router.post("/reset-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not Found" });
  }
  const token = Math.random().toString(36).slice(-8);
  user.resetPasswordToken = token;
  user.resetpasswordExpire = Date.now() + 360000;
  await user.save();
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "svagowtham3004@gmail.com",
      pass: "mnzc jcaa sxrk gkjs",
    },
  });
  const message = {
    from: "svagowtham3004@gmail.com",
    to: user.email,
    subject: "password rest request",
    text: `otp ${token}`,
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
