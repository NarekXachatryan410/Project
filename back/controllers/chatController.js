const { default: mongoose } = require("mongoose");
const { User, Message } = require("../schemas/schema.js");
const { ObjectId } = require("mongodb");

class ChatController {
  async getChatWithUser(req, res) {
    const { id: peerId } = req.params;
    const { id: myId } = req.user;

    const messages = await Message.find({
      $or: [
        { from: myId, to: peerId },
        { from: peerId, to: myId },
      ],
    }).sort({ createdAt: 1 }); // oldest first

    await Message.updateMany(
      { to: peerId, from: myId, read: false },
      { read: true }
    );

    return res.status(200).send({ messages });
  }

  // Send a message to a peer
  async sendMessageById(req, res) {
    const { text } = req.body;
    const { id: peerId } = req.params;
    const { id: userId } = req.user;

    if (!text && !attachment)
      return res.status(400).send({ error: "Message cannot be empty" });

    const message = new Message({
      from: userId,
      to: peerId,
      text,
    });

    await message.save();
    return res.status(201).send({ message });
  }

  // Delete a message by its ID
  async deleteMessageById(req, res) {
    const { id } = req.params;
    const { id: userId } = req.user;
    const message = await Message.findOne({ _id: id });
    if (userId.toString() == message.to.toString()) {
      return res
        .status(403)
        .send({ error: "You cannot delete this comment, its not yours" });
    }
    return res.status(200).send({ message: "Message deleted" });
  }

  async getChats(req, res) {
    try {
      const { id } = req.user;
      const userId = new mongoose.Types.ObjectId(id);

      const chats = await Message.aggregate([
        {
          $match: {
            $or: [{ from: userId }, { to: userId }],
          },
        },
        {
          $sort: { createdAt: -1 }, // newest first
        },
        {
          $group: {
            _id: {
              participants: {
                $cond: {
                  if: { $gt: ["$from", "$to"] },
                  then: ["$from", "$to"],
                  else: ["$to", "$from"],
                },
              },
            },
            lastMessage: { $first: "$$ROOT" },
          },
        },
        {
          $replaceWith: "$lastMessage",
        },
      ]);

      await Message.populate(chats, [
        { path: "from", select: "name surname login picture" },
        { path: "to", select: "name surname login picture" },
      ]);

      return res.status(200).send({ chats, currentUserId: userId });
    } catch (err) {
      console.error("getChats error:", err);
      res.status(500).send({ message: "Server error" });
    }
  }

  async handleAttachment(req, res) {
    const { id } = req.user;
    await Message.findByIdAndUpdate(
      id,
      { attachment: req.file?.filename },
      { new: true }
    );
    res.status(200).send({ message: "OK" });
  }

  async upload(req, res) {
    return res.json({url: `/uploads/${req.file.filename}`})
  }

  async searchByText(req, res) {
    const { text } = req.params;
    const found = await User.find({
      name: { $regex: new RegExp(`^${text}`, "i") },
    }).select("-password");
    return res.status(200).send({ users: found });
  }

  async deleteChatById(req, res) {
    try {
      const { id } = req.params; // the "other user" id
      const userId = req.user.id; // current logged-in user

      if (!id || !userId) {
        return res.status(400).send({ error: "Missing chat id or user id" });
      }

      const fromUserId = new mongoose.Types.ObjectId(userId);
      const toUserId = new mongoose.Types.ObjectId(id);

      const result = await Message.deleteMany({
        $or: [
          { from: fromUserId, to: toUserId },
          { from: toUserId, to: fromUserId },
        ],
      });

      return res.status(200).send({
        message: "Chat deleted",
        deletedCount: result.deletedCount,
      });
    } catch (err) {
      console.error("Error deleting chat:", err);
      return res.status(500).send({ error: "Error deleting chat" });
    }
  }
}

module.exports = new ChatController();
