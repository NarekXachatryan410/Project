const  userController = require("../controllers/userController.js")
const express = require("express")
const { authMiddlware } = require("../middlewares/authMiddlware.js")
const { accountController, upload } = require("../controllers/accountController.js")
const chatController = require("../controllers/chatController.js")
const groupController = require("../controllers/groupController.js")
const userRouter = express.Router()
const accountRouter = express.Router()
const chatRouter = express.Router()
const groupsRouter = express.Router()

//userRouter
userRouter.post('/signup', userController.signup)
userRouter.post('/login', userController.login)
userRouter.get('/verify', authMiddlware, userController.verify)
userRouter.post('/logout', userController.logout)
userRouter.post('/password/forgot', userController.passwordResetByEmail)
userRouter.post('/verify-code', userController.verifyResetCode)
userRouter.patch('/reset-password', authMiddlware, userController.resetPassword)
userRouter.post('/verifyEmail', userController.verifyEmail)
userRouter.post('/resend', userController.resendCode)
userRouter.get("/users", authMiddlware, userController.getUsers)
//userRouter
//////////////////////////////////////////////////////////////////////////
//accountRouter
accountRouter.patch('/upload', authMiddlware, upload.single("picture"), accountController.uploadPic)
accountRouter.get('/search/:text', authMiddlware, accountController.searchText)
accountRouter.get('/me', authMiddlware, accountController.getMyAccount)
accountRouter.get('/:id', authMiddlware, accountController.getAccountById)
accountRouter.patch('/update-password', authMiddlware, accountController.updatePassword)
accountRouter.patch('/update-username', authMiddlware, accountController.updateLogin)
accountRouter.patch('/update-name-surname', authMiddlware, accountController.updateNameSurname)
accountRouter.patch('/picture/delete', authMiddlware, accountController.deletePic)
accountRouter.patch('/block/:id', authMiddlware, accountController.blockUserById)
accountRouter.get('/blocked/:id', authMiddlware, accountController.checkBlocked)
accountRouter.delete('/unblock/:id', authMiddlware, accountController.unBlockUserById)
//accountRouter
///////////////////////////////////////////////////////////////////////////
//chatRouter
chatRouter.get('/:id', authMiddlware, chatController.getChatWithUser)
chatRouter.get('/', authMiddlware, chatController.getChats)
chatRouter.patch("/upload", authMiddlware, upload.single("attachment"), chatController.upload)
chatRouter.delete('/chat/:id', authMiddlware, chatController.deleteChatById)
chatRouter.get('/search/:text', authMiddlware, chatController.searchByText)
//chatRouter
//////////////////////////////////////////////////////////////////////////
//groupsRouter
groupsRouter.post('/create', authMiddlware, groupController.createGroup)
groupsRouter.get('/', authMiddlware, groupController.getGroups)
groupsRouter.get("/:id", authMiddlware, groupController.getGroupById)
groupsRouter.patch("/upload", authMiddlware, upload.single("attachment"), groupController.upload)
groupsRouter.get('/:id/messages', authMiddlware, groupController.getGroupMessagesById)
groupsRouter.delete("/:id/exit", authMiddlware, groupController.exit)
//groupsRouter
///////////////////////////////////////////////////////////////////////

module.exports = { userRouter, accountRouter, chatRouter, groupsRouter }