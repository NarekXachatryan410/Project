const userModel = require("../models/userModel.js");
const { hash, compare } = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createTransport } = require("nodemailer");
const crypto = require("crypto");
const { User } = require("../schemas/schema.js");
const dotenv = require("dotenv");
dotenv.config();

const secretKey = process.env.JWT_SECRET;
class UserController {
  async signup(req, res) {
    const { name, surname, login, email, password } = req.body;
    if (!name || !surname || !login || !password || !email)
      return res.status(400).send({ error: "Please fill all fields" });

    const existing = await User.findOne({ $or: [{ login }, { email }] });
    if (existing)
      return res.status(403).send({ error: "Username already exists" });

    if (!email.includes("@")) {
      return res.status(403).send({ error: "Invalid email format" });
    }

    const hashed = await hash(password, 10);

    // Create user but not verified yet
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const resetCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    const newUser = new User({
      name,
      surname,
      login,
      email,
      password: hashed,
      isVerified: false,
      resetCode,
      resetCodeExpiry,
    });

    await newUser.save();

    try {
      await userModel.sendMail(
        process.env.MY_EMAIL,
        email,
        "Verify your account",
        `
      <div style="font-family:sans-serif;text-align:center;">
        <h2>👋 Welcome, ${name}!</h2>
        <p>Here is your verification code:</p>
        <h1 style="color:#16a34a;">${resetCode}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
      `
      );

      res.status(201).send({
        message: "User created, please verify your email",
        status: "ok",
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Failed to send verification email" });
    }
  }

  async resendCode(req, res) {
    const { email } = req.body;

    if (!email) return res.status(400).send({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ error: "User not found" });

    // Generate new code and expiry
    const resetCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    const resetCodeExpiry = Date.now() + 10 * 60 * 1000;

    await User.updateOne({ email }, { $set: { resetCode, resetCodeExpiry } });

    await userModel.sendMail(
      "noreply@yourapp.com",
      email,
      "Your New Verification Code",
      `
      <div style="font-family:sans-serif;text-align:center;">
        <h2>💬 Your New Verification Code</h2>
        <h1 style="letter-spacing:5px;color:#25D366;">${resetCode}</h1>
        <p>This code expires in 10 minutes.</p>
      </div>
    `
    );

    return res.status(200).send({ message: "New code sent successfully!" });
  }

  async verifyEmail(req, res) {
    const { email, code } = req.body;

    if (!email || !code)
      return res.status(400).send({ error: "Email and code required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ error: "User not found" });

    if (user.isVerified)
      return res.status(400).send({ error: "User already verified" });

    if (user.resetCode !== code)
      return res.status(400).send({ error: "Invalid verification code" });

    if (Date.now() > user.resetCodeExpiry) {
      await User.deleteOne({ email });
      return res
        .status(400)
        .send({ error: "Code has expired, please sign up again" });
    }

    // ✅ Verification successful
    user.isVerified = true;
    await user.save();
    await User.updateOne(
      { email },
      {
        $unset: {
          resetCode: "",
          resetCodeExpiry: "",
        },
      }
    );

    res
      .status(200)
      .send({ message: "Email verified successfully", status: "ok" });
  }

  async login(req, res) {
    const { login, password } = req.body;
    const query = login.includes("@") ? { email: login } : { login };
    const found = await User.findOne(query);

    if (!found) return res.status(404).send({ error: "Incorrect credentials" });

    const isCorrect = await compare(password, found.password);
    if (!isCorrect)
      return res.status(400).send({ error: "Incorrect credentials" });

    const token = jwt.sign(
      {
        id: found._id,
        name: found.name,
        surname: found.surname,
        login: found.login,
        picture: found.picture,
      },
      secretKey,
      { expiresIn: "2h" }
    );
    res.status(200).send({ message: "user found", status: "ok", token });
  }

  verify(req, res) {
    return res.json({ status: "ok", payload: req.user });
  }

  logout(req, res) {
    res.status(200).send({ message: "Logged out successfully" });
  }

  async passwordResetByEmail(req, res) {
    const { email } = req.body;

    // 1. Validate input
    if (!email || !email.trim()) {
      return res.status(400).send({ error: "Please provide your email" });
    }

    if (!email.includes("@")) { 
      return res.status(403).send({ error: "Invalid email format" });
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const resetCode = crypto.randomBytes(4).toString("hex").toUpperCase();
    const expiry = Date.now() + 10 * 60 * 1000;

    user.resetCode = resetCode;
    user.resetCodeExpiry = expiry;
    await user.save();

    try {
      await userModel.sendMail(
        process.env.MY_EMAIL,
        email,
        "Your One-Time Login Code",
        `
            <div style="font-family:sans-serif;text-align:center;">
              <h2>🔐 Your One-Time Login Code</h2>
              <h1 style="letter-spacing:5px; color:#16a34a;">${resetCode}</h1>
              <p>It expires in 10 minutes.</p>
            </div>
            `
      );

      const masked = email.replace(/(.{2}).+(@.+)/, "$1***$2");
      res.status(200).send({ message: `Code sent to ${masked}` });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Failed to send email, try again later" });
    }
  }

  async verifyResetCode(req, res) {
    const { code } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).send({ error: "Please provide the code" });
    }

    // Find user by reset code
    const user = await User.findOne({ resetCode: code });

    if (!user) {
      return res.status(404).send({ error: "Invalid code" });
    }

    // Check if code is expired
    if (user.resetExpiry < Date.now()) {
      return res.status(400).send({ error: "Code has expired" });
    }

    await User.updateOne(
      { resetCode: code },
      {
        $unset: {
          resetCode: "",
          resetCodeExpiry: "",
        },
      }
    );

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
        surname: user.surname,
        login: user.login,
        picture: user.picture,
      },
      secretKey,
      { expiresIn: "2h" }
    );

    res.status(200).send({ message: "Code verified, logged in", token });
  }

  async resetPassword(req, res) {
    const { password } = req.body;
    if (!password) {
      return res.status(404).send({ error: "Please fill the field" });
    }

    const { id } = req.user;
    const hashed = await hash(password, 10);
    await User.findByIdAndUpdate(id, { $set: { password: hashed } });

    return res
      .status(200)
      .send({ message: "Password updated successfully", success: "ok" });
  }

  async getUsers(req, res) {
    const users = await User.find({});
    return res.status(200).send({ users });
  }
}

module.exports = new UserController();
