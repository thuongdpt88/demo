import { db } from './firebase';
import { ref, get, set, update, remove, onValue } from 'firebase/database';

const ROOT = 'kid_drawing';

const usersRef = ref(db, `${ROOT}/users`);
const drawingsRef = ref(db, `${ROOT}/drawings`);
const metaRef = ref(db, `${ROOT}/meta`);

export const getUsersOnce = async () => {
    const snapshot = await get(usersRef);
    return snapshot.val() || {};
};

export const subscribeUsers = (callback) => {
    return onValue(usersRef, (snapshot) => {
        callback(snapshot.val() || {});
    });
};

export const setUser = async (userId, userData) => {
    await set(ref(db, `${ROOT}/users/${userId}`), userData);
};

export const updateUser = async (userId, updates) => {
    await update(ref(db, `${ROOT}/users/${userId}`), updates);
};

export const removeUser = async (userId) => {
    await remove(ref(db, `${ROOT}/users/${userId}`));
};

export const getDrawingsOnce = async () => {
    const snapshot = await get(drawingsRef);
    return snapshot.val() || {};
};

export const subscribeDrawings = (callback) => {
    return onValue(drawingsRef, (snapshot) => {
        callback(snapshot.val() || {});
    });
};

export const setDrawing = async (drawingId, drawingData) => {
    await set(ref(db, `${ROOT}/drawings/${drawingId}`), drawingData);
};

export const updateDrawing = async (drawingId, updatedData) => {
    await update(ref(db, `${ROOT}/drawings/${drawingId}`), updatedData);
};

export const deleteDrawing = async (drawingId) => {
    await remove(ref(db, `${ROOT}/drawings/${drawingId}`));
};

export const getMetaOnce = async () => {
    const snapshot = await get(metaRef);
    return snapshot.val() || {};
};

export const subscribeMeta = (callback) => {
    return onValue(metaRef, (snapshot) => {
        callback(snapshot.val() || {});
    });
};

export const setMeta = async (meta) => {
    await set(metaRef, meta);
};

export const updateMeta = async (updates) => {
    await update(metaRef, updates);
};