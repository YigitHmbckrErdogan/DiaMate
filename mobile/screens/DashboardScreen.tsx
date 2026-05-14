import React, { useContext } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { DiabetesContext } from '../context/DiabetesContext';
import WebLayout from '../components/WebLayout';
import MealPlannerCore from '../components/MealPlannerCore';
import { getClinicalInsight } from '../utils/ExpertAdviceEngine';

const isWeb = Platform.OS === 'web';

export default function DashboardScreen({ navigation }: any) {
  const { logs, foodDatabase } = useContext(DiabetesContext);

  // Range Progress Bar Logic (Weekly)
  const currentYear = new Date().getFullYear();
  const getDaysDiff = (dateStr: string) => {
    const date = new Date(`${dateStr} ${currentYear}`);
    if (isNaN(date.getTime())) return 0;
    if (date > new Date()) date.setFullYear(currentYear - 1);
    return Math.ceil(Math.abs(Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  const weeklyLogs = logs.filter(log => getDaysDiff(log.date) <= 7);
  const totalWeekly = weeklyLogs.length || 1; // avoid division by zero
  
  const lowCount = weeklyLogs.filter(log => log.value < 70).length;
  const highCount = weeklyLogs.filter(log => log.value > 180).length;
  const safeCount = weeklyLogs.filter(log => log.value >= 70 && log.value <= 180).length;

  const lowPct = Math.round((lowCount / totalWeekly) * 100);
  const safePct = weeklyLogs.length ? Math.round((safeCount / totalWeekly) * 100) : 100;
  const highPct = weeklyLogs.length ? Math.round((highCount / totalWeekly) * 100) : 0;

  const getReadingStyle = (value: number) => {
    if (value < 70 || value > 180) {
      return { color: isWeb ? '#ef4444' : '#FCA5A5' }; // Bright crimson/rose
    }
    return { color: isWeb ? '#10b981' : '#2DD4BF' }; // Emerald/Teal bright
  };

  const getTrendContent = (current: number, previous?: number) => {
    if (previous === undefined) return { label: 'Stable', icon: 'arrow-forward', color: isWeb ? '#10b981' : '#2DD4BF' };
    const diff = current - previous;
    if (diff > 10) return { label: 'Rising', icon: 'arrow-up', color: isWeb ? '#ef4444' : '#F87171' };
    if (diff < -10) return { label: 'Falling', icon: 'arrow-down', color: isWeb ? '#3b82f6' : '#60A5FA' };
    return { label: 'Stable', icon: 'arrow-forward', color: isWeb ? '#10b981' : '#2DD4BF' };
  };

  // Latest reading and its trend
  const latestLog = logs.length > 0 ? logs[0] : null;
  const previousToLatestLog = logs.length > 1 ? logs[1] : undefined;
  const latestTrend = latestLog ? getTrendContent(latestLog.value, previousToLatestLog?.value) : null;

  // Inspect latest added food item for high-fat/protein Expert Advice Engine alerts
  const latestFood = foodDatabase.length > 0 ? foodDatabase[0] : null;
  const activeClinicalInsight = latestFood ? getClinicalInsight(latestFood.protein, latestFood.fat) : null;

  const renderPastReadingItem = ({ item, index }: any) => {
    // Skip index 0 on mobile if rendered inside the prominent latest hero card, but let's list all or starting from index 1 to avoid duplication
    // On web we keep the simple full list inside its card
    const previousLog = logs.length > index + 1 ? logs[index + 1] : undefined;
    const trend = getTrendContent(item.value, previousLog?.value);
    const isLatest = index === 0;

    return (
      <View style={[styles.readingItem, isLatest && (isWeb ? styles.latestReadingItemWeb : styles.latestReadingItemMobile)]}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.readingDate, !isWeb && { color: '#E2E8F0' }]}>{item.date}</Text>
            {isLatest && (
              <View style={styles.latestBadge}>
                <Text style={styles.latestBadgeText}>Son Ölçüm</Text>
              </View>
            )}
          </View>
          <View style={[styles.tagBadge, !isWeb && { backgroundColor: 'rgba(255,255,255,0.1)' }, { marginTop: 4 }]}>
            <Text style={[styles.tagText, !isWeb && { color: '#CBD5E1' }]}>{item.tag}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {trend && (
            <View style={[styles.trendContainer, { backgroundColor: trend.color + (isWeb ? '1A' : '26') }]}>
              <Ionicons name={trend.icon as any} size={14} color={trend.color} />
              <Text style={[styles.trendText, { color: trend.color }]}>{trend.label}</Text>
            </View>
          )}
          <Text style={[styles.readingValue, getReadingStyle(item.value)]}>
            {item.value} mg/dL
          </Text>
        </View>
      </View>
    );
  };

  // Past readings excluding the latest hero reading on mobile to make the layout pristine
  const pastLogsForMobile = logs.length > 1 ? logs.slice(1) : [];

  return (
    <WebLayout title="Dashboard">
      <SafeAreaView style={styles.container}>
        {/* Mobile Header */}
        {!isWeb && (
          <View style={styles.headerMobile}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="medical" size={24} color="#0D9488" />
              <Text style={styles.headerTitleMobile}>DiaMate <Text style={{ color: '#0D9488', fontWeight: '300' }}>PRO</Text></Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
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
          {/* Prominent HbA1c Block */}
          <Animated.View entering={FadeInUp.duration(600).springify()} style={isWeb ? styles.hba1cContainerWeb : styles.glassCard}>
            <Text style={isWeb ? styles.hba1cLabelWeb : styles.glassLabel}>Tahmini HbA1c</Text>
            <Text style={isWeb ? styles.hba1cValueWeb : styles.glassHeroValue}>%6.8</Text>
            {!isWeb && <Text style={styles.subtextTeal}>Excellent clinical range</Text>}
          </Animated.View>

          {/* LATEST READING HERO CARD WITH PROMINENT TREND ARROWS (MOBILE SPECIFIC OVERHAUL) */}
          {!isWeb && latestLog && (
            <Animated.View entering={FadeInUp.duration(650).springify()} style={[styles.glassCard, styles.heroCardHighlight]}>
              <View style={styles.heroCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={styles.livePulseDot} />
                  <Text style={styles.glassLabelHighlight}>LATEST GLUCOSE READING</Text>
                </View>
                <Text style={styles.heroTimestamp}>{latestLog.date}</Text>
              </View>

              <View style={styles.heroMainRow}>
                <Text style={[styles.heroGlucoseValue, getReadingStyle(latestLog.value)]}>
                  {latestLog.value} <Text style={styles.heroUnit}>mg/dL</Text>
                </Text>

                {/* Dynamically Integrated Trend Arrows Next to Reading */}
                {latestTrend && (
                  <View style={[styles.heroTrendBadge, { borderColor: latestTrend.color, backgroundColor: latestTrend.color + '1A' }]}>
                    <Ionicons name={latestTrend.icon as any} size={24} color={latestTrend.color} />
                    <Text style={[styles.heroTrendText, { color: latestTrend.color }]}>{latestTrend.label}</Text>
                  </View>
                )}
              </View>

              <View style={[styles.tagBadge, { backgroundColor: 'rgba(13, 148, 136, 0.2)', alignSelf: 'flex-start', marginTop: 12 }]}>
                <Text style={{ color: '#2DD4BF', fontSize: 13, fontWeight: '600' }}>Tag: {latestLog.tag}</Text>
              </View>
            </Animated.View>
          )}

          {/* EXPERT ADVICE ENGINE CLINICAL ALERT CARD */}
          {!isWeb && activeClinicalInsight && (
            <Animated.View entering={FadeIn.duration(700)} style={[styles.glassCard, styles.adviceCardHighlight]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Ionicons name="warning" size={20} color="#FBBF24" />
                <Text style={styles.adviceCardTitle}>EXPERT CLINICAL ADVICE</Text>
              </View>
              <Text style={styles.adviceCardText}>{activeClinicalInsight}</Text>
              <View style={styles.adviceFoodContext}>
                <Text style={styles.adviceFoodContextText}>
                  Triggered by: {latestFood?.name} ({latestFood?.protein || 0}g Protein, {latestFood?.fat || 0}g Fat)
                </Text>
              </View>
            </Animated.View>
          )}

          {/* SLEEK TIR MOBILE PROGRESS BAR */}
          <Animated.View entering={FadeInUp.duration(750).springify()} style={isWeb ? styles.cardWeb : styles.glassCard}>
            <Text style={isWeb ? styles.listTitleWeb : styles.glassCardTitle}>Time in Range Analytics (TIR)</Text>
            <Text style={isWeb ? styles.subtextWeb : styles.glassCardSubtitle}>Haftalık Hedef Aralığı (70 - 180 mg/dL)</Text>
            
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressSegment, { backgroundColor: isWeb ? '#ef4444' : '#F87171', width: `${lowPct}%` }]} />
              <View style={[styles.progressSegment, { backgroundColor: isWeb ? '#10b981' : '#0D9488', width: `${safePct}%` }]} />
              <View style={[styles.progressSegment, { backgroundColor: isWeb ? '#ef4444' : '#F87171', width: `${highPct}%` }]} />
            </View>

            <View style={styles.progressLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: isWeb ? '#ef4444' : '#F87171' }]} />
                <Text style={isWeb ? styles.legendTextWeb : styles.legendTextMobile}>Düşük: {lowPct}%</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: isWeb ? '#10b981' : '#2DD4BF' }]} />
                <Text style={[isWeb ? styles.legendTextWeb : styles.legendTextMobile, { fontWeight: 'bold', color: isWeb ? '#10b981' : '#2DD4BF' }]}>Güvenli: {safePct}%</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: isWeb ? '#ef4444' : '#F87171' }]} />
                <Text style={isWeb ? styles.legendTextWeb : styles.legendTextMobile}>Yüksek: {highPct}%</Text>
              </View>
            </View>
          </Animated.View>

          {/* Grid Layout for Web, Stack for Mobile */}
          <Animated.View entering={FadeInUp.duration(800).springify()} style={styles.rowLayout}>
            {/* Food Planner (Web Only on Dashboard) */}
            {isWeb && (
              <View style={[styles.cardWeb, styles.flexHalf]}>
                <MealPlannerCore />
              </View>
            )}

            {/* Readings List */}
            <View style={[isWeb ? styles.cardWeb : styles.mobileListContainer, isWeb && styles.flexHalf]}>
              <Text style={isWeb ? styles.listTitleWeb : styles.glassSectionHeader}>
                {isWeb ? 'Geçmiş Ölçümler' : (latestLog ? 'Önceki Ölçümler' : 'Geçmiş Ölçümler')}
              </Text>
              <FlatList
                data={isWeb ? logs : pastLogsForMobile}
                renderItem={renderPastReadingItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={isWeb ? styles.emptyTextWeb : styles.emptyTextMobile}>Henüz kayıtlı ölçüm yok.</Text>}
                scrollEnabled={!isWeb} // Let parent scroll on web
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
    // Apply Deep Navy globally on mobile, crisp slate 50 on web
    backgroundColor: isWeb ? '#F8FAFC' : '#0F172A', 
    paddingTop: !isWeb ? StatusBar.currentHeight : 0,
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

  // Mobile Pro Glassmorphism UI
  headerMobile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
  glassLabel: { fontSize: 14, color: '#94A3B8', fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
  glassLabelHighlight: { fontSize: 12, color: '#2DD4BF', fontWeight: '700', letterSpacing: 1 },
  glassHeroValue: { fontSize: 44, fontWeight: '800', color: '#2DD4BF', letterSpacing: -1 },
  subtextTeal: { fontSize: 12, color: '#0D9488', fontWeight: '500', marginTop: 2 },
  
  // Latest Hero Row Layout
  heroCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  livePulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2DD4BF' },
  heroTimestamp: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  heroMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroGlucoseValue: { fontSize: 48, fontWeight: '900', letterSpacing: -1 },
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

  rowLayout: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 20,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  flexHalf: {
    flex: 1,
    minWidth: isWeb ? 400 : '100%',
  },
  mobileListContainer: { paddingHorizontal: 20, width: '100%' },
  glassSectionHeader: { fontSize: 16, fontWeight: '700', color: '#94A3B8', marginBottom: 12, marginTop: 8, textTransform: 'uppercase', letterSpacing: 1 },
  listContent: { paddingBottom: 20 },
  
  readingItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: isWeb ? '#FFFFFF' : 'rgba(255, 255, 255, 0.04)', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: isWeb ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)',
  },
  latestReadingItemMobile: {
    borderColor: 'rgba(13, 148, 136, 0.4)',
    backgroundColor: 'rgba(13, 148, 136, 0.06)',
  },
  readingDate: { fontSize: 16, color: '#475569', fontWeight: '600' },
  latestBadge: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  latestBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  tagBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  tagText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  readingValue: { fontSize: 20, fontWeight: 'bold' },
  emptyTextMobile: { textAlign: 'center', color: '#64748b', marginTop: 20, fontStyle: 'italic' },
  
  fab: { 
    position: 'absolute', 
    bottom: 30, 
    right: 30, 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    backgroundColor: '#0D9488', 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#0D9488', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 8, 
    elevation: 5 
  },
  fabMobileGlass: {
    borderWidth: 1,
    borderColor: '#2DD4BF',
    backgroundColor: '#0D9488',
  }
});
