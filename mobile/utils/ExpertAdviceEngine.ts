import { t, Language } from './translations';

export function getClinicalInsight(protein?: number, fat?: number, lang: Language = 'tr'): string | null {
  const isHighFat = fat !== undefined && fat > 30;
  const isHighProtein = protein !== undefined && protein > 40;

  if (isHighFat || isHighProtein) {
    return t('expertAdviceOutput', lang);
  }

  return null;
}
