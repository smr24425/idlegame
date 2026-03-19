import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { GameState } from '../types/game';

export const uploadCloudSave = async (uid: string, gameState: GameState): Promise<boolean> => {
  try {
    await setDoc(doc(db, 'saves', uid), gameState);
    return true;
  } catch (error) {
    console.error("Error uploading save:", error);
    return false;
  }
};

export const downloadCloudSave = async (uid: string): Promise<GameState | null> => {
  try {
    const docRef = doc(db, 'saves', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as GameState;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error downloading save:", error);
    return null;
  }
};
