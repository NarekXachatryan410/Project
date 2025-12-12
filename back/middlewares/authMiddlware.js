const { verify } = require("jsonwebtoken")
const dotenv = require("dotenv")
const { User } = require("../schemas/schema.js")
dotenv.config()

const secretKey = process.env.JWT_SECRET

/**
 * 
 * @param {{authorization, headers}} req 
 * @param {*} res 
 * @param {()} next 
 */
async function authMiddlware(req, res, next) {
    const authHeader = req.headers.authorization

    if(!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).send({error: "Token is not provided"})
    }

    const token = authHeader.split(" ")[1]

    try {
        const decoded = verify(token, secretKey)
        const user = await User.findById(decoded.id)
        if(!user.isVerified) {
            throw new Error()
        }
        req.user = decoded
        next()
    } catch {
        res.status(401).send({error: "you have to verify your identity"})
    }
}

module.exports = {authMiddlware}