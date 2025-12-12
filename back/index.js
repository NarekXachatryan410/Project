const express = require("express")
const { connect } = require("./db/db.js")
const app = express()
const cors = require("cors")
const { userRouter, accountRouter, chatRouter, groupsRouter } = require("./routes/routes.js")
connect()
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use('/uploads', express.static("uploads"))
app.use(express.json())
app.use(express.urlencoded())
app.use('/', userRouter)
app.use('/account', accountRouter)
app.use('/chats', chatRouter)
app.use("/groups", groupsRouter)

app.listen(4002, () => console.log("SERVER IS RUNNING ON http://localhost:4002"))