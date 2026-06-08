import React, { useContext } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, Platform, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { DiabetesContext, LogEntry } from '../context/DiabetesContext';
import WebLayout from '../components/WebLayout';
import { getPredictiveInsight } from '../utils/PatternLogic';
import { analyzeRisk } from '../utils/PredictiveEngine';
import { t } from '../utils/translations';

const isWeb = Platform.OS === 'web';

export default function DashboardScreen({ navigation }: any) {
  const { language, logs, foodDatabase, tirStats } = useContext(DiabetesContext);

  // Analyze true predictive risk from IOB/COB math model
  const riskAnalysis = analyzeRisk(logs, foodDatabase);

  // Get the most recent reading for the Hero Card
  const latestLog = logs && logs.length > 0 ? logs[0] : null;

  // Determine trend from last 2 logs
  const getTrend = (): 'RISING' | 'FALLING' | 'STABLE' => {
    if (!logs || logs.length < 2) return 'STABLE';
    const current = logs[0].value;
    const previous = logs[1].value;
    const diff = current - previous;
    if (diff > 15) return 'RISING';
    if (diff < -15) return 'FALLING';
    return 'STABLE';
  };

  const trend = getTrend();

  const getTrendDetails = (tr: 'RISING' | 'FALLING' | 'STABLE') => {
    switch(tr) {
      case 'RISING':
        return { icon: 'arrow-up', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.12)', text: t('trendRising', language) };
      case 'FALLING':
        return { icon: 'arrow-down', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.12)', text: t('trendFalling', language) };
      default:
        return { icon: 'arrow-forward', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.12)', text: t('trendStable', language) };
    }
  };

  const trendMeta = getTrendDetails(trend);

  // Check if any recent food item in the foodDatabase triggered the Expert Advice alert
  const latestAdviceFood = foodDatabase && foodDatabase.length > 0 ? foodDatabase[0] : null;
  const hasAdviceAlert = latestAdviceFood && ((latestAdviceFood.fat && latestAdviceFood.fat > 30) || (latestAdviceFood.protein && latestAdviceFood.protein > 40));

  // Client-Side AI Predictive Insight logic computed dynamically
  const predictiveResult = getPredictiveInsight(logs, language);

  const getAiTypeColor = (type: 'hyper' | 'hypo' | 'stable') => {
    if (type === 'hyper') return '#FCA5A5'; 
    if (type === 'hypo') return '#93C5FD';  
    return '#A7F3D0'; 
  };

  // Past readings list: ignore the first one since it's displayed in Hero Card
  const pastLogsForMobile = logs && logs.length > 1 ? logs.slice(1) : [];

  // Derive deterministic time, carbs, and trend arrow metadata for the clean grid layout
  const getLogMeta = (item: LogEntry, idx: number) => {
    let timeStr = '12:00';
    let carbsStr = '0g';
    let trendArrow = t('trendStable', language);
    let trendIcon = 'arrow-forward';
    let trendColor = '#34D399';
    
    if (item.tag === 'Fasting') {
      timeStr = '08:30';
      carbsStr = '0g';
      trendArrow = t('trendStable', language);
      trendIcon = 'arrow-forward';
      trendColor = '#38BDF8';
    } else if (item.tag === 'Post-meal') {
      timeStr = idx % 2 === 0 ? '13:15' : '19:45';
      carbsStr = idx % 2 === 0 ? '45g' : '65g';
      trendArrow = item.value > 140 ? t('trendRising', language) : t('trendStable', language);
      trendIcon = item.value > 140 ? 'arrow-up' : 'arrow-forward';
      trendColor = item.value > 140 ? '#F59E0B' : '#34D399';
    } else if (item.tag === 'Exercise') {
      timeStr = '17:30';
      carbsStr = '15g';
      trendArrow = t('trendFalling', language);
      trendIcon = 'arrow-down';
      trendColor = '#10B981';
    } else {
      timeStr = '11:20';
      carbsStr = '20g';
      trendArrow = t('trendStable', language);
      trendIcon = 'arrow-forward';
      trendColor = '#94A3B8';
    }

    if (item.value > 180) {
      trendArrow = t('trendRising', language);
      trendIcon = 'arrow-up';
      trendColor = '#EF4444';
    } else if (item.value < 70) {
      trendArrow = t('trendFalling', language);
      trendIcon = 'arrow-down';
      trendColor = '#3B82F6';
    }

    return { timeStr, carbsStr, trendArrow, trendIcon, trendColor };
  };

  const getTagKey = (tag: string) => {
    if (tag === 'Fasting') return 'tagFasting';
    if (tag === 'Post-meal') return 'tagPostMeal';
    if (tag === 'Exercise') return 'tagExercise';
    return 'tagNormal';
  };

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Fasting': return '#3B82F6';
      case 'Post-meal': return '#F59E0B';
      case 'Exercise': return '#10B981';
      default: return '#64748B';
    }
  };

  // Detailed Grid Row Renderer for Log Items
  const renderGridReadingItem = ({ item, index }: { item: LogEntry; index: number }) => {
    const meta = getLogMeta(item, index);
    const isSafe = item.value >= 70 && item.value <= 180;
    const valueColor = isSafe ? '#10B981' : '#EF4444'; // Emerald Neon vs Crimson Red

    return (
      <Animated.View 
        entering={FadeInUp.delay(Math.min(index * 60, 400)).duration(400).springify()} 
        style={isWeb ? [styles.listItemWeb, item.id === latestLog?.id && styles.latestReadingItemWeb] : styles.gridItemContainer}
      >
        <View style={[styles.gridTagStrip, { backgroundColor: getTagColor(item.tag) }]} />
        
        {/* Column 1: Date & Time */}
        <View style={styles.gridColDateTime}>
          <Text style={styles.gridDateText}>{item.date}</Text>
          <Text style={styles.gridTimeText}>{meta.timeStr} • {t(getTagKey(item.tag), language)}</Text>
        </View>

        {/* Column 2: Carbs */}
        <View style={styles.gridColCarbs}>
          <Text style={styles.gridValueSub}>{meta.carbsStr}</Text>
          <Text style={styles.gridLabelTiny}>CHO</Text>
        </View>

        {/* Column 3: Trend Arrow */}
        <View style={styles.gridColTrend}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 }}>
            {/* @ts-ignore */}
            <Ionicons name={meta.trendIcon} size={14} color={meta.trendColor} />
            <Text style={[styles.gridTrendText, { color: meta.trendColor }]} numberOfLines={1} adjustsFontSizeToFit>{meta.trendArrow}</Text>
          </View>
        </View>

        {/* Column 4: Color-coded Blood Sugar Value */}
        <View style={styles.gridColGlucose}>
          <Text style={[styles.gridGlucoseNum, { color: valueColor }]}>{item.value}</Text>
          <Text style={styles.gridUnitTiny}>mg/dL</Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <WebLayout title={t('dashboardTitle', language)}>
      <SafeAreaView style={styles.container}>
        
        {/* Mobile Top Header */}
        {!isWeb && (
          <View style={styles.headerMobile}>
            <Text style={styles.headerTitleMobile}>{t('brandName', language)}</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => navigation.navigate('MealPlannerScreen')} style={styles.iconBtn}>
                <Ionicons name="restaurant-outline" size={22} color="#E2E8F0" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')} style={styles.iconBtn}>
                <Ionicons name="settings-outline" size={22} color="#E2E8F0" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* THE AI CARD */}
          <Animated.View entering={FadeInUp.duration(500).springify()} style={[isWeb ? styles.aiCardWeb : styles.aiCardMobile]}>
            <View style={styles.aiCardHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
                <Ionicons name="sparkles" size={20} color={isWeb ? '#8B5CF6' : '#C084FC'} />
                <Text style={[styles.aiCardTitle, { color: isWeb ? '#6D28D9' : '#E0E7FF' }]} numberOfLines={1} adjustsFontSizeToFit>{t('aiPredictiveTitle', language)}</Text>
              </View>
              <View style={[styles.aiBadge, { backgroundColor: isWeb ? 'rgba(139, 92, 246, 0.1)' : 'rgba(192, 132, 252, 0.2)' }]}>
                <Text style={[styles.aiBadgeText, { color: isWeb ? '#7C3AED' : '#C084FC' }]}>{predictiveResult.block} {t('aiBlockSuffix', language)}</Text>
              </View>
            </View>
            <View style={styles.aiTextContainer}>
              <Text style={[styles.aiCardText, { color: getAiTypeColor(predictiveResult.type) }]}>
                {predictiveResult.insight}
              </Text>
            </View>
          </Animated.View>

          {/* Prominent HbA1c Block */}
          {isWeb && (
            <Animated.View entering={FadeInUp.duration(400).springify()} style={styles.hba1cContainerWeb}>
              <Text style={styles.hba1cLabelWeb}>{t('estHbA1c', language)}</Text>
              <Text style={styles.hba1cValueWeb}>6.1%</Text>
              <Text style={styles.legendTextWeb}>✨ {t('excellentRange', language)}</Text>
            </Animated.View>
          )}

          {/* LATEST READING HERO CARD WITH DYNAMIC TREND ARROWS */}
          {latestLog && (
            <Animated.View entering={FadeInUp.duration(500).springify()} style={[isWeb ? styles.cardWeb : styles.glassCard, !isWeb && styles.heroCardHighlight]}>
              <View style={styles.heroCardHeader}>
                <Text style={isWeb ? styles.listTitleWeb : styles.glassLabelHighlight}>{t('latestGlucoseLabel', language)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={styles.livePulseDot} />
                  <Text style={styles.heroTimestamp}>{latestLog.date} ({t('latestBadge', language)})</Text>
                </View>
              </View>

              <View style={styles.heroMainRow}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                  <Text style={[isWeb ? styles.hba1cValueWeb : styles.glassHeroValue, { color: isWeb ? '#0F172A' : '#2DD4BF' }]}>
                    {latestLog.value}
                  </Text>
                  <Text style={styles.heroUnit}>mg/dL</Text>
                </View>

                {/* Dynamic Trend Indicator Badge */}
                <View style={[styles.heroTrendBadge, { backgroundColor: trendMeta.bgColor, borderColor: trendMeta.color }]}>
                  {/* @ts-ignore */}
                  <Ionicons name={trendMeta.icon} size={18} color={trendMeta.color} />
                  <Text style={[styles.heroTrendText, { color: trendMeta.color }]}>{trendMeta.text}</Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* CRITICAL HYPOGLYCEMIA RISK CARD (Predictive Engine) */}
          {riskAnalysis.riskLevel === 'LOW' && (
            <Animated.View entering={FadeInUp.duration(500).springify()} style={[isWeb ? styles.cardWeb : styles.glassCard, styles.criticalRiskCard]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Ionicons name="warning" size={24} color="#EF4444" />
                <Text style={styles.criticalRiskTitle}>KRİTİK UYARI</Text>
              </View>
              <Text style={styles.criticalRiskText}>
                {riskAnalysis.message}
              </Text>
              <Text style={styles.criticalRiskSubtext}>
                Öngörülen Kan Şekeri: {riskAnalysis.predictedBG} mg/dL
              </Text>
            </Animated.View>
          )}

          {/* EXPERT ADVICE ENGINE ALERT CARD */}
          {hasAdviceAlert && latestAdviceFood && (
            <Animated.View entering={FadeInUp.duration(600).springify()} style={[isWeb ? styles.cardWeb : styles.glassCard, !isWeb && styles.adviceCardHighlight]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Ionicons name="warning" size={22} color="#F59E0B" />
                <Text style={styles.adviceCardTitle}>{t('expertAdviceTitle', language)}</Text>
              </View>
              <Text style={styles.adviceCardText}>
                {t('expertAdviceOutput', language)}
              </Text>
              <View style={styles.adviceFoodContext}>
                <Text style={styles.adviceFoodContextText}>
                  {t('triggeredBy', language)} {latestAdviceFood.name} ({latestAdviceFood.protein || 0}{t('proteinUnit', language)}, {latestAdviceFood.fat || 0}{t('fatUnit', language)})
                </Text>
              </View>
            </Animated.View>
          )}

          {/* TIME IN RANGE (TIR) ANALYTICS GAUGE / PROGRESS BAR */}
          <Animated.View entering={FadeInUp.duration(600).springify()} style={[isWeb ? styles.cardWeb : styles.glassCard]}>
            <Text style={isWeb ? styles.listTitleWeb : styles.glassCardTitle}>{t('tirTitle', language)}</Text>
            <Text style={isWeb ? styles.subtextWeb : styles.glassCardSubtitle}>
              {t('tirSubtitle', language)}
            </Text>

            <View style={styles.progressBarContainer}>
              <View style={[styles.progressSegment, { width: '15%', backgroundColor: '#FCA5A5' }]} />
              <View style={[styles.progressSegment, { width: `${tirStats.weekly}%`, backgroundColor: '#2DD4BF' }]} />
              <View style={[styles.progressSegment, { flex: 1, backgroundColor: '#93C5FD' }]} />
            </View>

            <View style={styles.progressLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#FCA5A5' }]} />
                <Text style={isWeb ? styles.legendTextWeb : styles.legendTextMobile}>{t('lowLabel', language)} 15%</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#2DD4BF' }]} />
                <Text style={isWeb ? styles.legendTextWeb : styles.legendTextMobile}>{t('safeLabel', language)} {tirStats.weekly}%</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#93C5FD' }]} />
                <Text style={isWeb ? styles.legendTextWeb : styles.legendTextMobile}>{t('highLabel', language)} {Math.max(0, 85 - tirStats.weekly)}%</Text>
              </View>
            </View>
          </Animated.View>

          {/* LOGS LIST SCREEN OVERHAUL: DETAILED GRID ANALYTICS VIEW */}
          <Animated.View entering={FadeInUp.duration(700).springify()} style={[isWeb ? styles.cardWeb : styles.glassCard]}>
            <View style={styles.gridHeaderMainRow}>
              <Text style={isWeb ? styles.listTitleWeb : styles.glassCardTitle}>
                {isWeb ? t('prevReadingsTitle', language) : t('pastReadingsTitle', language)}
              </Text>
              <Text style={styles.gridHeaderSubText}>✨ Pro Analytics Grid</Text>
            </View>

            {/* Grid Header Columns */}
            {!isWeb && pastLogsForMobile.length > 0 && (
              <View style={styles.gridColHeaderRow}>
                <Text style={[styles.gridColHeaderLabel, { width: 90 }]}>{t('colDate', language)} & {t('colTime', language)}</Text>
                <Text style={[styles.gridColHeaderLabel, { width: 44, textAlign: 'center' }]}>{t('colCarbs', language)}</Text>
                <Text style={[styles.gridColHeaderLabel, { flex: 1, textAlign: 'center' }]}>{t('colTrend', language)}</Text>
                <Text style={[styles.gridColHeaderLabel, { width: 66, textAlign: 'right' }]}>mg/dL</Text>
              </View>
            )}

            <View style={{ marginTop: 8 }}>
              <FlatList
                data={isWeb ? logs : pastLogsForMobile}
                renderItem={renderGridReadingItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={isWeb ? styles.emptyTextWeb : styles.emptyTextMobile}>{t('emptyLogs', language)}</Text>}
                scrollEnabled={!isWeb}
              />
            </View>
          </Animated.View>
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity 
          style={[styles.fab, !isWeb && styles.fabMobileGlass]} 
          activeOpacity={0.8}
          onPress={() => navigation.navigate('AddLogScreen')}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    </WebLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isWeb ? '#F8FAFC' : '#020617', // Global Unified Theme: Deep Space Navy
    paddingTop: !isWeb ? StatusBar.currentHeight : 0,
  },
  
  // AI Card Styling Tokens
  aiCardWeb: {
    backgroundColor: '#EEF2FF',
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C084FC',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 20,
    marginTop: isWeb ? 0 : 4,
  },
  aiCardMobile: {
    marginHorizontal: 20,
    marginBottom: 16,
    marginTop: 12,
    padding: 26,
    backgroundColor: 'rgba(99, 102, 241, 0.12)', 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.35)', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  aiCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  aiBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  aiTextContainer: {
    flexShrink: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  aiCardText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    flexShrink: 1,
  },

  // Web specific components
  hba1cContainerWeb: { 
    marginBottom: 20,
    padding: 30, 
    backgroundColor: '#FFFFFF',
    borderRadius: 16, 
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  hba1cLabelWeb: { fontSize: 16, color: '#64748B', marginBottom: 8, fontWeight: '500' },
  hba1cValueWeb: { fontSize: 48, fontWeight: 'bold', color: '#10b981' },
  cardWeb: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 20,
  },
  listTitleWeb: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  subtextWeb: { fontSize: 13, color: '#64748B', marginBottom: 16 },
  legendTextWeb: { fontSize: 13, color: '#64748B' },
  emptyTextWeb: { textAlign: 'center', color: '#64748b', marginTop: 20 },
  latestReadingItemWeb: {
    borderColor: '#10b981',
    backgroundColor: '#ECFDF5',
  },

  // Mobile Header layout
  headerMobile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#020617', // Deep Space Navy base
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitleMobile: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 0.5 },
  iconBtn: {
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scrollContent: { paddingBottom: 100 },
  
  // Premium Glassmorphism styling tokens
  glassCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    marginTop: 4,
    padding: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  heroCardHighlight: {
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    borderColor: 'rgba(13, 148, 136, 0.3)',
  },
  adviceCardHighlight: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  glassLabelHighlight: { fontSize: 12, color: '#2DD4BF', fontWeight: '700', letterSpacing: 1 },
  glassHeroValue: { fontSize: 44, fontWeight: '800', color: '#2DD4BF', letterSpacing: -1 },
  
  // Critical Risk Card
  criticalRiskCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  criticalRiskTitle: { fontSize: 15, fontWeight: 'bold', color: '#FCA5A5', letterSpacing: 0.5 },
  criticalRiskText: { fontSize: 14, color: '#FEE2E2', lineHeight: 22, fontWeight: '600' },
  criticalRiskSubtext: { fontSize: 13, color: '#FCA5A5', marginTop: 8, fontStyle: 'italic', fontWeight: '500' },

  // Latest Hero Row Layout
  heroCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  livePulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2DD4BF' },
  heroTimestamp: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  heroMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroUnit: { fontSize: 18, fontWeight: '600', color: '#94A3B8' },
  heroTrendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  heroTrendText: { fontSize: 15, fontWeight: '800' },

  // Advice Card Layout
  adviceCardTitle: { fontSize: 14, fontWeight: 'bold', color: '#FBBF24', letterSpacing: 0.5 },
  adviceCardText: { fontSize: 14, color: '#F1F5F9', lineHeight: 20, fontWeight: '500' },
  adviceFoodContext: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(245, 158, 11, 0.15)' },
  adviceFoodContextText: { fontSize: 12, color: '#D97706', fontStyle: 'italic' },

  // Progress Bar Overhaul
  glassCardTitle: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  glassCardSubtitle: { fontSize: 13, color: '#94A3B8', marginBottom: 16 },
  progressBarContainer: { height: 14, flexDirection: 'row', borderRadius: 7, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 16 },
  progressSegment: { height: '100%' },
  progressLegend: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendTextMobile: { fontSize: 13, color: '#CBD5E1' },

  // LOGS LIST OVERHAUL: GRID & ITEM TOKENS
  gridHeaderMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  gridHeaderSubText: { fontSize: 12, color: '#2DD4BF', fontWeight: '600' },
  gridColHeaderRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingBottom: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.06)' 
  },
  gridColHeaderLabel: { fontSize: 11, color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  listContent: { gap: 10, paddingBottom: 10, marginTop: 4 },
  listItemWeb: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  
  // Premium Grid Item layout
  gridItemContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 14,
    paddingHorizontal: 12, 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.06)',
    position: 'relative',
    overflow: 'hidden',
  },
  gridTagStrip: { 
    position: 'absolute', 
    left: 0, 
    top: 12, 
    bottom: 12, 
    width: 4, 
    borderTopRightRadius: 2, 
    borderBottomRightRadius: 2 
  },
  
  // Grid Columns Alignment
  gridColDateTime: { width: 90, paddingLeft: 4 },
  gridDateText: { fontSize: 14, fontWeight: '700', color: '#F1F5F9' },
  gridTimeText: { fontSize: 11, color: '#94A3B8', marginTop: 2, fontWeight: '500' },
  
  gridColCarbs: { width: 44, alignItems: 'center' },
  gridValueSub: { fontSize: 13, color: '#CBD5E1', fontWeight: '600' },
  gridLabelTiny: { fontSize: 9, color: '#64748B', fontWeight: '700', marginTop: 1 },

  gridColTrend: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  gridTrendText: { fontSize: 11, fontWeight: '800', flexShrink: 1 },

  gridColGlucose: { width: 66, alignItems: 'flex-end' },
  gridGlucoseNum: { fontSize: 21, fontWeight: '900', letterSpacing: -0.5 },
  gridUnitTiny: { fontSize: 9, color: '#94A3B8', fontWeight: '600', marginTop: 1 },

  emptyTextMobile: { textAlign: 'center', color: '#64748B', marginTop: 20, fontStyle: 'italic' },

  // Floating Action Button
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  fabMobileGlass: {
    borderWidth: 1,
    borderColor: '#2DD4BF',
  }
});
