const Conversation = require('../models/conversation');
const User = require('../models/user');
const Message = require('../models/message');

class ConversationService {
  async createGroup(data) {
    const { groupName, participants, groupAdmin, groupPhoto } = data;
    
    if (participants.length < 1) {
      throw new Error("A group chat must have at least 2 participants");
    }

    const users = await User.find({ _id: { $in: participants } });
    if (users.length !== participants.length) {
      throw new Error("Some participants are invalid");
    }

    const group = await Conversation.create({
      groupName,
      groupAdmin,
      participants: [groupAdmin, ...participants],
      isGroupChat: true,
      groupPhoto: groupPhoto || "",
    });

    await group.save();
    
    return group;
  }

  async sendMessageToGroup(data) {
    const {groupId, senderId, content, media} = data;

    const group = await Conversation.findById(groupId);
    if (!group || !group.isGroupChat) {
      throw new Error("Group chat not found");
    }

    if (!group.participants.includes(senderId)) {
      throw new Error("You are not a participant of this group");
    }

    const newMessage = await Message.create({
      senderId,
      receiverId: groupId,
      content,
      media,
      seenBy: [senderId],
    });

    group.messages.push(newMessage._id);
    await Promise.all([group.save(), newMessage.save()]);

    return { newMessage, group };
  }

  async addParticipants(data) {
    const {groupId, adminId, participants} = data;
    const group = await Conversation.findById(groupId);
    if (!group || !group.isGroupChat) {
      throw new Error("Group chat not found");
    }

    const admin = await Conversation.find({ adminId: { $in: group.groupAdmin } })
    if (!admin) {
      throw new Error("You are not the admin of this group");
    }

    const users = await User.find({ _id: { $in: participants } });
    if (users.length !== participants.length) {
      throw new Error("Some participants are invalid");
    }

    group.participants.push(...participants);
    return group.save();
  }

  async removeParticipants(data) {
    const {groupId, adminId, participants} = data;
    const group = await Conversation.findById(groupId);
    if (!group || !group.isGroupChat) {
      throw new Error("Group chat not found");
    }

    const admin = await Conversation.find({ adminId: { $in: group.groupAdmin } })
    if (!admin) {
      throw new Error("You are not the admin of this group");
    }

    const participantsToRemove = participants.filter(participant =>
      group.participants.includes(participant)
    );

    return Conversation.findByIdAndUpdate(
      groupId,
      { $pull: { participants: { $in: participantsToRemove } } },
      { new: true }
    );
  }
  leaveGroup(data) {
    const { groupId, userId } = data;
    return Conversation.findByIdAndUpdate(
      groupId,
      { $pull: { participants: userId } },
      { new: true }
    );  
  }

}

module.exports = ConversationService;
