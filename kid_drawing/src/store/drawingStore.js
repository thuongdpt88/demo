import { create } from 'zustand';

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
    addDrawing: (drawing) => set((state) => ({
        drawings: [...state.drawings, drawing],
        currentDrawing: drawing,
    })),
    addCompletedDrawing: (drawing) => set((state) => ({
        completedDrawings: [...state.completedDrawings, { ...drawing, completed: true }],
    })),
    saveDrawing: (childInfo = {}) => {
        const state = get();
        if (!state.currentDrawing) return;
        const { childId, childName } = childInfo;
        if (state.editingDrawingId) {
            // Update existing drawing (replace old file)
            set({
                completedDrawings: state.completedDrawings.map(d =>
                    d.id === state.editingDrawingId
                        ? { ...d, imageUrl: state.currentDrawing.imageUrl, updatedAt: new Date().toISOString() }
                        : d
                ),
            });
        } else {
            // Create new drawing
            const newId = `draw-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            const completed = {
                ...state.currentDrawing,
                completed: true,
                type: 'drawing',
                id: newId,
                title: state.currentDrawing.title || 'Bài vẽ',
                childId,
                childName: childName || 'Bé',
                createdAt: new Date().toISOString(),
            };
            set({
                completedDrawings: [...state.completedDrawings, completed],
                editingDrawingId: newId,
            });
        }
    },
    updateCompletedDrawing: (id, updates) => set((state) => ({
        completedDrawings: state.completedDrawings.map(d =>
            d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
        ),
    })),
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
    rateDrawing: (drawingId, rating) => set((state) => ({
        drawings: state.drawings.map((drawing) =>
            drawing.id === drawingId ? { ...drawing, rating } : drawing
        ),
        completedDrawings: state.completedDrawings.map((drawing) =>
            drawing.id === drawingId ? { ...drawing, rating } : drawing
        ),
    })),
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