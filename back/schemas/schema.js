const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: String,
  surname: String,
  login: String,
  password: String,
  picture: { type: String, default: "" },
  email: { type: String, default: "" },
  isVerified: { type: Boolean, default: false },
  resetCode: String,
  resetCodeExpiry: Date,
});

userSchema.index({login: 1, email: -1 })

const messageSchema = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: "User" },
    to: { type: Schema.Types.ObjectId, ref: "User" },
    text: String,
    attachment: String,
    read: Boolean,
  },
  { timestamps: true }
);

const groupSchema = new Schema({
  name: { type: String, required: true },
  image: {
    type: String,
    default: "https://default-group-image-url.com/default.png",
  },
  admin: { type: Schema.Types.ObjectId, ref: "User" },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

const groupMessagesSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    groupId: { type: Schema.Types.ObjectId, ref: "Group" },
    text: String,
    attachment: String,
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const blocksSchema = new Schema({
    blockedTo: { type: Schema.Types.ObjectId, ref: "User" },
    blockedBy: { type: Schema.Types.ObjectId, ref: "User" }
})

const User = model("User", userSchema);
const Message = model("Message", messageSchema);
const Group = model("Group", groupSchema);
const GroupMessage = model("GroupMessages", groupMessagesSchema);
const Blocks = model("Blocks", blocksSchema)
module.exports = { User, Message, Group, GroupMessage, Blocks };
