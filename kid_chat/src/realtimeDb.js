import { db } from "./firebase";
import { get, onValue, push, ref, remove, set, update } from "firebase/database";

const DEFAULT_USERS = [
  { id: "parent_01", name: "Ba Me", type: "parent", avatar: "👨‍👩‍👧", status: "active" },
  { id: "child_01", name: "Be Bi", type: "child", avatar: "👦", status: "active" },
  { id: "child_02", name: "Be Bo", type: "child", avatar: "🧒", status: "active" }
];

const objectToArray = (obj) => {
  if (!obj) return [];
  return Object.keys(obj).map((key) => ({ ...obj[key], id: key }));
};

export const initDatabase = async () => {
  const usersSnap = await get(ref(db, "users"));
  if (!usersSnap.exists()) {
    const usersObj = {};
    DEFAULT_USERS.forEach((u) => {
      usersObj[u.id] = { ...u, createdAt: Date.now() };
    });
    await set(ref(db, "users"), usersObj);
  }
};

export const subscribeToUsers = (callback) =>
  onValue(ref(db, "users"), (snap) => callback(objectToArray(snap.val())));

export const subscribeToRooms = (callback) =>
  onValue(ref(db, "rooms"), (snap) => callback(objectToArray(snap.val())));

export const subscribeToMessages = (roomId, callback) =>
  onValue(ref(db, `rooms/${roomId}/messages`), (snap) =>
    callback(objectToArray(snap.val()).sort((a, b) => a.createdAt - b.createdAt))
  );

export const addUser = async (user) => {
  const id = user.id || `u${Date.now()}`;
  const newUser = { ...user, id, createdAt: Date.now(), status: user.status || "active" };
  await set(ref(db, `users/${id}`), newUser);
  return newUser;
};

export const updateUser = async (id, updates) => {
  await update(ref(db, `users/${id}`), updates);
};

export const deleteUser = async (id) => {
  await remove(ref(db, `users/${id}`));
};

export const createRoom = async (members) => {
  const roomRef = push(ref(db, "rooms"));
  const room = {
    id: roomRef.key,
    members,
    createdAt: Date.now(),
    lastMessageAt: 0,
    lastMessageText: ""
  };
  await set(roomRef, room);
  return room;
};

export const sendMessage = async (roomId, message) => {
  const msgRef = push(ref(db, `rooms/${roomId}/messages`));
  const payload = {
    id: msgRef.key,
    createdAt: Date.now(),
    ...message
  };
  await set(msgRef, payload);
  await update(ref(db, `rooms/${roomId}`), {
    lastMessageAt: payload.createdAt,
    lastMessageText: payload.type === "image" ? "[Hinh]" : payload.text || payload.emoji || ""
  });
  return payload;
};
