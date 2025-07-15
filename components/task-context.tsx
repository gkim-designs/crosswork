

"use client"

import { app } from "@/lib/firebase"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import useAuthHook from '../hooks/useAuth';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, setDoc, query, where} from "firebase/firestore";

export interface Task {
  id: string
  name: string
  dueDate: string
  status: "todo" | "done"
  epicId: string
  productTeam?: string
  priority: number
  userId: string;
}

export interface Epic {
  id: string
  name: string
  description: string
  productTeam: string
  color: string
  userId: string;
}

export interface ProductTeam {
  id: string
  name: string
  members: string[]
  userId: string;
}

interface TaskContextType {
  tasks: Task[]
  epics: Epic[]
  productTeams: ProductTeam[]
  updateTask: (taskId: string, updates: Partial<Task>) => void
  addTask: (task: Omit<Task, "id">) => Promise<void>
  addEpic: (epic: Omit<Epic, "id">) => Promise<void>
  updateEpic: (epicId: string, updates: Partial<Epic>) => Promise<void>
  deleteTask: (taskId: string) => void
  moveTask: (taskId: string, newDate: string) => void
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

const db = getFirestore(app);

export function TaskProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthHook();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [productTeams, setProductTeams] = useState<ProductTeam[]>([]);


  useEffect(() => {
    if (loading) return;
    console.log("Current user:", user);
    if (user) {
      console.log("User ID (uid):", user.uid);
    } else {
      console.log("No user is logged in.");
    }
  }, [user, loading]);

  // Load tasks from Firestore on mount and listen for changes
  useEffect(() => {
    if (loading || !user) return;
    const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
       setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
     });
    return unsubscribe;
  }, [user, loading]);

  // Load epics from Firestore on mount and listen for changes
  useEffect(() => {
    if (loading || !user) return;
    const q = query(collection(db, "epics"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
       setEpics(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Epic)));
     });
     return unsubscribe;
  }, [user, loading]);

  // Load product teams from Firestore on mount and listen for changes
  useEffect(() => {
    if (loading || !user) return;
    const q = query(collection(db, "productTeams"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(collection(db, "productTeams"), (snapshot) => {
      setProductTeams(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductTeam)));
    });
    return unsubscribe;
  }, [user, loading]);

  const addTask = async (task: Omit<Task, "id">) => {
    if (!user) return; 
    await addDoc(collection(db, "tasks"), { ...task, userId: user.uid });
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    await updateDoc(doc(db, "tasks", taskId), updates);
  };

  const deleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, "tasks", taskId));
  };

  const addEpic = async (epic: Omit<Epic, "id">) => {
    if (!user) return; 
    await addDoc(collection(db, "epics"), { ...epic, userId: user.uid });
  };

  const updateEpic = async (epicId: string, updates: Partial<Epic>) => {
    await updateDoc(doc(db, "epics", epicId), updates);
  };

  const moveTask = async (taskId: string, newDate: string) => {
    await updateDoc(doc(db, "tasks", taskId), { dueDate: newDate });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        epics,
        productTeams,
        updateTask,
        addTask,
        addEpic,
        updateEpic,
        deleteTask,
        moveTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTaskContext must be used within a TaskProvider")
  }
  return context
}
