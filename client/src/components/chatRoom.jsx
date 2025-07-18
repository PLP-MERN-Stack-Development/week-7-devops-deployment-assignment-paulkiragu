import { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ChatRoom({ room, messages, setMessages, user, socket }) {
  const [chat, setChat] = useState("");
  const [image, setImage] = useState(null);
  const [typingUser, setTypingUser] = useState("");
  const msgRef = useRef(null);

  useEffect(() => {
    // Request permission on initial load
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);

      const isFromOtherUser = msg?.sender?._id !== user._id;
      const tabNotFocused = document.visibilityState !== "visible";

      if (
        "Notification" in window &&
        Notification.permission === "granted" &&
        isFromOtherUser &&
        tabNotFocused
      ) {
        new Notification(`New message from ${msg.sender.username}`, {
          body: msg.content || "📷 Sent an image",
          icon: "/chat-icon.png", 
        });
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("typing", (username) => setTypingUser(username));
    socket.on("stopTyping", () => setTypingUser(""));

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [socket, setMessages, user._id]);

  useEffect(() => {
    if (msgRef.current) {
      msgRef.current.scrollTop = msgRef.current.scrollHeight;
    }
  }, [messages]);

  const handleTyping = () => {
    socket.emit("typing", user.username);
    setTimeout(() => socket.emit("stopTyping"), 1000);
  };

  const handleSend = async () => {
    if (!chat.trim() && !image) return;

    let imageUrl = "";

    if (image) {
      const formData = new FormData();
      formData.append("image", image);

      try {
        const res = await axios.post("http://localhost:5001/api/upload", formData);
        imageUrl = res.data.imageUrl;
      } catch (err) {
        console.error("❌ Image upload failed:", err.message);
        toast.error("Image upload failed");
        return;
      }
    }

    socket.emit("sendMessage", {
      content: chat,
      roomId: room._id,
      sender: user._id,
      imageUrl,
    });

    toast.success("Message sent ✅");
    setChat("");
    setImage(null);
  };

  return (
    <div>
      <h2 className="text-2xl mb-2">{room.name}</h2>

      <div className="h-64 overflow-y-auto border mb-2 bg-gray-50 p-2" ref={msgRef}>
        {messages.map((msg, i) => (
          <div key={i} className="mb-2">
            <strong>{msg?.sender?.username}:</strong>{" "}
            {msg.content && <span>{msg.content}</span>}
            {msg.imageUrl && (
              <div>
                <img
                  src={`http://localhost:5001${msg.imageUrl}`}
                  alt="shared"
                  className="mt-1 max-w-xs rounded shadow"
                />
              </div>
            )}
              <span className="text-xs text-gray-500 ml-2">
      {msg.createdAt && new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })}
    </span>
          </div>
        ))}
      </div>

      <div className="mb-2 text-sm text-gray-600">
        {typingUser && `${typingUser} is typing...`}
      </div>

      <div className="flex gap-2 mb-2 items-center">
        <input
          className="flex-1 p-2 border rounded"
          value={chat}
          onChange={(e) => setChat(e.target.value)}
          onKeyDown={handleTyping}
          placeholder="Write your message..."
        />

  
        <input
          type="file"
          id="imageUpload"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="hidden"
        />

        
        <label
          htmlFor="imageUpload"
          className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer text-sm"
        >
          Choose File
        </label>

        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleSend}
        >
          Send
        </button>
      </div>

      {image && (
        <p className="text-sm text-blue-600">Selected: {image.name}</p>
      )}
    </div>
  );
}
