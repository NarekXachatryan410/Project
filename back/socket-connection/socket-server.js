const { Server } = require("socket.io");
const { createServer } = require("http");
const express = require("express");
const { connect } = require("../db/db.js"); // MongoDB connection
const { Message, GroupMessage } = require("../schemas/schema.js");
const { default: mongoose } = require("mongoose");
const { group } = require("console");
const dotenv = require("dotenv")
dotenv.config()
const { ObjectId } = require("mongodb")

connect(); // Make sure DB is connected

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_ORIGIN,
    credentials: true
  },
});

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("join_group", (groupId) => {
      socket.join(groupId);
  });

  socket.on("send_message", async (data) => {
    try {
      const message = new Message({
        from: data.from,
        to: data.to,
        text: data.text,
        createdAt: data.createdAt,
        attachment: data.attachment || "",
      });

      await message.save();

      io.in(data.to).emit("receive_message", message);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });

  socket.on("delete_message", async (id) => {
    try {
      await Message.findByIdAndDelete(new mongoose.Types.ObjectId(id));
      io.emit("message_deleted", id);
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  });

  socket.on("edit_message", async (data) => {
    try {
      const updated = await Message.findByIdAndUpdate(
        data._id,
        { text: data.text },
        { new: true }
      );
      io.emit("message_edited", { id: data._id, text: updated.text });
    } catch (err) {
      console.error("Error editing message:", err);
    }
  });

  socket.on("message_read", async ({ messageIds, to }) => {
    try {
      await Message.updateMany(
        { _id: { $in: messageIds } },
        { read: true }
      );
      io.to(to).emit("message_read", { messageIds });
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  });

  socket.on("send_group_message", async (data) => {
    try {
      const newMessage = new GroupMessage({
        sender: data.sender._id,
        groupId: data.groupId,
        text: data.text,
        attachment: data.attachment || "",
      });
      await newMessage.save();

      socket.to(data.groupId).emit("receive_group_message", newMessage)
    } catch (err) {
      console.error("Error sending group message:", err);
    }
  });

  socket.on("delete_group_message", async (data) => {
    await GroupMessage.findOneAndDelete({_id: new ObjectId(data.id)})

    socket.to(data.groupId).emit("group_message_deleted", data)
  })

  socket.on("edit_group_message", async (data) => {
    const found = await GroupMessage.findById(data._id)
    found.text = data.text
    await found.save()

    socket.emit("group_message_edited", found)
  })
});

server.listen(4010, () => console.log("🚀 Socket server running on port 4010"));