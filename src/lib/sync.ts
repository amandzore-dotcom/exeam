import { db } from "./firebase";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  doc, 
  deleteDoc,
  writeBatch
} from "firebase/firestore";
import { UserCustomCard, UserCustomQuestion } from "../types";

// Keep custom cards in sync
export async function fetchUserCards(userId: string): Promise<UserCustomCard[]> {
  try {
    const q = query(collection(db, "cards"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const cloudCards: UserCustomCard[] = [];
    snapshot.forEach((d) => {
      cloudCards.push(d.data() as UserCustomCard);
    });
    // Sort descending by createdAt
    return cloudCards.sort((a, b) => b.createdAt - a.createdAt);
  } catch (e) {
    console.error("Failed to fetch cloud cards: ", e);
    return [];
  }
}

export async function uploadUserCard(userId: string, card: UserCustomCard): Promise<void> {
  try {
    const docRef = doc(db, "cards", card.id);
    await setDoc(docRef, { ...card, userId });
  } catch (e) {
    console.error("Failed to upload card: ", e);
  }
}

export async function removeUserCard(userId: string, cardId: string): Promise<void> {
  try {
    const docRef = doc(db, "cards", cardId);
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Failed to delete cloud card: ", e);
  }
}

// Bulk sync local cards to cloud upon user's first login
export async function bulkSyncCardsToCloud(userId: string, localCards: UserCustomCard[]): Promise<UserCustomCard[]> {
  try {
    const cloud = await fetchUserCards(userId);
    const cloudMap = new Map(cloud.map((c) => [c.id, c]));
    
    // Perform robust in-memory merging to guarantee local cards are never wiped out
    const mergedMap = new Map<string, UserCustomCard>();
    for (const card of localCards) {
      mergedMap.set(card.id, card);
    }
    for (const card of cloud) {
      const existing = mergedMap.get(card.id);
      // Keep whichever has higher ebbinghausStage or is newer
      if (!existing || (card.createdAt > existing.createdAt) || (card.ebbinghausStage || 0) > (existing.ebbinghausStage || 0)) {
        mergedMap.set(card.id, card);
      }
    }
    
    const mergedList = Array.from(mergedMap.values());

    // Find cards that need to be uploaded or updated in the cloud
    const toUpload: UserCustomCard[] = [];
    for (const card of mergedList) {
      const cloudCard = cloudMap.get(card.id);
      if (!cloudCard || 
          cloudCard.ebbinghausStage !== card.ebbinghausStage || 
          cloudCard.nextReviewTime !== card.nextReviewTime ||
          cloudCard.recyclesCount !== card.recyclesCount) {
        toUpload.push(card);
      }
    }

    if (toUpload.length > 0) {
      const batch = writeBatch(db);
      for (const card of toUpload) {
        const ref = doc(db, "cards", card.id);
        batch.set(ref, { ...card, userId });
      }
      await batch.commit();
    }
    
    return mergedList.sort((a, b) => b.createdAt - a.createdAt);
  } catch (e) {
    console.error("Bulk sync cards failed: ", e);
    return localCards;
  }
}


// Keep custom questions (Teacher custom quizzes) in sync
export async function fetchUserQuizzes(userId: string): Promise<UserCustomQuestion[]> {
  try {
    const q = query(collection(db, "quizzes"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const cloudQuizzes: UserCustomQuestion[] = [];
    snapshot.forEach((d) => {
      cloudQuizzes.push(d.data() as UserCustomQuestion);
    });
    return cloudQuizzes.sort((a, b) => b.createdAt - a.createdAt);
  } catch (e) {
    console.error("Failed to fetch cloud quizzes: ", e);
    return [];
  }
}

export async function uploadUserQuiz(userId: string, quiz: UserCustomQuestion): Promise<void> {
  try {
    const docRef = doc(db, "quizzes", quiz.id);
    await setDoc(docRef, { ...quiz, userId });
  } catch (e) {
    console.error("Failed to upload quiz: ", e);
  }
}

export async function removeUserQuiz(userId: string, quizId: string): Promise<void> {
  try {
    const docRef = doc(db, "quizzes", quizId);
    await deleteDoc(docRef);
  } catch (e) {
    console.error("Failed to delete cloud quiz: ", e);
  }
}

// Bulk sync local quizzes on login
export async function bulkSyncQuizzesToCloud(userId: string, localQuizzes: UserCustomQuestion[]): Promise<UserCustomQuestion[]> {
  try {
    const cloud = await fetchUserQuizzes(userId);
    const cloudMap = new Map(cloud.map((q) => [q.id, q]));
    
    const toUpload = localQuizzes.filter((q) => !cloudMap.has(q.id));
    if (toUpload.length > 0) {
      const batch = writeBatch(db);
      for (const quiz of toUpload) {
        const ref = doc(db, "quizzes", quiz.id);
        batch.set(ref, { ...quiz, userId });
      }
      await batch.commit();
    }
    
    // Safe in-memory merge
    const mergedMap = new Map<string, UserCustomQuestion>();
    for (const quiz of localQuizzes) {
      mergedMap.set(quiz.id, quiz);
    }
    for (const quiz of cloud) {
      mergedMap.set(quiz.id, quiz);
    }
    
    const mergedList = Array.from(mergedMap.values());
    return mergedList.sort((a, b) => b.createdAt - a.createdAt);
  } catch (e) {
    console.error("Bulk sync quizzes failed: ", e);
    return localQuizzes;
  }
}
