import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '../utils/translations';
import { db, auth } from '../utils/config/firebaseConfig';
import { collection, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export type LogTag = 'Fasting' | 'Post-meal' | 'Exercise' | 'Normal';

export interface LogEntry {
  id: string;
  date: string;
  value: number; // Blood sugar value
  tag: LogTag;
}

export interface FoodItem {
  id: string;
  name: string;
  carbs: number;
  protein?: number;
  fat?: number;
  historicalDose: number;
}

interface TirStats {
  daily: number;
  weekly: number;
  monthly: number;
}

interface DiabetesContextProps {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  carbRatio: number;
  insulinSensitivityFactor: number;
  logs: LogEntry[];
  foodDatabase: FoodItem[];
  tirStats: TirStats;
  updateSettings: (cr: number, isf: number) => Promise<void>;
  addLog: (log: Omit<LogEntry, 'id'>) => Promise<void>;
  updateLog: (id: string, updatedLog: Partial<LogEntry>) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  addFood: (food: Omit<FoodItem, 'id'>) => Promise<void>;
  isLoading: boolean;
}

export const DiabetesContext = createContext<DiabetesContextProps>({
  language: 'tr',
  setLanguage: async () => {},
  carbRatio: 10,
  insulinSensitivityFactor: 50,
  logs: [],
  foodDatabase: [],
  tirStats: { daily: 0, weekly: 0, monthly: 0 },
  updateSettings: async () => {},
  addLog: async () => {},
  updateLog: async () => {},
  deleteLog: async () => {},
  addFood: async () => {},
  isLoading: true,
});

export const DiabetesProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLangState] = useState<Language>('tr');
  const [carbRatio, setCarbRatio] = useState<number>(10);
  const [insulinSensitivityFactor, setIsf] = useState<number>(50);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [foodDatabase, setFoodDatabase] = useState<FoodItem[]>([]);
  const [tirStats, setTirStats] = useState<TirStats>({ daily: 0, weekly: 0, monthly: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const withTimeout = (promise: Promise<any>, ms: number) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Bağlantı zaman aşımına uğradı (Firebase veritabanınız henüz kurulmamış olabilir)')), ms)
      )
    ]);
  };

  // Calculate TIR Stats
  useEffect(() => {
    const calculateTir = (periodLogs: LogEntry[]) => {
      if (periodLogs.length === 0) return 0;
      const inRange = periodLogs.filter(log => log.value >= 70 && log.value <= 180).length;
      return Math.round((inRange / periodLogs.length) * 100);
    };

    const now = new Date();
    const currentYear = now.getFullYear();

    const getDaysDifference = (dateStr: string) => {
      const date = new Date(`${dateStr} ${currentYear}`);
      if (isNaN(date.getTime())) return 0;
      if (date > now) {
        date.setFullYear(currentYear - 1);
      }
      const diffTime = Math.abs(now.getTime() - date.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const dailyLogs = logs.filter(log => getDaysDifference(log.date) <= 1);
    const weeklyLogs = logs.filter(log => getDaysDifference(log.date) <= 7);
    const monthlyLogs = logs.filter(log => getDaysDifference(log.date) <= 30);

    setTirStats({
      daily: calculateTir(dailyLogs.length > 0 ? dailyLogs : logs),
      weekly: calculateTir(weeklyLogs.length > 0 ? weeklyLogs : logs),
      monthly: calculateTir(monthlyLogs.length > 0 ? monthlyLogs : logs),
    });
  }, [logs]);

  // Load purely local settings from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedLang = await AsyncStorage.getItem('@language');
        const storedCr = await AsyncStorage.getItem('@carbRatio');
        const storedIsf = await AsyncStorage.getItem('@isf');

        if (storedLang === 'tr' || storedLang === 'en') {
          setLangState(storedLang);
        }
        if (storedCr) setCarbRatio(parseFloat(storedCr));
        if (storedIsf) setIsf(parseFloat(storedIsf));
      } catch (error) {
        console.error('Failed to load settings from storage', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Firestore Real-time Listeners (Logs and Foods)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // --- LOGS LISTENER ---
        const qLogs = query(
          collection(db, 'logs'),
          where('userId', '==', user.uid)
        );

        const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
          const fetchedLogs = snapshot.docs.map(docSnapshot => {
            const data = docSnapshot.data({ serverTimestamps: 'estimate' });
            return {
              id: docSnapshot.id,
              date: data.date,
              value: data.value,
              tag: data.tag,
              createdAt: data.createdAt ? data.createdAt.toMillis() : Date.now()
            };
          });
          
          fetchedLogs.sort((a, b) => b.createdAt - a.createdAt);
          
          const typedLogs: LogEntry[] = fetchedLogs.map(log => ({
            id: log.id,
            date: log.date,
            value: log.value,
            tag: log.tag as LogTag
          }));

          setLogs(typedLogs);
        }, (error) => {
          console.error("Firestore logs snapshot error:", error);
          alert("Kayıtları çekerken hata: " + error.message);
        });

        // --- FOODS LISTENER ---
        const qFoods = query(
          collection(db, 'foods'),
          where('userId', '==', user.uid)
        );

        const unsubscribeFoods = onSnapshot(qFoods, (snapshot) => {
          const fetchedFoods = snapshot.docs.map(docSnapshot => {
            const data = docSnapshot.data({ serverTimestamps: 'estimate' });
            return {
              id: docSnapshot.id,
              name: data.name,
              carbs: data.carbs,
              protein: data.protein,
              fat: data.fat,
              historicalDose: data.historicalDose,
              createdAt: data.createdAt ? data.createdAt.toMillis() : Date.now()
            };
          });
          
          fetchedFoods.sort((a, b) => b.createdAt - a.createdAt);
          
          const typedFoods: FoodItem[] = fetchedFoods.map(food => ({
            id: food.id,
            name: food.name,
            carbs: food.carbs,
            protein: food.protein,
            fat: food.fat,
            historicalDose: food.historicalDose
          }));

          setFoodDatabase(typedFoods.length > 0 ? typedFoods : [{ id: '1', name: 'Apple', carbs: 15, historicalDose: 1.5 }]);
        }, (error) => {
          console.error("Firestore foods snapshot error:", error);
          alert("Yemekleri çekerken hata: " + error.message);
        });

        return () => {
          unsubscribeLogs();
          unsubscribeFoods();
        };
      } else {
        setLogs([]);
        setFoodDatabase([{ id: '1', name: 'Apple (Demo)', carbs: 15, historicalDose: 1.5 }]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const setLanguage = async (lang: Language) => {
    try {
      setLangState(lang);
      await AsyncStorage.setItem('@language', lang);
    } catch (error) {
      console.error('Failed to save language', error);
    }
  };

  const updateSettings = async (cr: number, isf: number) => {
    try {
      setCarbRatio(cr);
      setIsf(isf);
      await AsyncStorage.setItem('@carbRatio', cr.toString());
      await AsyncStorage.setItem('@isf', isf.toString());
    } catch (error) {
      console.error('Failed to save settings', error);
    }
  };

  const addLog = async (logData: Omit<LogEntry, 'id'>) => {
    if (!auth.currentUser) {
      alert("Hata: Oturumunuz kapalı. Lütfen giriş yapın.");
      return;
    }
    try {
      const cleanData = Object.fromEntries(Object.entries(logData).filter(([_, v]) => v !== undefined));
      await withTimeout(addDoc(collection(db, 'logs'), {
        ...cleanData,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      }), 10000);
    } catch (error: any) {
      alert('Kayıt eklenemedi: ' + error.message);
      console.error('Failed to add log to Firestore', error);
      throw error;
    }
  };

  const updateLog = async (id: string, updatedLog: Partial<LogEntry>) => {
    try {
      const logRef = doc(db, 'logs', id);
      const cleanData = Object.fromEntries(Object.entries(updatedLog).filter(([_, v]) => v !== undefined));
      await withTimeout(updateDoc(logRef, cleanData), 10000);
    } catch (error: any) {
      alert('Kayıt güncellenemedi: ' + error.message);
      console.error('Failed to update log in Firestore', error);
      throw error;
    }
  };

  const deleteLog = async (id: string) => {
    try {
      const logRef = doc(db, 'logs', id);
      await withTimeout(deleteDoc(logRef), 10000);
    } catch (error: any) {
      alert('Kayıt silinemedi: ' + error.message);
      console.error('Failed to delete log from Firestore', error);
      throw error;
    }
  };

  const addFood = async (foodData: Omit<FoodItem, 'id'>) => {
    if (!auth.currentUser) {
      alert("Hata: Oturumunuz kapalı. Yemek kaydedilemedi.");
      return;
    }
    try {
      const cleanData = Object.fromEntries(Object.entries(foodData).filter(([_, v]) => v !== undefined));
      await withTimeout(addDoc(collection(db, 'foods'), {
        ...cleanData,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      }), 10000);
    } catch (error: any) {
      alert('Yemek eklenemedi: ' + error.message);
      console.error('Failed to save food', error);
      throw error;
    }
  }

  return (
    <DiabetesContext.Provider value={{ language, setLanguage, carbRatio, insulinSensitivityFactor, logs, foodDatabase, tirStats, updateSettings, addLog, updateLog, deleteLog, addFood, isLoading }}>
      {children}
    </DiabetesContext.Provider>
  );
};
