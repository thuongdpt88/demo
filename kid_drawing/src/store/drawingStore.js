import { create } from 'zustand';

// ===== Persistence helpers =====
const loadCompletedDrawings = () => {
    try {
        const saved = localStorage.getItem('kid_drawing_completed');
        if (saved) return JSON.parse(saved);
    } catch (e) { /* ignore */ }
    return [];
};

const saveCompletedDrawings = (completedDrawings) => {
    try {
        localStorage.setItem('kid_drawing_completed', JSON.stringify(completedDrawings));
    } catch (e) { /* ignore */ }
};

const useDrawingStore = create((set, get) => ({
    drawings: [],
    completedDrawings: loadCompletedDrawings(),
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
    addDrawing: (drawing) => set((state) => ({
        drawings: [...state.drawings, drawing],
        currentDrawing: drawing,
    })),
    addCompletedDrawing: (drawing) => set((state) => {
        const next = [...state.completedDrawings, { ...drawing, completed: true }];
        saveCompletedDrawings(next);
        return { completedDrawings: next };
    }),
    saveDrawing: (info = {}) => {
        const state = get();
        if (!state.currentDrawing) return;
        const { childId, childName, title } = info;
        if (state.editingDrawingId) {
            // Update existing drawing (replace old file)
            const next = state.completedDrawings.map(d =>
                d.id === state.editingDrawingId
                    ? { ...d, imageUrl: state.currentDrawing.imageUrl, updatedAt: new Date().toISOString() }
                    : d
            );
            saveCompletedDrawings(next);
            set({ completedDrawings: next });
        } else {
            // Create new drawing
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
            const next = [...state.completedDrawings, completed];
            saveCompletedDrawings(next);
            set({
                completedDrawings: next,
                editingDrawingId: newId,
            });
        }
    },
    updateCompletedDrawing: (id, updates) => set((state) => {
        const next = state.completedDrawings.map(d =>
            d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
        );
        saveCompletedDrawings(next);
        return { completedDrawings: next };
    }),
    setEditingDrawing: (id) => set({ editingDrawingId: id }),
    clearEditingDrawing: () => set({ editingDrawingId: null, currentDrawing: null }),
    completeDrawing: (drawingId) => set((state) => {
        const completedDrawing = state.drawings.find((d) => d.id === drawingId);
        if (!completedDrawing) {
            return state;
        }
        return {
            completedDrawings: [...state.completedDrawings, { ...completedDrawing, completed: true }],
            drawings: state.drawings.filter((d) => d.id !== drawingId),
        };
    }),
    rateDrawing: (drawingId, rating) => set((state) => {
        const nextCompleted = state.completedDrawings.map((drawing) =>
            drawing.id === drawingId ? { ...drawing, rating } : drawing
        );
        saveCompletedDrawings(nextCompleted);
        return {
            drawings: state.drawings.map((drawing) =>
                drawing.id === drawingId ? { ...drawing, rating } : drawing
            ),
            completedDrawings: nextCompleted,
        };
    }),
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