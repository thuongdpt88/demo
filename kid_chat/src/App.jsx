import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const EMOJIS = [
  "😀", "😃", "😄", "😁", "😆", "😂", "🤣", "😍", "🥰", "😘", "😗", "😊",
  "😎", "🤩", "🥳", "😇", "🤗", "🤭", "😋", "😜", "😝", "🤪", "😏", "🤤",
  "🙈", "🙉", "🙊", "🐵", "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
  "🐨", "🦁", "🐯", "🐸", "🐧", "🐦", "🦄", "🐝", "🦋", "🐢", "🐙", "🐳",
  "🌈", "⭐", "🌟", "✨", "💫", "🔥", "💖", "💕", "💗", "💝", "💘", "❤️",
  "🎉", "🎊", "🎈", "🎁", "🎀", "🧸", "🎮", "🎯", "⚽", "🏀", "🎸", "🎵",
  "🍕", "🍔", "🍟", "🍦", "🍩", "🍪", "🎂", "🧁", "🍫", "🍭", "🍬", "🥤",
  "👍", "👏", "🙌", "🤝", "✌️", "🤞", "👋", "💪", "🦸", "🦹", "👼", "🧚"
];
const AVATARS = [
  "👦", "👧", "🧒", "🧑", "👨", "👩", "🧓", "👴", "👵",
  "👶", "🧒", "👱", "👸", "🤴", "🧕", "🧖", "🦸", "🦹", "👼", "🧚",
  "🧜", "🧝", "🧙", "🧛", "🥷", "🧑‍🚀", "👨‍🎓", "👩‍🎓", "👨‍🍳", "👩‍🍳",
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🦁",
  "🐯", "🐸", "🐵", "🐧", "🐦", "🦄", "🐝", "🦋", "🐢", "🐙",
  "🐳", "🐬", "🦈", "🐘", "🦒", "🐿️", "🦔", "🦩", "🦜", "🐲",
  "⭐", "🌈", "🔥", "💎", "🌸", "🌻", "🎈", "🧸", "🎮", "⚽"
];

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

const getRoomInfo = (room, users, currentUserId) => {
  if (!room?.members?.length) return { avatar: "💬", title: "Phong" };
  const otherIds = room.members.filter((id) => id !== currentUserId);
  const others = otherIds.map((id) => users.find((u) => u.id === id)).filter(Boolean);
  if (others.length === 1) return { avatar: others[0]?.avatar || "👤", title: others[0]?.name || "Ban be" };
  const names = others.map((u) => u.name || "Ban be").join(", ");
  return { avatar: "👥", title: names || "Phong chung" };
};

const isBlocked = (user) => user?.status === "blocked";

const generateMathPuzzle = () => {
  const ops = ["+", "-", "×"];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b, answer;
  switch (op) {
    case "+":
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * 50) + 10;
      answer = a + b;
      break;
    case "-":
      a = Math.floor(Math.random() * 50) + 30;
      b = Math.floor(Math.random() * 30) + 1;
      answer = a - b;
      break;
    case "×":
      a = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 12) + 2;
      answer = a * b;
      break;
    default:
      a = 10; b = 5; answer = 15;
  }
  return { question: `${a} ${op} ${b} = ?`, answer };
};

