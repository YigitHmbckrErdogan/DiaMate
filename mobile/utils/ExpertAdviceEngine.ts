export function getClinicalInsight(protein?: number, fat?: number): string | null {
  const isHighFat = fat !== undefined && fat > 30;
  const isHighProtein = protein !== undefined && protein > 40;

  if (isHighFat || isHighProtein) {
    return "Clinical Insight: High fat/protein detected. Consider splitting your dose: 60% now, 40% after 2 hours to prevent delayed spikes.";
  }

  return null;
}
