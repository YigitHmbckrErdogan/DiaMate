import { LogEntry } from '../context/DiabetesContext';
import { t, Language } from './translations';

export interface PredictiveInsightResult {
  insight: string;
  type: 'hyper' | 'hypo' | 'stable';
  block: string;
}

export function getPredictiveInsight(logs: LogEntry[], lang: Language = 'tr'): PredictiveInsightResult {
  const genBlock = t('blockGeneral', lang);
  
  if (!logs || logs.length === 0) {
    return {
      insight: t('aiFallbackEmpty', lang),
      type: 'stable',
      block: genBlock
    };
  }

  const morningLogs: LogEntry[] = [];
  const afternoonLogs: LogEntry[] = [];
  const eveningLogs: LogEntry[] = [];

  logs.forEach((log, index) => {
    if (log.tag === 'Fasting') {
      morningLogs.push(log);
    } else if (log.tag === 'Post-meal') {
      if (index % 2 === 0) afternoonLogs.push(log);
      else eveningLogs.push(log);
    } else {
      const rem = index % 3;
      if (rem === 0) afternoonLogs.push(log);
      else if (rem === 1) eveningLogs.push(log);
      else morningLogs.push(log);
    }
  });

  const getAverage = (entries: LogEntry[]) => {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, curr) => acc + curr.value, 0);
    return Math.round(sum / entries.length);
  };

  const avgMorning = getAverage(morningLogs);
  const avgAfternoon = getAverage(afternoonLogs);
  const avgEvening = getAverage(eveningLogs);

  const blockMorningStr = t('blockMorning', lang);
  const blockAfternoonStr = t('blockAfternoon', lang);
  const blockEveningStr = t('blockEvening', lang);

  // Afternoon checks
  if (avgAfternoon > 180) {
    return {
      insight: t('aiAfternoonHyper', lang),
      type: 'hyper',
      block: blockAfternoonStr
    };
  }
  if (avgAfternoon > 0 && avgAfternoon < 70) {
    return {
      insight: t('aiAfternoonHypo', lang),
      type: 'hypo',
      block: blockAfternoonStr
    };
  }

  // Morning checks
  if (avgMorning > 180) {
    return {
      insight: t('aiMorningHyper', lang),
      type: 'hyper',
      block: blockMorningStr
    };
  }
  if (avgMorning > 0 && avgMorning < 70) {
    return {
      insight: t('aiMorningHypo', lang),
      type: 'hypo',
      block: blockMorningStr
    };
  }

  // Evening checks
  if (avgEvening > 180) {
    return {
      insight: t('aiEveningHyper', lang),
      type: 'hyper',
      block: blockEveningStr
    };
  }
  if (avgEvening > 0 && avgEvening < 70) {
    return {
      insight: t('aiEveningHypo', lang),
      type: 'hypo',
      block: blockEveningStr
    };
  }

  // Stable Fallback
  return {
    insight: t('aiStable', lang),
    type: 'stable',
    block: genBlock
  };
}
