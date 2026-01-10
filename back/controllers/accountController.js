const multer = require("multer");
const { User, Blocks } = require("../schemas/schema.js");
const path = require("path");
const fs = require("fs");
const { compare, hash } = require("bcrypt");
const { default: mongoose } = require("mongoose");
const { ObjectId } = require("mongodb");

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now() + ext);
  },
});

const upload = multer({ storage });

class AccountController {
  async uploadPic(req, res) {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });

      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const userId = req.user.id;
      const fileUrl = `/uploads/${req.file.filename}`;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { picture: fileUrl },
        { new: true }
      );

      if (!updatedUser)
        return res.status(404).json({ error: "User not found" });

      res.json({ url: updatedUser.picture });
    } catch (err) {
      console.error("UPLOAD PIC ERROR:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async searchText(req, res) {
    const { text } = req.params;
    const users = await User.find({
      name: { $regex: new RegExp(`^${text}`, "i") },
    }).select("-password");
    return res.status(200).send({ users });
  }

  async getAccountById(req, res) {
    const { id } = req.params;
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    return res.status(200).send({ user });
  }

  async updatePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).send({ error: "Please fill all the fields" });
    }

    const { id } = req.user;
    const user = await User.findById(id);
    const isCorrect = await compare(currentPassword, user.password);
    if (!isCorrect) {
      return res.status(400).send({ error: "Incorrect password" });
    }

    const hashed = await hash(newPassword, 10);
    await User.updateOne(
      { _id: id },
      {
        $set: {
          password: hashed,
        },
      }
    );

    res.status(200).send({ message: "Password updated successfully" });
  }

  async updateLogin(req, res) {
    const { login } = req.body;
    const { id } = req.user;

    await User.updateOne(
      { _id: id },
      {
        $set: {
          login,
        },
      }
    );

    res.status(200).send({ message: "Login updated successfully" });
  }

  async updateNameSurname(req, res) {
    const { name, surname } = req.body;
    const { id } = req.user;
    const user = await User.findOne({ _id: id });
    user.name = name ? name : user.name;
    user.surname = surname ? surname : user.surname;
    await user.save();

    return res
      .status(200)
      .send({ message: "User name/surname updated successfully" });
  }

  async deletePic(req, res) {
    try {
      const { id } = req.user;
      const user = await User.findById(id);
      user.picture = "";
      await user.save();
      return res.status(200).send({ message: "Picture is removed" });
    } catch {
      return res.status(500).send({ error: "Server error" });
    }
  }

  async getMyAccount(req, res) {
    const { id } = req.user;
    const user = await User.findById(id);
    return res.status(200).send({ user });
  }

  async blockUserById(req, res) {
    const { id } = req.params;
    const { id: userId } = req.user;
    const isBlocked = await Blocks.findOne({
      blockedBy: userId,
      blockedTo: id,
    });
    if (isBlocked) {
      return res.status(403).send({ error: "You already blocked this user" });
    }
    const blocking = new Blocks({
      blockedTo: new ObjectId(id),
      blockedBy: new ObjectId(userId),
    });
    await blocking.save();
    return res.status(200).send({ message: "successfully blocked" });
  }

  async checkBlocked(req, res) {
    const { id } = req.params; // target user
    const { id: userId } = req.user; // logged-in user

    const blocked = await Blocks.findOne({
      blockedBy: userId,
      blockedTo: id,
    });

    return res.status(200).send({ blocked: !!blocked });
  }

  async unBlockUserById(req, res) {
    const { id } = req.params
    const { id: userId } = req.user
    await Blocks.deleteOne({blockedBy: userId, blockedTo: id})
    return res.status(200).send({message: "success"})
  }
}

module.exports = {
  accountController: new AccountController(),
  upload,
};
