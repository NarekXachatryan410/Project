const { Group, GroupMessage, User } = require("../schemas/schema.js");
const { ObjectId } = require("mongodb");

class GroupController {
  async getGroups(req, res) {
    const { id: userId } = req.user;
    const groups = await Group.find({ members: userId }).populate(
      "members",
      "name surname picture"
    );
    return res.status(200).send({ groups });
  }

  async createGroup(req, res) {
    const { name, members } = req.body;
    const { id: userId } = req.user;
    const admin = await User.findById(userId);
    const newGroup = new Group({
      name,
      admin: admin._id,
      members: [admin._id, ...members],
    });
    await newGroup.save();

    return res.status(201).send({ group: newGroup });
  }

  async getGroupById(req, res) {
    const { id } = req.params;
    const group = await Group.findById(id);
    return res.status(200).send({ group });
  }

  async upload(req, res) {
    return res.json({ url: `/uploads/${req.file.filename}` });
  }

  async getGroupMessagesById(req, res) {
    const { id } = req.params;
    const messages = await GroupMessage.find({ groupId: id }).populate(
      "sender",
      "name surname username picture"
    );
    return res.status(200).send({ messages });
  }

  async exit(req, res) {
    const { id } = req.params;
    const { id: userId } = req.user;

    try {
      const group = await Group.findOneAndUpdate(
        { _id: id },
        { $pull: { members: userId } },
        { new: true }
      );

      if (!group) return res.status(404).send({ message: "Group not found" });

      if (group.admin && group.admin.toString() === userId.toString()) {
        group.admin = undefined;
        await group.save();
      }

      if ((group.members.length === 0 || !group.members) && !group.admin) {
        await Group.findByIdAndDelete(id);
        await GroupMessage.deleteMany({ groupId: id });
        return res.status(200).send({ deleted: true });
      }

      return res.status(200).send({ group });
    } catch (err) {
      console.error(err);
      return res.status(500).send({ message: "Server Error" });
    }
  }
}

module.exports = new GroupController();
