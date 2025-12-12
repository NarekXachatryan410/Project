const { User } = require("../schemas/schema.js")
const { createTransport } = require("nodemailer")
const dotenv = require("dotenv")
dotenv.config()

class UserModel {
  constructor() {
    this.User = User
  }

  async findByEmail(email) {
    return await this.User.findOne({email})
  }

  async createUser(data) {
    const user = new this.User(data)
    await user.save()
  }

  // Example: Find user by login
  async findByLogin(login) {
    return await this.User.findOne({ login });
  }

  async sendMail(from, to, subject, html) {
    const transporter = createTransport({
      service: "gmail",
      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.PASSWORD_TOKEN
      }
    })

    const mailOptions = {
      from,
      to,
      subject,
      html
    }

    await transporter.sendMail(mailOptions)
  }
}

module.exports = new UserModel();