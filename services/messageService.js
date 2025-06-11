const Message = require('../models/message');
const Conversation = require('../models/conversation');

class MessageService {
  async sendMessage(data) {
    const { senderId, receiverId, content, replyTo } = data;

    if (senderId === receiverId) {
      throw new Error('You cannot send a message to yourself.');
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
      isGroupChat: false,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        isGroupChat: false,
      });
    }

    if (replyTo) {
      const repliedMessage = await Message.findById(replyTo);
      if (!repliedMessage || !conversation.messages.includes(replyTo)) {
        throw new Error('Invalid reply message');
      }
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      content,
      replyTo: replyTo || null,
    });

    conversation.messages.push(newMessage._id);
    await conversation.save();

    return { message: newMessage, conversation };
  }

  async sendGroupMessage(data) {
    const { groupId, senderId, content } = data;

    const group = await Conversation.findById(groupId);
    if (!group || !group.isGroupChat) {
      throw new Error('Group chat not found');
    }

    if (!group.participants.includes(senderId)) {
      throw new Error('You are not a participant of this group');
    }

    const newMessage = await Message.create({
      senderId,
      receiverId: groupId,
      content,
    });

    group.messages.push(newMessage._id);
    await group.save();

    return { message: newMessage, group };
  }

}

module.exports = MessageService;
