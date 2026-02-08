import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  addUser,
  createRoom,
  deleteUser,
  initDatabase,
  sendMessage,
  subscribeToMessages,
  subscribeToRooms,
  subscribeToUsers,
  updateUser
} from "./realtimeDb";


const EMOJIS = ["😀", "😃", "😄", "😍", "😎", "🥰", "😘", "🥳", "🎉", "🧸", "🦊", "🦁", "🦄"];
const AVATARS = ["👦", "👧", "🧒", "🧑", "🧓", "👴", "👵", "🧕", "🧖", "🦸", "🦹", "👼", "🐶", "🐱", "🐹", "🦁"];

const playTone = (frequency = 440, duration = 120) => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.12;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  setTimeout(() => {
    oscillator.stop();
    ctx.close();
  }, duration);
};

const getRoomTitle = (room, users, currentUserId) => {
  if (!room?.members?.length) return "Phong";
  const otherIds = room.members.filter((id) => id !== currentUserId);
  const names = otherIds
    .map((id) => users.find((u) => u.id === id)?.name || "Ban be")
    .join(", ");
  return names || "Phong chung";
};

const isBlocked = (user) => user?.status === "blocked";

export default function App() {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(
    localStorage.getItem("kid_chat_user") || ""
  );
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [formState, setFormState] = useState({
    id: "",
    name: "",
    type: "child",
    avatar: AVATARS[0],
    status: "active"
  });
  const [startChatUserId, setStartChatUserId] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    initDatabase();
    const offUsers = subscribeToUsers(setUsers);
    const offRooms = subscribeToRooms(setRooms);
    return () => {
      offUsers();
      offRooms();
    };
  }, []);

  useEffect(() => {
    if (!selectedRoomId) {
      setMessages([]);
      return;
    }
    const offMessages = subscribeToMessages(selectedRoomId, setMessages);
    return () => offMessages();
  }, [selectedRoomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) || null,
    [users, currentUserId]
  );

  const visibleRooms = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.type === "parent") return rooms;
    return rooms.filter((room) => room.members?.includes(currentUser.id));
  }, [rooms, currentUser]);

  const selectableUsers = useMemo(
    () => users.filter((u) => u.id !== currentUserId && u.status !== "blocked"),
    [users, currentUserId]
  );

  const handleLogin = (userId) => {
    setCurrentUserId(userId);
    localStorage.setItem("kid_chat_user", userId);
  };

  const handleLogout = () => {
    setCurrentUserId("");
    localStorage.removeItem("kid_chat_user");
    setSelectedRoomId("");
  };

  const handleStartChat = async () => {
    if (!currentUser || !startChatUserId) return;
    const existing = rooms.find(
      (room) =>
        room.members?.length === 2 &&
        room.members.includes(currentUser.id) &&
        room.members.includes(startChatUserId)
    );
    const room = existing || (await createRoom([currentUser.id, startChatUserId]));
    setSelectedRoomId(room.id);
    setStartChatUserId("");
  };

  const handleSendMessage = async (payload) => {
    if (!currentUser || !selectedRoomId) return;
    if (isBlocked(currentUser)) return;
    await sendMessage(selectedRoomId, {
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      ...payload
    });
    playTone(520, 140);
  };

  const handleSubmitText = async (event) => {
    event.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    await handleSendMessage({ type: "text", text: trimmed });
    setChatInput("");
  };

  const handleEmoji = (emoji) => {
    handleSendMessage({ type: "emoji", emoji });
  };

  const handleImagePick = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      await handleSendMessage({ type: "image", imageUrl: reader.result });
      setImageUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUser = async () => {
    if (!formState.name.trim()) return;
    if (formState.id) {
      await updateUser(formState.id, {
        name: formState.name,
        type: formState.type,
        avatar: formState.avatar,
        status: formState.status
      });
    } else {
      await addUser({
        name: formState.name,
        type: formState.type,
        avatar: formState.avatar,
        status: formState.status
      });
    }
    setFormState({ id: "", name: "", type: "child", avatar: AVATARS[0], status: "active" });
  };

  const handleEditUser = (user) => {
    setFormState({
      id: user.id,
      name: user.name,
      type: user.type,
      avatar: user.avatar,
      status: user.status || "active"
    });
  };

  const handleToggleBlock = async (user) => {
    await updateUser(user.id, { status: user.status === "blocked" ? "active" : "blocked" });
  };

  if (!currentUser) {
    return (
      <div className="app login">
        <div className="login-card">
          <h1>Kid Chat</h1>
          <p>Chon tai khoan de bat dau</p>
          <div className="login-grid">
            {users.map((user) => (
              <button
                key={user.id}
                className={`login-user ${user.status === "blocked" ? "blocked" : ""}`}
                disabled={user.status === "blocked"}
                onClick={() => handleLogin(user.id)}
              >
                <span className="avatar">{user.avatar}</span>
                <span className="name">{user.name}</span>
                <span className="role">{user.type === "parent" ? "Phu huynh" : "Tre em"}</span>
                {user.status === "blocked" && <span className="tag">Bi khoa</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
          <span className="current-avatar">{currentUser.avatar}</span>
          <div>
            <h1>Kid Chat</h1>
            <p>Xin chao {currentUser.name}</p>
          </div>
        </div>
        <div className="top-actions">
          {currentUser.type === "parent" && (
            <div className="tabs">
              <button
                className={activeTab === "chat" ? "active" : ""}
                onClick={() => setActiveTab("chat")}
              >
                Chat
              </button>
              <button
                className={activeTab === "manage" ? "active" : ""}
                onClick={() => setActiveTab("manage")}
              >
                Quan ly
              </button>
            </div>
          )}
          <button className="ghost" onClick={handleLogout}>
            Dang xuat
          </button>
        </div>
      </header>

      <main className={`layout ${activeTab}`}>
        {sidebarOpen && window.innerWidth <= 900 && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h2>Phong chat</h2>
            <div className="start-chat">
              <select
                value={startChatUserId}
                onChange={(event) => setStartChatUserId(event.target.value)}
              >
                <option value="">Bat dau chat moi</option>
                {selectableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.type === "parent" ? "(Phu huynh)" : ""}
                  </option>
                ))}
              </select>
              <button onClick={handleStartChat}>Mo</button>
            </div>
          </div>
          <div className="room-list">
            {visibleRooms.length === 0 && <p className="empty">Chua co phong chat</p>}
            {visibleRooms
              .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0))
              .map((room) => (
                <button
                  key={room.id}
                  className={`room ${room.id === selectedRoomId ? "active" : ""}`}
                  onClick={() => {
                    setSelectedRoomId(room.id);
                    if (window.innerWidth <= 900) setSidebarOpen(false);
                  }}
                >
                  <span className="room-title">{getRoomTitle(room, users, currentUser.id)}</span>
                  <span className="room-sub">
                    {room.lastMessageText || "Chua co tin nhan"}
                  </span>
                </button>
              ))}
          </div>
        </aside>

        <section className="chat">
          {!selectedRoomId ? (
            <div className="chat-empty">
              <h2>Chon phong chat</h2>
              <p>Bat dau noi chuyen cung ban be hoac ba me.</p>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <button className="back-btn" onClick={() => setSidebarOpen(true)}>
                  ←
                </button>
                <div className="chat-header-info">
                  <h2>{getRoomTitle(rooms.find((r) => r.id === selectedRoomId), users, currentUser.id)}</h2>
                </div>
                {isBlocked(currentUser) && (
                  <span className="tag warn">Tai khoan bi khoa</span>
                )}
              </div>
              <div className="messages">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.senderId === currentUser.id ? "mine" : ""}`}
                  >
                    <div className="bubble">
                      {msg.senderId !== currentUser.id && (
                        <div className="meta">
                          <span className="avatar">{msg.senderAvatar}</span>
                          <span className="name">{msg.senderName}</span>
                        </div>
                      )}
                      {msg.type === "text" && <p>{msg.text}</p>}
                      {msg.type === "emoji" && <p className="emoji">{msg.emoji}</p>}
                      {msg.type === "image" && (
                        <img src={msg.imageUrl} alt="Hinh" />
                      )}
                      <div className="timestamp">
                        {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form className="chat-input" onSubmit={handleSubmitText}>
                <input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder={isBlocked(currentUser) ? "Tai khoan dang bi khoa" : "Nhap tin nhan"}
                  disabled={isBlocked(currentUser)}
                />
                <div className="emoji-row">
                  {EMOJIS.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      className="emoji-btn"
                      onClick={() => handleEmoji(emoji)}
                      disabled={isBlocked(currentUser)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="actions">
                  <button
                    type="button"
                    className="file-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isBlocked(currentUser) || imageUploading}
                  >
                    📎 {imageUploading ? "Dang gui..." : "Hinh"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImagePick}
                    disabled={isBlocked(currentUser) || imageUploading}
                    style={{ display: 'none' }}
                  />
                  <button type="submit" disabled={isBlocked(currentUser)} className="send-btn">
                    Gui ➤
                  </button>
                </div>
              </form>
            </>
          )}
        </section>

        {currentUser.type === "parent" && (
          <section className="manage">
            <h2>Quan ly tai khoan</h2>
            <div className="manage-grid">
              <div className="form-card">
                <h3>{formState.id ? "Sua tai khoan" : "Tao tai khoan"}</h3>
                <label>
                  Ten
                  <input
                    value={formState.name}
                    onChange={(event) => setFormState({ ...formState, name: event.target.value })}
                  />
                </label>
                <label>
                  Loai user
                  <select
                    value={formState.type}
                    onChange={(event) => setFormState({ ...formState, type: event.target.value })}
                  >
                    <option value="child">Tre em</option>
                    <option value="parent">Phu huynh</option>
                  </select>
                </label>
                <label>
                  Trang thai
                  <select
                    value={formState.status}
                    onChange={(event) => setFormState({ ...formState, status: event.target.value })}
                  >
                    <option value="active">Hoat dong</option>
                    <option value="blocked">Bi khoa</option>
                  </select>
                </label>
                <label>
                  Avatar
                  <div className="avatar-grid">
                    {AVATARS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        className={`avatar-btn ${formState.avatar === av ? "active" : ""}`}
                        onClick={() => setFormState({ ...formState, avatar: av })}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </label>
                <div className="form-actions">
                  <button onClick={handleSaveUser}>Luu</button>
                  <button
                    className="ghost"
                    onClick={() =>
                      setFormState({ id: "", name: "", type: "child", avatar: AVATARS[0], status: "active" })
                    }
                  >
                    Moi
                  </button>
                </div>
              </div>
              <div className="list-card">
                <h3>Danh sach tai khoan</h3>
                <div className="user-list">
                  {users.map((user) => (
                    <div key={user.id} className={`user-item ${user.status === "blocked" ? "blocked" : ""}`}>
                      <span className="avatar">{user.avatar}</span>
                      <div>
                        <strong>{user.name}</strong>
                        <span className="meta">{user.type === "parent" ? "Phu huynh" : "Tre em"}</span>
                      </div>
                      <div className="user-actions">
                        <button onClick={() => handleEditUser(user)}>Sua</button>
                        <button className="ghost" onClick={() => handleToggleBlock(user)}>
                          {user.status === "blocked" ? "Mo" : "Khoa"}
                        </button>
                        <button className="danger" onClick={() => deleteUser(user.id)}>
                          Xoa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
