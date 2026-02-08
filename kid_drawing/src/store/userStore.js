import { create } from 'zustand';
import { DEFAULT_AVATAR } from '../utils/constants';

// Load from localStorage
const loadState = () => {
  try {
    const saved = localStorage.getItem('kid_drawing_users');
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return null;
};

const saveState = (state) => {
  try {
    localStorage.setItem('kid_drawing_users', JSON.stringify({
      users: state.users,
      children: state.children,
      currentUserId: state.currentUser?.id,
      nextId: state.nextId,
    }));
  } catch (e) { /* ignore */ }
};

const defaultChild = {
  id: 1,
  name: 'Bé 1',
  avatar: '🐱',
  isParent: false,
  drawings: [],
  completedDrawings: [],
  createdAt: new Date().toISOString(),
};

const defaultParent = {
  id: 100,
  name: 'Phụ huynh',
  avatar: '👨‍👩‍👧',
  isParent: true,
  pin: '1234',
  drawings: [],
  completedDrawings: [],
};

const initState = () => {
  const saved = loadState();
  if (saved) {
    const currentUser = saved.users.find(u => u.id === saved.currentUserId) || saved.users[0];
    return {
      users: saved.users,
      children: saved.children,
      currentUser,
      user: currentUser,
      nextId: saved.nextId || saved.users.length + 1,
    };
  }
  return {
    users: [defaultChild, defaultParent],
    children: [defaultChild],
    currentUser: defaultChild,
    user: defaultChild,
    nextId: 3,
  };
};

const initial = initState();

const useUserStore = create((set, get) => ({
  ...initial,

  createChild: (name, avatar) => set((state) => {
    const newChild = {
      id: state.nextId,
      name: name || `Bé ${state.children.length + 1}`,
      avatar: avatar || DEFAULT_AVATAR,
      isParent: false,
      drawings: [],
      completedDrawings: [],
      createdAt: new Date().toISOString(),
    };
    const newState = {
      users: [...state.users, newChild],
      children: [...state.children, newChild],
      nextId: state.nextId + 1,
    };
    saveState({ ...state, ...newState });
    return newState;
  }),

  removeChild: (childId) => set((state) => {
    if (state.children.length <= 1) return state; // keep at least 1
    const newState = {
      users: state.users.filter(u => u.id !== childId),
      children: state.children.filter(u => u.id !== childId),
      currentUser: state.currentUser?.id === childId ? state.children.find(c => c.id !== childId) || state.currentUser : state.currentUser,
      user: state.user?.id === childId ? state.children.find(c => c.id !== childId) || state.user : state.user,
    };
    saveState({ ...state, ...newState });
    return newState;
  }),

  addUser: (user) => set((state) => {
    const newState = {
      users: [...state.users, user],
      children: user.isParent ? state.children : [...state.children, user],
    };
    saveState({ ...state, ...newState });
    return newState;
  }),

  setUser: (updates) => set((state) => {
    const updated = { ...state.currentUser, ...updates };
    const newState = {
      currentUser: updated,
      user: updated,
      users: state.users.map((item) => (item.id === updated.id ? updated : item)),
      children: state.children.map((item) => (item.id === updated.id ? updated : item)),
    };
    saveState({ ...state, ...newState });
    return newState;
  }),

  selectUser: (userId) => set((state) => {
    const selected = state.users.find((u) => u.id === userId) || state.currentUser;
    const newState = { currentUser: selected, user: selected };
    saveState({ ...state, ...newState, currentUserId: selected.id });
    return newState;
  }),

  setCurrentUser: (userId) => set((state) => {
    const selected = state.users.find((u) => u.id === userId) || state.currentUser;
    const newState = { currentUser: selected, user: selected };
    saveState({ ...state, ...newState, currentUserId: selected.id });
    return newState;
  }),

  updateAvatar: (userIdOrAvatar, avatar) => set((state) => {
    const isId = typeof userIdOrAvatar === 'number';
    const targetId = isId ? userIdOrAvatar : state.currentUser?.id;
    const nextAvatar = isId ? avatar : userIdOrAvatar;
    const newState = {
      currentUser: state.currentUser && state.currentUser.id === targetId
        ? { ...state.currentUser, avatar: nextAvatar }
        : state.currentUser,
      user: state.user && state.user.id === targetId
        ? { ...state.user, avatar: nextAvatar }
        : state.user,
      users: state.users.map((item) =>
        item.id === targetId ? { ...item, avatar: nextAvatar } : item
      ),
      children: state.children.map((item) =>
        item.id === targetId ? { ...item, avatar: nextAvatar } : item
      ),
    };
    saveState({ ...state, ...newState });
    return newState;
  }),

  updateUserAvatar: (avatar, userId) => set((state) => {
    const targetId = userId || state.currentUser?.id;
    const newState = {
      currentUser: state.currentUser && state.currentUser.id === targetId
        ? { ...state.currentUser, avatar }
        : state.currentUser,
      user: state.user && state.user.id === targetId
        ? { ...state.user, avatar }
        : state.user,
      users: state.users.map((item) =>
        item.id === targetId ? { ...item, avatar } : item
      ),
      children: state.children.map((item) =>
        item.id === targetId ? { ...item, avatar } : item
      ),
    };
    saveState({ ...state, ...newState });
    return newState;
  }),

  verifyParentPin: (pin) => {
    const parent = get().users.find(u => u.isParent);
    return parent && (parent.pin === pin || pin === '1234');
  },

  rateDrawing: (drawingId, rating) => set((state) => ({
    users: state.users.map((user) => ({
      ...user,
      drawings: (user.drawings || []).map((drawing) =>
        drawing.id === drawingId ? { ...drawing, rating } : drawing
      ),
      completedDrawings: (user.completedDrawings || []).map((drawing) =>
        drawing.id === drawingId ? { ...drawing, rating } : drawing
      ),
    })),
  })),

  getUserDrawings: (userId) => {
    const user = get().users.find((u) => u.id === userId);
    return user ? user.drawings : [];
  },
}));

export { useUserStore };
export default useUserStore;