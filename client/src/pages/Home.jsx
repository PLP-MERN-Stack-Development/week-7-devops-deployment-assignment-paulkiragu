import { useEffect, useState } from "react";
import { getRooms, createRoom, getMessages, socket } from "../services/backend_connection";
import ChatRoom from "../components/chatRoom"

export default function Home({ user }) {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);


 useEffect(() => {
  fetchRooms();
  socket.connect();

  // 👥 Listen for user status updates
  socket.on("userJoined", ({ user }) => {
    setOnlineUsers((prev) => {
      const exists = prev.find((u) => u._id === user._id);
      return exists ? prev : [...prev, user];
    });
  });

  socket.on("userLeft", ({ user }) => {
    setOnlineUsers((prev) => prev.filter((u) => u._id !== user._id));
  });

  return () => {
    socket.disconnect();
    socket.off("userJoined");
    socket.off("userLeft");
  };
}, []);


  const fetchRooms = async () => {
    const res = await getRooms();
    setRooms(res.data);
  };

const handleJoinRoom = async (room) => {
  socket.emit("joinRoom", { username: user.username, roomId: room._id });

  setCurrentRoom(room);
  setMessages([]); // ✅ Clear messages before fetching new ones

  try {
    const res = await getMessages(room._id);
    setMessages(res.data); // ✅ Load only messages for selected room
  } catch (error) {
    console.error("Failed to fetch room messages:", error.message);
  }
};


  return (
    <div className="flex h-screen">
      <aside className="w-1/4 bg-gray-800 text-white p-4">
        <h2 className="text-lg mb-2">Rooms</h2> 
        <ul>
  {rooms.map((room) => {
    const usersInRoom = onlineUsers.filter((u) => u.roomId === room._id); 
    const isSomeoneOnline = usersInRoom.length > 0;

    return (
      <li key={room._id} className="mb-2 flex items-center gap-2">
        <button
          onClick={() => handleJoinRoom(room)}
          className="flex-1 bg-gray-700 p-2 rounded hover:bg-gray-600 text-white"
        >
          {room.name}
        </button>
        {isSomeoneOnline && <span className="text-green-400 text-xs">🟢</span>}
      </li>
    );
  })}
</ul>

      </aside>

      <main className="flex-1 p-4">
        {currentRoom ? (
          <ChatRoom
  room={currentRoom}
  messages={messages}
  setMessages={setMessages} 
  user={user}
  socket={socket}
/>

        ) : (
          <p>Select a room to join</p>
        )}
      </main>
    </div>
  );
}
