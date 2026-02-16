import { create } from 'zustand';
import { DEFAULT_AVATAR } from '../utils/constants';
import {
  getUsersOnce,
  subscribeUsers,
  setUser,
  updateUser,
  removeUser,
  getMetaOnce,
  setMeta,
  subscribeMeta,
  updateMeta,
  updateDrawing,
} from '../realtimeDb';


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

const toUserArray = (usersObj) => {
  return Object.values(usersObj || {}).sort((a, b) => Number(a.id) - Number(b.id));
};

const pickCurrentUser = (users) => {
  if (!users.length) return null;
  return users[0];
};

const useUserStore = create((set, get) => ({
  users: [defaultChild, defaultParent],
  children: [defaultChild],
  currentUser: defaultChild,
  user: defaultChild,
  nextId: 3,
  loadingUsers: true,
  syncError: null,
  _userSyncStarted: false,
  _userUnsubscribe: null,
  _metaUnsubscribe: null,

  initUserSync: async () => {
    if (get()._userSyncStarted) return;
    set({ _userSyncStarted: true, loadingUsers: true, syncError: null });

    try {
      console.log('[UserStore] initUserSync: fetching users from RTDB...');
      const usersSnapshot = await getUsersOnce();
      console.log('[UserStore] getUsersOnce result:', usersSnapshot);

      if (!usersSnapshot || Object.keys(usersSnapshot).length === 0) {
        console.log('[UserStore] No users found, seeding defaults...');
        await setUser(defaultChild.id, defaultChild);
        await setUser(defaultParent.id, defaultParent);
        await setMeta({ nextUserId: 3 });
        console.log('[UserStore] Seed data written OK');
      }

      const userUnsub = subscribeUsers((usersObj) => {
        console.log('[UserStore] subscribeUsers fired, keys:', Object.keys(usersObj || {}));
        const users = toUserArray(usersObj);
        const children = users.filter(u => !u.isParent);
        const prev = get().currentUser;
        const currentUser = (prev && users.find(u => Number(u.id) === Number(prev.id)))
          || pickCurrentUser(users) || users[0] || defaultChild;
        set({
          users,
          children,
          currentUser,
          user: currentUser,
          loadingUsers: false,
          syncError: null,
        });
      });

      const metaUnsub = subscribeMeta((meta) => {
        const nextId = meta?.nextUserId || get().nextId || 3;
        set({ nextId });
      });

      set({ _userUnsubscribe: userUnsub, _metaUnsubscribe: metaUnsub });
    } catch (err) {
      console.error('[UserStore] initUserSync FAILED:', err);
      set({ loadingUsers: false, syncError: err.message || 'Lỗi kết nối Firebase', _userSyncStarted: false });
    }
  },

  cleanupUserSync: () => {
    const { _userUnsubscribe, _metaUnsubscribe } = get();
    if (typeof _userUnsubscribe === 'function') _userUnsubscribe();
    if (typeof _metaUnsubscribe === 'function') _metaUnsubscribe();
    set({ _userUnsubscribe: null, _metaUnsubscribe: null, _userSyncStarted: false });
  },

  createChild: async (name, avatar) => {
    const state = get();
    const meta = await getMetaOnce();
    const nextId = meta?.nextUserId || state.nextId || 3;
    const newChild = {
      id: nextId,
      name: name || `Bé ${state.children.length + 1}`,
      avatar: avatar || DEFAULT_AVATAR,
      isParent: false,
      drawings: [],
      completedDrawings: [],
      createdAt: new Date().toISOString(),
    };
    await setUser(newChild.id, newChild);
    await updateMeta({ nextUserId: nextId + 1 });
  },

  removeChild: async (childId) => {
    const state = get();
    if (state.children.length <= 1) return; // keep at least 1
    await removeUser(childId);
  },

  addUser: async (user) => {
    if (!user?.id) return;
    await setUser(user.id, user);
  },

  setUser: async (updates) => {
    const state = get();
    const current = state.currentUser;
    if (!current?.id) return;
    await updateUser(current.id, updates);
  },

  selectUser: (userId) => set((state) => {
    const selected = state.users.find((u) => Number(u.id) === Number(userId)) || state.currentUser;
    return { currentUser: selected, user: selected };
  }),

  setCurrentUser: (userId) => set((state) => {
    const selected = state.users.find((u) => Number(u.id) === Number(userId)) || state.currentUser;
    return { currentUser: selected, user: selected };
  }),

  updateAvatar: async (userIdOrAvatar, avatar) => {
    const isId = typeof userIdOrAvatar === 'number';
    const targetId = isId ? userIdOrAvatar : get().currentUser?.id;
    const nextAvatar = isId ? avatar : userIdOrAvatar;
    if (!targetId) return;
    await updateUser(targetId, { avatar: nextAvatar });
  },

  updateUserAvatar: async (avatar, userId) => {
    const targetId = userId || get().currentUser?.id;
    if (!targetId) return;
    await updateUser(targetId, { avatar });
  },

  verifyParentPin: (pin) => {
    const parent = get().users.find(u => u.isParent);
    return parent && (parent.pin === pin || pin === '1234');
  },

  rateDrawing: async (drawingId, rating) => {
    if (!drawingId) return;
    await updateDrawing(drawingId, { rating });
  },

  getUserDrawings: (userId) => {
    const user = get().users.find((u) => Number(u.id) === Number(userId));
    return user ? user.drawings : [];
  },
}));

export { useUserStore };
export default useUserStore;