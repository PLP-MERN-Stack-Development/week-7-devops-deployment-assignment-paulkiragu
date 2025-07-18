const Message = require("../models/Message");
const User = require("../models/User");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    // Join Room
    socket.on("joinRoom", async ({ username, roomId }) => {
      try {
        const user = await User.findOneAndUpdate(
          { username },
          { socketId: socket.id, isOnline: true },
          { new: true }
        );

        socket.join(roomId);
        console.log(`🟢 ${username} joined room ${roomId}`);
        io.to(roomId).emit("userJoined", { user, roomId });
      } catch (err) {
        console.error("❌ Error joining room:", err.message);
      }
    });

    // Typing indicators
    socket.on("typing", (username) => {
      socket.broadcast.emit("typing", username);
    });

    socket.on("stopTyping", () => {
      socket.broadcast.emit("stopTyping");
    });

    // ✅ Public messages 
    socket.on("sendMessage", async ({ content, roomId, sender, imageUrl }) => {
      try {
        const message = await Message.create({
          content,
          room: roomId,
          sender,
          imageUrl: imageUrl || null, 
        });

        const populatedMessage = await message.populate("sender", "username");

        console.log("📩 Room message:", populatedMessage.content || "[Image]", "from", populatedMessage.sender.username);
        io.to(roomId).emit("newMessage", populatedMessage);
      } catch (error) {
        console.error("❌ Error saving room message:", error.message);
      }
    });

    // ✅ Private messages 
    socket.on("sendPrivateMessage", async ({ content, senderId, recipientId, imageUrl }) => {
      try {
        const message = await Message.create({
          sender: senderId,
          recipient: recipientId,
          content,
          imageUrl: imageUrl || null,
        });

        const populatedMessage = await message.populate("sender", "username");

        const recipientUser = await User.findById(recipientId);
        const recipientSocket = recipientUser?.socketId;

        if (recipientSocket) {
          io.to(recipientSocket).emit("privateMessage", populatedMessage);
        }

        socket.emit("privateMessage", populatedMessage);
      } catch (err) {
        console.error("❌ Error sending private message:", err.message);
      }
    });

    // Disconnect handling
    socket.on("disconnect", async () => {
      try {
        const user = await User.findOneAndUpdate(
          { socketId: socket.id },
          { isOnline: false, socketId: null },
          { new: true }
        );

        if (user) {
          console.log(`🔴 ${user.username} disconnected`);
          const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
          rooms.forEach((roomId) => {
            io.to(roomId).emit("userLeft", { user, roomId });
          });
        }
      } catch (err) {
        console.error("❌ Error on disconnect:", err.message);
      }
    });
  });
};
