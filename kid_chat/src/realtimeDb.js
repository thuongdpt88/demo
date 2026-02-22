import { db } from "./firebase";
import { get, onValue, push, ref, remove, set, update } from "firebase/database";

const ROOT = 'kid_chat';

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
  const usersSnap = await get(ref(db, `${ROOT}/users`));
  if (!usersSnap.exists()) {
    const usersObj = {};
    DEFAULT_USERS.forEach((u) => {
      usersObj[u.id] = { ...u, createdAt: Date.now() };
    });
    await set(ref(db, `${ROOT}/users`), usersObj);
  }
};

export const subscribeToUsers = (callback) =>
  onValue(ref(db, `${ROOT}/users`), (snap) => callback(objectToArray(snap.val())));

export const subscribeToRooms = (callback) =>
  onValue(ref(db, `${ROOT}/rooms`), (snap) => callback(objectToArray(snap.val())));

export const subscribeToMessages = (roomId, callback) =>
  onValue(ref(db, `${ROOT}/rooms/${roomId}/messages`), (snap) =>
    callback(objectToArray(snap.val()).sort((a, b) => a.createdAt - b.createdAt))
  );

export const addUser = async (user) => {
  const id = user.id || `u${Date.now()}`;
  const newUser = { ...user, id, createdAt: Date.now(), status: user.status || "active" };
  await set(ref(db, `${ROOT}/users/${id}`), newUser);
  return newUser;
};

export const updateUser = async (id, updates) => {
  await update(ref(db, `${ROOT}/users/${id}`), updates);
};

export const deleteUser = async (id) => {
  await remove(ref(db, `${ROOT}/users/${id}`));
};

export const createRoom = async (members) => {
  const roomRef = push(ref(db, `${ROOT}/rooms`));
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
  const msgRef = push(ref(db, `${ROOT}/rooms/${roomId}/messages`));
  const payload = {
    id: msgRef.key,
    createdAt: Date.now(),
    ...message
  };
  await set(msgRef, payload);
  await update(ref(db, `${ROOT}/rooms/${roomId}`), {
    lastMessageAt: payload.createdAt,
    lastMessageText: payload.type === "image" ? "[Hinh]" : payload.type === "audio" ? "🎤 Ghi am" : payload.text || payload.emoji || ""
  });
  return payload;
};
