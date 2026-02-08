import { db } from './firebase'; // Import the Firebase database instance
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

// Function to add a new drawing
export const addDrawing = async (drawingData) => {
    try {
        const docRef = await addDoc(collection(db, 'drawings'), drawingData);
        return docRef.id;
    } catch (error) {
        console.error("Error adding drawing: ", error);
    }
};

// Function to get all drawings
export const getDrawings = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'drawings'));
        const drawings = [];
        querySnapshot.forEach((doc) => {
            drawings.push({ id: doc.id, ...doc.data() });
        });
        return drawings;
    } catch (error) {
        console.error("Error getting drawings: ", error);
    }
};

// Function to update a drawing
export const updateDrawing = async (drawingId, updatedData) => {
    try {
        const drawingRef = doc(db, 'drawings', drawingId);
        await updateDoc(drawingRef, updatedData);
    } catch (error) {
        console.error("Error updating drawing: ", error);
    }
};

// Function to delete a drawing
export const deleteDrawing = async (drawingId) => {
    try {
        const drawingRef = doc(db, 'drawings', drawingId);
        await deleteDoc(drawingRef);
    } catch (error) {
        console.error("Error deleting drawing: ", error);
    }
};