export default function App() {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(
    localStorage.getItem("kid_chat_user") || ""
  );
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [showManagePanel, setShowManagePanel] = useState(false);
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [mathPuzzle, setMathPuzzle] = useState(null);
  const [mathAnswer, setMathAnswer] = useState("");
  const [mathError, setMathError] = useState("");
  const [pendingParentId, setPendingParentId] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const fileInputRef = useRef(null);
  const chatInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

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
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
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

  const selectedRoomInfo = useMemo(() => {
    if (!selectedRoomId) return { avatar: "💬", title: "" };
    const room = rooms.find((r) => r.id === selectedRoomId);
    return getRoomInfo(room, users, currentUserId);
  }, [rooms, users, selectedRoomId, currentUserId]);

  const handleLogin = useCallback((userId) => {
    const user = users.find((u) => u.id === userId);
    if (user?.type === "parent") {
      setPendingParentId(userId);
      setMathPuzzle(generateMathPuzzle());
      setMathAnswer("");
      setMathError("");
      return;
    }
    setCurrentUserId(userId);
    localStorage.setItem("kid_chat_user", userId);
  }, [users]);

  const handleMathSubmit = (e) => {
    e.preventDefault();
    if (!mathPuzzle) return;
    const parsed = parseInt(mathAnswer, 10);
    if (parsed === mathPuzzle.answer) {
      setCurrentUserId(pendingParentId);
      localStorage.setItem("kid_chat_user", pendingParentId);
      setMathPuzzle(null);
      setPendingParentId("");
      setMathAnswer("");
      setMathError("");
    } else {
      setMathError("Sai roi! Thu lai nhe 😅");
      setMathPuzzle(generateMathPuzzle());
      setMathAnswer("");
    }
  };

  const handleCloseMathPopup = () => {
    setMathPuzzle(null);
    setPendingParentId("");
    setMathAnswer("");
    setMathError("");
  };

  const handleLogout = () => {
    setCurrentUserId("");
    localStorage.removeItem("kid_chat_user");
    setSelectedRoomId("");
    setShowManagePanel(false);
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
    setChatInput((prev) => prev + emoji);
    chatInputRef.current?.focus();
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

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(recordingTimerRef.current);
        setRecordingTime(0);
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = async () => {
          await handleSendMessage({ type: "audio", audioUrl: reader.result });
        };
        reader.readAsDataURL(blob);
        setIsRecording(false);
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 59) {
            mediaRecorderRef.current?.stop();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Mic error:", err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
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
    setShowManagePanel(true);
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
                <span className="role">{user.type === "parent" ? "🔒 Phu huynh" : "Tre em"}</span>
                {user.status === "blocked" && <span className="tag blocked-tag">🔒 Bi khoa</span>}
                {user.status === "blocked" && <span className="unlock-hint">Nho phu huynh mo khoa</span>}
              </button>
            ))}
          </div>
        </div>
        {mathPuzzle && (
          <div className="math-overlay" onClick={handleCloseMathPopup}>
            <div className="math-popup" onClick={(e) => e.stopPropagation()}>
              <button className="math-close" onClick={handleCloseMathPopup}>✕</button>
              <div className="math-icon">🔢</div>
              <h2>Xac nhan phu huynh</h2>
              <p className="math-desc">Giai bai toan de dang nhap:</p>
              <div className="math-question">{mathPuzzle.question}</div>
              {mathError && <p className="math-error">{mathError}</p>}
              <form onSubmit={handleMathSubmit}>
                <input
                  type="number"
                  className="math-input"
                  value={mathAnswer}
                  onChange={(e) => setMathAnswer(e.target.value)}
                  placeholder="Nhap dap an"
                  autoFocus
                />
                <button type="submit" className="math-submit">Xac nhan</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <span className="current-avatar">{currentUser.avatar}</span>
          <div>
            <h1>Kid Chat</h1>
            <p>Xin chao {currentUser.name}</p>
          </div>
        </div>
        <div className="top-actions">
          <button className="ghost" onClick={handleLogout}>Dang xuat</button>
        </div>
      </header>

      <div className="main-wrapper">
        {sidebarOpen && isMobile && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <h2>Phong chat</h2>
            <div className="start-chat">
              <select
                value={startChatUserId}
                onChange={(e) => setStartChatUserId(e.target.value)}
              >
                <option value="">Bat dau chat moi</option>
                {selectableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.avatar} {user.name} {user.type === "parent" ? "(Phu huynh)" : ""}
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
              .map((room) => {
                const ri = getRoomInfo(room, users, currentUser.id);
                return (
                <button
                  key={room.id}
                  className={`room ${room.id === selectedRoomId && !showManagePanel ? "active" : ""}`}
                  onClick={() => {
                    setSelectedRoomId(room.id);
                    setShowManagePanel(false);
                    if (isMobile) setSidebarOpen(false);
                  }}
                >
                  <span className="room-avatar">{ri.avatar}</span>
                  <div className="room-text">
                    <span className="room-title">{ri.title}</span>
                    <span className="room-sub">{room.lastMessageText || "Chua co tin nhan"}</span>
                  </div>
                </button>
                );
              })}
          </div>
          {currentUser.type === "parent" && (
            <>
              <div className="sidebar-footer">
                <button
                  className={`manage-btn ${showManagePanel ? "active" : ""}`}
                  onClick={() => setShowManagePanel(!showManagePanel)}
                >
                  ⚙️ Quan ly tai khoan
                </button>
              </div>
              {showManagePanel && (
                <div className="sidebar-manage">
                  <div className="sidebar-manage-inner">
                    <div className="form-card">
                      <h3>{formState.id ? "Sua tai khoan" : "Tao tai khoan"}</h3>
                      <label>Ten
                        <input value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })} />
                      </label>
                      <label>Loai
                        <select value={formState.type} onChange={(e) => setFormState({ ...formState, type: e.target.value })}>
                          <option value="child">Tre em</option>
                          <option value="parent">Phu huynh</option>
                        </select>
                      </label>
                      <label>Trang thai
                        <select value={formState.status} onChange={(e) => setFormState({ ...formState, status: e.target.value })}>
                          <option value="active">Hoat dong</option>
                          <option value="blocked">Bi khoa</option>
                        </select>
                      </label>
                      <label>Avatar
                        <button type="button" className="avatar-pick-trigger" onClick={() => setShowAvatarPicker(true)}>
                          <span className="avatar-pick-preview">{formState.avatar}</span>
                          <span>Chon avatar</span>
                        </button>
                      </label>
                      <div className="form-actions">
                        <button onClick={handleSaveUser}>Luu</button>
                        <button className="ghost" onClick={() => setFormState({ id: "", name: "", type: "child", avatar: AVATARS[0], status: "active" })}>Moi</button>
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
                              <button className={user.status === "blocked" ? "unlock" : "ghost"} onClick={() => handleToggleBlock(user)}>{user.status === "blocked" ? "🔓 Mo khoa" : "🔒 Khoa"}</button>
                              <button className="danger" onClick={() => deleteUser(user.id)}>Xoa</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
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
                <button className="back-btn" onClick={() => setSidebarOpen(true)}>←</button>
                <span className="chat-header-avatar">{selectedRoomInfo.avatar}</span>
                <div className="chat-header-info">
                  <h2>{selectedRoomInfo.title}</h2>
                </div>
                {isBlocked(currentUser) && <span className="tag warn">Tai khoan bi khoa</span>}
              </div>
              <div className="messages">
                {messages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.senderId === currentUser.id ? "mine" : ""}`}>
                    <div className="bubble">
                      {msg.senderId !== currentUser.id && (
                        <div className="msg-meta">
                          <span className="avatar">{msg.senderAvatar}</span>
                          <span className="name">{msg.senderName}</span>
                        </div>
                      )}
                      {msg.type === "text" && <p>{msg.text}</p>}
                      {msg.type === "emoji" && <p className="emoji">{msg.emoji}</p>}
                      {msg.type === "image" && <img src={msg.imageUrl} alt="Hinh" />}
                      {msg.type === "audio" && <audio controls src={msg.audioUrl} preload="metadata" />}
                      <div className="timestamp">
                        {new Date(msg.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form className="chat-input" onSubmit={handleSubmitText}>
                <div className="input-row">
                  <input
                    ref={chatInputRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={isBlocked(currentUser) ? "Tai khoan dang bi khoa" : "Nhap tin nhan"}
                    disabled={isBlocked(currentUser)}
                  />
                  <button type="button" className="emoji-toggle" onClick={() => setShowEmojiPicker(!showEmojiPicker)} disabled={isBlocked(currentUser)}>😊</button>
                </div>
                {showEmojiPicker && (
                  <div className="emoji-picker">
                    {EMOJIS.map((emoji) => (
                      <button type="button" key={emoji} className="emoji-btn" onClick={() => handleEmoji(emoji)} disabled={isBlocked(currentUser)}>{emoji}</button>
                    ))}
                  </div>
                )}
                <div className="actions">
                  <button type="button" className="file-btn" onClick={() => fileInputRef.current?.click()} disabled={isBlocked(currentUser) || imageUploading}>
                    📎 {imageUploading ? "Dang gui..." : "Hinh"}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImagePick} disabled={isBlocked(currentUser) || imageUploading} style={{ display: "none" }} />
                  <button
                    type="button"
                    className={`record-btn ${isRecording ? "recording" : ""}`}
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    disabled={isBlocked(currentUser)}
                  >
                    {isRecording ? `⏹ ${recordingTime}s` : "🎤"}
                  </button>
                  <button type="submit" disabled={isBlocked(currentUser)} className="send-btn">Gui ➤</button>
                </div>
              </form>
            </>
          )}
        </section>
      </div>
      {showAvatarPicker && (
        <div className="avatar-overlay" onClick={() => setShowAvatarPicker(false)}>
          <div className="avatar-popup" onClick={(e) => e.stopPropagation()}>
            <button className="avatar-popup-close" onClick={() => setShowAvatarPicker(false)}>✕</button>
            <h2>Chon Avatar</h2>
            <div className="avatar-popup-grid">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  className={`avatar-popup-btn ${formState.avatar === av ? "active" : ""}`}
                  onClick={() => {
                    setFormState({ ...formState, avatar: av });
                    setShowAvatarPicker(false);
                  }}
                >{av}</button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}