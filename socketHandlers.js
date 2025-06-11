const ConversationService = require('./services/conversationService');
const MessageService = require('./services/messageService');
const User = require('./models/user');
const Conversation = require('./models/conversation');
const Message = require('./models/message');
const NodeCache = require('node-cache');

// Initialize cache with 1 hour TTL
const chatHistoryCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

module.exports = (io) => {
  const conversationService = new ConversationService();
  const messageService = new MessageService();
  ioInstance = io;
  const activeUsers = new Map(); // Stores active user sockets and IDs

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join", async ({ userId }) => {
      try {
        socket.join(userId);

        const user = await User.findById(userId).select('username');
        if (!user) {
          throw new Error('User not found');
        }

        activeUsers.set(socket.id, { userId, username: user.username, socket });
        
        const activeUsersList = [...activeUsers.values()].map(({ userId, username }) => ({ userId, username }));
        io.emit("active_users", activeUsersList);
        console.log(`Socket: ${socket.id} User: ${userId}`);

        // Get chat history for the user with caching
        const cachedHistory = chatHistoryCache.get(userId);

        if (cachedHistory) {
          socket.emit("chat_history", cachedHistory);
        } else {
          // Get direct messages
          const directMessages = await Message.find({
            $or: [
              { senderId: userId },
              { receiverId: userId }
            ]
          }).sort({ createdAt: "asc" });

          // Get group conversations where user is a participant
          const groupConversations = await Conversation.find({
            participants: userId,
            isGroupChat: true
          }).populate({
            path: 'messages',
            options: { sort: { createdAt: 'asc' } }
          });

          // Extract messages from group conversations
          const groupMessages = groupConversations.flatMap(conv => 
            conv.messages.map(msg => ({
              ...msg.toObject(),
              isGroupMessage: true,
              groupId: conv._id,
              groupName: conv.groupName
            }))
          );

          // Combine and sort all messages
          const allMessages = [...directMessages, ...groupMessages].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );

          socket.emit("chat_history", allMessages);
          chatHistoryCache.set(userId, allMessages); // Update cache
        }


      } catch (error) {
        console.error("Error joining chat:", error);
      }
    });

 
    socket.on('sendMessage', async ({data}) => {
      try {
        const { message } = await messageService.sendMessage(data);

        const recipientSocket = [...activeUsers.values()].find(
          (user) => user.userId === data.receiverId
        )?.socket;

        if (recipientSocket) {
          recipientSocket.emit("newMessage", message);
        }

      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('sendGroupMessage', async ({data}) => {
      try {
        const { message: newMessage, group } = await messageService.sendGroupMessage(data);

        group.participants.forEach(participantId => {
          const userSocket = [...activeUsers.values()].find(user => user.userId === participantId.toString())?.socket;
          if (userSocket) {
            userSocket.emit('newGroupMessage', {
              groupId: group._id,
              senderId: newMessage.senderId,
              content: newMessage.content,
              timestamp: newMessage.createdAt,
            });
          }
        });
        console.log('Group message sent:', newMessage);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('createGroup', async ({data}) => {
      try {
        const group = await conversationService.createGroup(data);
        
        // Emit to all participants
        group.participants.forEach(participantId => {
          const userSocket = [...activeUsers.values()].find(user => user.userId === participantId.toString())?.socket;
          if (userSocket) {
            userSocket.emit('newGroup', {
              id: group._id,
              name: group.groupName,
              members: group.participants,
              admin: group.groupAdmin,
              photo: group.groupPhoto
            });
          }
        });
        console.log('Group created:', group);

      } catch (error) {
        console.error('Group creation error:', error);
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('addParticipants', async ({data}) => {
      try {
        const group = await conversationService.addParticipants(data);
        socket.emit('participantsAdded', { group });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('removeParticipants', async ({data}) => {
      try {
        const group = await conversationService.removeParticipants(data);
        socket.emit('participantsRemoved', { group });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('leaveGroup', async ({data}) => {
      try {
        const group = await conversationService.leaveGroup(data);
        socket.emit('leftGroup', { group });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);

      activeUsers.delete(socket.id);

      const activeUsersList = [...activeUsers.values()].map(({ userId, username }) => ({ userId, username }));
      io.emit("active_users", activeUsersList);
    });

  });
};
