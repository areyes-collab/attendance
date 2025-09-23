// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, limit, onSnapshot, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAD2zI-7kXEMj7VkodUq0uBG6nIpwxCkEY",
  authDomain: "attendace-1ba45.firebaseapp.com",
  projectId: "attendace-1ba45",
  storageBucket: "attendace-1ba45.firebasestorage.app",
  messagingSenderId: "109085096144",
  appId: "1:109085096144:web:7c1ca95df4c0e6481dc6d5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;

// Firestore helper functions
export const createDocument = async (collection: string, data: any) => {
  const docRef = await addDoc(collection(db, collection), {
    ...data,
    created_at: new Date().toISOString(),
  });
  return docRef.id;
};

export const getDocuments = async (collectionName: string, conditions?: any[]) => {
  const collectionRef = collection(db, collectionName);
  
  if (conditions) {
    let q = query(collectionRef);
    conditions.forEach(condition => {
      q = query(q, condition);
    });
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } else {
    const querySnapshot = await getDocs(collectionRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
};

export const deleteDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

// Real-time listener for documents
export const subscribeToCollection = (
  collectionName: string, 
  callback: (data: any[]) => void,
  conditions?: any[]
) => {
  const collectionRef = collection(db, collectionName);
  
  let q = collectionRef;
  if (conditions) {
    conditions.forEach(condition => {
      q = query(q, condition);
    });
  }
  
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  });
};

// Real-time listener for a single document
export const subscribeToDocument = (
  collectionName: string,
  docId: string,
  callback: (data: any) => void
) => {
  const docRef = doc(db, collectionName, docId);
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

// Get documents with real-time filtering
export const getDocumentsRealtime = async (collectionName: string, conditions?: any[]) => {
  const collectionRef = collection(db, collectionName);
  
  if (conditions) {
    let q = query(collectionRef);
    conditions.forEach(condition => {
      q = query(q, condition);
    });
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } else {
    const querySnapshot = await getDocs(collectionRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }
};

// Firebase database structure types
export interface Teacher {
  id: string;
  name: string;
  email: string;
  rfid_id: string;
  created_at: string;
}

export interface Classroom {
  id: string;
  name: string;
  location: string;
  created_at: string;
}

export interface Schedule {
  id: string;
  teacher_id: string;
  classroom_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  grace_period_minutes: number;
  created_at: string;
}

export interface AttendanceLog {
  id: string;
  teacher_id: string;
  classroom_id: string;
  schedule_id: string;
  scan_time: string;
  scan_type: 'in' | 'out';
  status: 'on_time' | 'late' | 'absent' | 'early_leave';
  date: string;
  created_at: string;
}

// Admin interface
export interface Admin {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  profile_image?: string;
  created_at: string;
  updated_at?: string;
}