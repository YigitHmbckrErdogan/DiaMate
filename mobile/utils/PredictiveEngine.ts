import { LogEntry, FoodItem } from './../context/DiabetesContext';

// Default Constants
const ISF = 50; // Insulin Sensitivity Factor (how much 1 unit of insulin drops BG)
const CR = 10; // Carb Ratio (grams of carbs covered by 1 unit of insulin)
const INSULIN_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
const CARB_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

/**
 * Calculates Insulin On Board (IOB) using a linear decay model.
 */
export const calculateIOB = (foods: FoodItem[], now = Date.now()): number => {
  return foods.reduce((totalIOB, food) => {
    if (!food.createdAt || food.historicalDose <= 0) return totalIOB;
    
    const timeElapsed = now - food.createdAt;
    
    // If the dose was taken in the future or the duration has entirely passed
    if (timeElapsed < 0 || timeElapsed >= INSULIN_DURATION) return totalIOB;
    
    // Linear decay
    const remainingRatio = 1 - (timeElapsed / INSULIN_DURATION);
    return totalIOB + (food.historicalDose * remainingRatio);
  }, 0);
};

/**
 * Calculates Carbs On Board (COB) using a linear decay model.
 */
export const calculateCOB = (foods: FoodItem[], now = Date.now()): number => {
  return foods.reduce((totalCOB, food) => {
    if (!food.createdAt || food.carbs <= 0) return totalCOB;
    
    const timeElapsed = now - food.createdAt;
    
    if (timeElapsed < 0 || timeElapsed >= CARB_DURATION) return totalCOB;
    
    const remainingRatio = 1 - (timeElapsed / CARB_DURATION);
    return totalCOB + (food.carbs * remainingRatio);
  }, 0);
};

/**
 * Predicts the future blood glucose based on current BG, COB, and IOB.
 * Formula: PredictedBG = CurrentBG + (COB * (ISF/CR)) - (IOB * ISF)
 */
export const predictFutureBG = (currentBG: number, cob: number, iob: number): number => {
  return currentBG + (cob * (ISF / CR)) - (iob * ISF);
};

export type RiskLevel = 'HIGH' | 'LOW' | 'SAFE';

export interface RiskAnalysis {
  riskLevel: RiskLevel;
  predictedBG: number;
  message: string;
}

/**
 * Analyzes the risk of hyper/hypoglycemia based on recent data.
 */
export const analyzeRisk = (logs: LogEntry[], foods: FoodItem[]): RiskAnalysis => {
  if (logs.length === 0) {
    return { riskLevel: 'SAFE', predictedBG: 0, message: '' };
  }
  
  // Sort guarantees the first element is the latest log
  const latestLog = logs[0];
  const now = Date.now();
  
  const currentBG = latestLog.value;
  const iob = calculateIOB(foods, now);
  const cob = calculateCOB(foods, now);
  
  const predictedBG = predictFutureBG(currentBG, cob, iob);
  
  if (predictedBG < 70) {
    return {
      riskLevel: 'LOW',
      predictedBG: Math.round(predictedBG),
      message: '⚠️ Hipoglisemi Riski: Vücudunuzdaki aktif insülin (IOB) yüksek. Şekeriniz düşüş eğiliminde, karbonhidrat takviyesi gerekebilir.'
    };
  } else if (predictedBG > 180) {
    return {
      riskLevel: 'HIGH',
      predictedBG: Math.round(predictedBG),
      message: '⚠️ Hiperglisemi Riski: Şekeriniz yükseliş eğiliminde, düzeltme dozu gerekebilir.'
    };
  }
  
  return {
    riskLevel: 'SAFE',
    predictedBG: Math.round(predictedBG),
    message: 'Tebrikler! Kan şekeriniz öngörülebilir güvenli aralıkta.'
  };
};
