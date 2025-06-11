const Conversation = require('../models/conversation');
const User = require('../models/user');

exports.getUserGroups = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Find groups where the user is a participant
    const groups = await Conversation.find({
      isGroupChat: true,
      participants: userId
    })
    .select("_id groupName participants")
    .sort({ updatedAt: -1 })
    .exec();

    // Format response to include only id, name, and members
    const formattedGroups = groups.map(group => ({
      id: group._id,
      name: group.groupName,
      members: group.participants
    }));

    res.status(200).json(formattedGroups);
  } catch (error) {
    res.status(500).json({ message: "Error fetching groups", error });
  }
};

