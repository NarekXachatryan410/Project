const mongoose = require("mongoose")
const dotenv = require("dotenv")
dotenv.config()

const connect = () => {
    mongoose.connect(process.env.DATABASE)
    .then(() => console.log("DB CONNECTED"))
    .catch(() => console.log("FAILED TO CONNECT"))
}

module.exports = { connect }