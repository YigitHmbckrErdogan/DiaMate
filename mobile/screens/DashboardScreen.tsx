import React, { useContext } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { DiabetesContext } from '../context/DiabetesContext';
import WebLayout from '../components/WebLayout';
import MealPlannerCore from '../components/MealPlannerCore';

const isWeb = Platform.OS === 'web';

export default function DashboardScreen({ navigation }: any) {
  const { logs } = useContext(DiabetesContext);

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
      return { color: '#E53E3E' }; // Red
    }
    return { color: '#0d9488' }; // Medical Teal (Safe)
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.readingItem}>
      <View>
        <Text style={styles.readingDate}>{item.date}</Text>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>{item.tag}</Text>
        </View>
      </View>
      <Text style={[styles.readingValue, getReadingStyle(item.value)]}>
        {item.value} mg/dL
      </Text>
    </View>
  );

  return (
    <WebLayout title="Dashboard">
      <SafeAreaView style={styles.container}>
        {/* Mobile Header */}
        {!isWeb && (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>DiaMate</Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity onPress={() => navigation.navigate('MealPlannerScreen')}>
                <Ionicons name="restaurant-outline" size={24} color="#333" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
                <Ionicons name="settings-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Prominent HbA1c Block (The Chart) */}
          <Animated.View entering={FadeInUp.duration(600).delay(100)} style={styles.hba1cContainer}>
            <Text style={styles.hba1cLabel}>Tahmini HbA1c</Text>
            <Text style={styles.hba1cValue}>%6.8</Text>
          </Animated.View>

          {/* Range Progress Bar */}
          <Animated.View entering={FadeInUp.duration(700).delay(200)} style={[styles.card, { marginHorizontal: isWeb ? 0 : 20, marginBottom: 20 }]}>
            <Text style={styles.listTitle}>Haftalık Hedef Aralığı (TIR)</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressSegment, { backgroundColor: '#ECC94B', width: `${lowPct}%` }]} />
              <View style={[styles.progressSegment, { backgroundColor: '#0d9488', width: `${safePct}%` }]} />
              <View style={[styles.progressSegment, { backgroundColor: '#E53E3E', width: `${highPct}%` }]} />
            </View>
            <View style={styles.progressLegend}>
              <Text style={styles.legendText}>Düşük: {lowPct}%</Text>
              <Text style={[styles.legendText, { fontWeight: 'bold', color: '#0d9488' }]}>Güvenli: {safePct}%</Text>
              <Text style={styles.legendText}>Yüksek: {highPct}%</Text>
            </View>
          </Animated.View>

          {/* Grid Layout for Web, Stack for Mobile */}
          <Animated.View entering={FadeInUp.duration(800).delay(300)} style={styles.rowLayout}>
            {/* Food Planner (Web Only on Dashboard) */}
            {isWeb && (
              <View style={[styles.card, styles.flexHalf]}>
                <MealPlannerCore />
              </View>
            )}

            {/* Readings List */}
            <View style={[isWeb ? styles.card : styles.mobileListContainer, isWeb && styles.flexHalf]}>
              <Text style={styles.listTitle}>Geçmiş Ölçümler</Text>
              <FlatList
                data={logs}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>Henüz kayıtlı ölçüm yok.</Text>}
                scrollEnabled={!isWeb} // Let parent scroll on web
              />
            </View>
          </Animated.View>
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity 
          style={styles.fab} 
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
    backgroundColor: '#F1F5F9', // Slate 100 for better glass contrast
    paddingTop: !isWeb ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  scrollContent: { paddingBottom: 80 },
  hba1cContainer: { 
    margin: isWeb ? 0 : 20, 
    marginBottom: 20,
    padding: 30, 
    backgroundColor: '#0f172a', // Deep Navy
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8, 
    elevation: 4 
  },
  hba1cLabel: { fontSize: 16, color: '#E0E8F5', marginBottom: 8 },
  hba1cValue: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  
  rowLayout: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 20,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    ...(isWeb ? { backdropFilter: 'blur(16px)' } as any : {}),
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  flexHalf: {
    flex: 1,
    minWidth: isWeb ? 400 : '100%',
  },
  mobileListContainer: { paddingHorizontal: 20 },
  listTitle: { fontSize: 18, fontWeight: '700', color: '#1A202C', marginBottom: 16 },
  listContent: { paddingBottom: 80 },
  readingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.9)', padding: 16, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)' },
  readingDate: { fontSize: 16, color: '#475569', marginBottom: 4 },
  tagBadge: { backgroundColor: '#E2E8F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  tagText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  readingValue: { fontSize: 22, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 20 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#0d9488', alignItems: 'center', justifyContent: 'center', shadowColor: '#0d9488', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
  progressBarContainer: { height: 12, flexDirection: 'row', borderRadius: 6, overflow: 'hidden', backgroundColor: '#E2E8F0', marginBottom: 12 },
  progressSegment: { height: '100%' },
  progressLegend: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  legendText: { fontSize: 13, color: '#64748B' },
});
