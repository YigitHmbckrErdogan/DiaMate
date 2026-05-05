import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  historicalDose: number;
}

interface DiabetesContextProps {
  carbRatio: number;
  insulinSensitivityFactor: number;
  logs: LogEntry[];
  foodDatabase: FoodItem[];
  updateSettings: (cr: number, isf: number) => Promise<void>;
  addLog: (log: Omit<LogEntry, 'id'>) => Promise<void>;
  addFood: (food: Omit<FoodItem, 'id'>) => Promise<void>;
  isLoading: boolean;
}

export const DiabetesContext = createContext<DiabetesContextProps>({
  carbRatio: 10,
  insulinSensitivityFactor: 50,
  logs: [],
  foodDatabase: [],
  updateSettings: async () => { },
  addLog: async () => { },
  addFood: async () => { },
  isLoading: true,
});

export const DiabetesProvider = ({ children }: { children: ReactNode }) => {
  const [carbRatio, setCarbRatio] = useState<number>(10);
  const [insulinSensitivityFactor, setIsf] = useState<number>(50);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [foodDatabase, setFoodDatabase] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedCr = await AsyncStorage.getItem('@carbRatio');
        const storedIsf = await AsyncStorage.getItem('@isf');
        const storedLogs = await AsyncStorage.getItem('@logs');
        const storedFoods = await AsyncStorage.getItem('@foodDatabase');

        if (storedCr) setCarbRatio(parseFloat(storedCr));
        if (storedIsf) setIsf(parseFloat(storedIsf));
        
        if (storedLogs) {
          setLogs(JSON.parse(storedLogs));
        } else {
          // Initialize with mock data if nothing exists
          const initialMockData: LogEntry[] = [
            { id: '1', date: '15 Mar', value: 145, tag: 'Fasting' },
            { id: '2', date: '14 Mar', value: 132, tag: 'Post-meal' },
            { id: '3', date: '13 Mar', value: 110, tag: 'Normal' },
            { id: '4', date: '12 Mar', value: 150, tag: 'Exercise' },
            { id: '5', date: '11 Mar', value: 185, tag: 'Fasting' }, // intentionally high
            { id: '6', date: '10 Mar', value: 65, tag: 'Normal' },   // intentionally low
          ];
          setLogs(initialMockData);
          await AsyncStorage.setItem('@logs', JSON.stringify(initialMockData));
        }

        if (storedFoods) {
          setFoodDatabase(JSON.parse(storedFoods));
        } else {
          const initialFoods: FoodItem[] = [{ id: '1', name: 'Apple', carbs: 15, historicalDose: 1.5 }];
          setFoodDatabase(initialFoods);
          await AsyncStorage.setItem('@foodDatabase', JSON.stringify(initialFoods));
        }

      } catch (error) {
        console.error('Failed to load settings from storage', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

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
    const newLog: LogEntry = {
      ...logData,
      id: Math.random().toString(36).substring(2, 9),
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    try {
      await AsyncStorage.setItem('@logs', JSON.stringify(updatedLogs));
    } catch (error) {
      console.error('Failed to save log', error);
    }
  };

  const addFood = async (foodData: Omit<FoodItem, 'id'>) => {
    const newFood: FoodItem = {
      ...foodData,
      id: Math.random().toString(36).substring(2, 9),
    };
    const updatedFoods = [newFood, ...foodDatabase];
    setFoodDatabase(updatedFoods);
    try {
      await AsyncStorage.setItem('@foodDatabase', JSON.stringify(updatedFoods));
    } catch (error) {
      console.error('Failed to save food', error);
    }
  }

  return (
    <DiabetesContext.Provider value={{ carbRatio, insulinSensitivityFactor, logs, foodDatabase, updateSettings, addLog, addFood, isLoading }}>
      {children}
    </DiabetesContext.Provider>
  );
};
