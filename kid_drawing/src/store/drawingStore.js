import { create } from 'zustand';
import {
    subscribeDrawings,
    setDrawing,
    updateDrawing,
    deleteDrawing,
} from '../realtimeDb';

const toDrawingArray = (drawingsObj) => {
    const list = Object.values(drawingsObj || {});
    return list.sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
    });
};

const useDrawingStore = create((set, get) => ({
    drawings: [],
    completedDrawings: [],
    currentDrawing: null,
    editingDrawingId: null,
    brushSize: 5,
    brushColor: '#000000',
    tool: 'brush',
    clearToken: 0,
    history: [],
    historyIndex: -1,
    canUndo: false,
    canRedo: false,
    loadingDrawings: true,
    syncError: null,
    _drawingSyncStarted: false,
    _drawingUnsubscribe: null,

    initDrawingSync: () => {
        if (get()._drawingSyncStarted) return;
        set({ _drawingSyncStarted: true, loadingDrawings: true, syncError: null });
        try {
            console.log('[DrawingStore] initDrawingSync: subscribing to RTDB...');
            const unsubscribe = subscribeDrawings((drawingsObj) => {
                console.log('[DrawingStore] subscribeDrawings fired, keys:', Object.keys(drawingsObj || {}));
                const completedDrawings = toDrawingArray(drawingsObj);
                set({ completedDrawings, loadingDrawings: false, syncError: null });
            });
            set({ _drawingUnsubscribe: unsubscribe });
        } catch (err) {
            console.error('[DrawingStore] initDrawingSync FAILED:', err);
            set({ loadingDrawings: false, syncError: err.message || 'Lỗi kết nối Firebase', _drawingSyncStarted: false });
        }
    },

    cleanupDrawingSync: () => {
        const { _drawingUnsubscribe } = get();
        if (typeof _drawingUnsubscribe === 'function') _drawingUnsubscribe();
        set({ _drawingUnsubscribe: null, _drawingSyncStarted: false });
    },

    addDrawing: (drawing) => set((state) => ({
        drawings: [...state.drawings, drawing],
        currentDrawing: drawing,
    })),
    addCompletedDrawing: async (drawing) => {
        if (!drawing?.id) return;
        await setDrawing(drawing.id, { ...drawing, completed: true });
    },
    saveDrawing: async (info = {}) => {
        const state = get();
        if (!state.currentDrawing) return;
        const { childId, childName, title } = info;
        if (state.editingDrawingId) {
            await updateDrawing(state.editingDrawingId, {
                imageUrl: state.currentDrawing.imageUrl,
                updatedAt: new Date().toISOString(),
            });
        } else {
            const newId = `draw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            const completed = {
                ...state.currentDrawing,
                completed: true,
                type: 'drawing',
                id: newId,
                title: title || state.currentDrawing.title || 'Bài vẽ',
                childId,
                childName: childName || 'Bé',
                createdAt: new Date().toISOString(),
            };
            await setDrawing(newId, completed);
            set({ editingDrawingId: newId });
        }
    },
    updateCompletedDrawing: async (id, updates) => {
        if (!id) return;
        await updateDrawing(id, { ...updates, updatedAt: new Date().toISOString() });
    },
    setEditingDrawing: (id) => set({ editingDrawingId: id }),
    clearEditingDrawing: () => set({ editingDrawingId: null, currentDrawing: null }),
    completeDrawing: async (drawingId) => {
        const state = get();
        const completedDrawing = state.drawings.find((d) => d.id === drawingId);
        if (!completedDrawing) return;
        await setDrawing(drawingId, { ...completedDrawing, completed: true });
        set({ drawings: state.drawings.filter((d) => d.id !== drawingId) });
    },
    rateDrawing: async (drawingId, rating) => {
        if (!drawingId) return;
        await updateDrawing(drawingId, { rating });
    },
    deleteDrawing: async (drawingId) => {
        if (!drawingId) return;
        await deleteDrawing(drawingId);
    },
    setCurrentDrawing: (drawing) => set({ currentDrawing: drawing }),
    resetCurrentDrawing: () => set({ currentDrawing: null }),
    clearDrawing: () => set({ currentDrawing: null }),
    clearCanvas: () => set({ clearToken: Date.now() }),
    setBrushSize: (size) => set({ brushSize: Number(size) }),
    setBrushColor: (color) => set({ brushColor: color }),
    setTool: (tool) => set({ tool }),
    undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex <= 0) {
            set({ canUndo: false, canRedo: history.length > 0 });
            return;
        }
        set({ historyIndex: historyIndex - 1, canUndo: historyIndex - 1 > 0, canRedo: true });
    },
    redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) {
            set({ canRedo: false, canUndo: history.length > 1 });
            return;
        }
        set({ historyIndex: historyIndex + 1, canRedo: historyIndex + 1 < history.length - 1, canUndo: true });
    },
}));

export { useDrawingStore };
export default useDrawingStore;