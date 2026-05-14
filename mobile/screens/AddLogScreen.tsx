import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, Platform, StatusBar, ScrollView, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { DiabetesContext, LogTag } from '../context/DiabetesContext';
import { getClinicalInsight } from '../utils/ExpertAdviceEngine';

export default function AddLogScreen({ navigation }: any) {
  const { carbRatio, insulinSensitivityFactor, addLog, addFood } = useContext(DiabetesContext);

  const [bloodSugar, setBloodSugar] = useState('');
  const [carbs, setCarbs] = useState('');
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [tag, setTag] = useState<LogTag>('Normal');
  const [insulinDose, setInsulinDose] = useState<string | null>(null);
  const [isExerciseMode, setIsExerciseMode] = useState(false);

  const tags: LogTag[] = ['Fasting', 'Post-meal', 'Exercise', 'Normal'];

  const calculateInsulin = () => {
    const bg = parseFloat(bloodSugar);
    const cb = parseFloat(carbs) || 0;
    
    if (isNaN(bg)) {
      setInsulinDose('Lütfen kan şekeri girin');
      return;
    }

    // Formula: (carbs / CR) + ((bloodSugar - 100) / ISF)
    let dose = (cb / carbRatio) + ((bg - 100) / insulinSensitivityFactor);
    if (isExerciseMode) {
      dose = dose * 0.8;
    }
    const finalDose = Math.max(0, dose).toFixed(1);
    setInsulinDose(`${finalDose} Ünite`);
  };

  useEffect(() => {
    if (insulinDose !== null && insulinDose.includes('Ünite')) {
      calculateInsulin();
    }
  }, [isExerciseMode, bloodSugar, carbs]);

  const handleToggleExercise = (val: boolean) => {
    setIsExerciseMode(val);
    if (val) {
      setTag('Exercise');
    }
  };

  const handleSave = async () => {
    const bg = parseFloat(bloodSugar);
    if (isNaN(bg)) {
      Alert.alert('Hata', 'Geçerli bir kan şekeri girmeniz gereklidir.');
      return;
    }
    
    const today = new Date();
    const dateStr = `${today.getDate()} ${today.toLocaleString('tr-TR', { month: 'short' })}`;
    
    // Save to Log
    await addLog({
      date: dateStr,
      value: bg,
      tag: tag
    });

    // Also optionally log to food database if macros are entered, keeping the dashboard's Expert Advice alerts in sync
    const cb = parseFloat(carbs);
    const pr = parseFloat(protein);
    const ft = parseFloat(fat);
    if (!isNaN(cb) || !isNaN(pr) || !isNaN(ft)) {
      await addFood({
        name: tag === 'Post-meal' ? 'Öğün Kaydı (Tokluk)' : 'Öğün Kaydı',
        carbs: isNaN(cb) ? 0 : cb,
        protein: isNaN(pr) ? undefined : pr,
        fat: isNaN(ft) ? undefined : ft,
        historicalDose: insulinDose ? parseFloat(insulinDose) || 0 : 0
      });
    }
    
    navigation.goBack();
  };

  // Live Clinical Insight based on entered Protein and Fat
  const pVal = parseFloat(protein) || undefined;
  const fVal = parseFloat(fat) || undefined;
  const liveInsight = getClinicalInsight(pVal, fVal);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Ölçüm Ekle</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Glucose Input Block */}
        <Animated.View entering={FadeInUp.duration(400).springify()} style={styles.glassCard}>
          <View style={styles.inputHeaderRow}>
            <Ionicons name="water" size={20} color="#FCA5A5" />
            <Text style={styles.label}>Kan Şekeri (mg/dL)</Text>
          </View>
          <TextInput 
            style={styles.input}
            keyboardType="numeric"
            placeholder="Örn: 120"
            placeholderTextColor="#64748B"
            value={bloodSugar}
            onChangeText={(txt) => { setBloodSugar(txt); }}
          />
        </Animated.View>

        {/* Meal & Macro Input Block */}
        <Animated.View entering={FadeInUp.duration(500).springify()} style={styles.glassCard}>
          <View style={styles.inputHeaderRow}>
            <Ionicons name="restaurant" size={20} color="#2DD4BF" />
            <Text style={styles.sectionTitle}>Besin Değerleri</Text>
          </View>

          <Text style={styles.subLabel}>Karbonhidrat (gr)</Text>
          <TextInput 
            style={styles.input}
            keyboardType="numeric"
            placeholder="Örn: 45"
            placeholderTextColor="#64748B"
            value={carbs}
            onChangeText={setCarbs}
          />

          <View style={styles.macroRow}>
            <View style={styles.macroInputContainer}>
              <Text style={styles.subLabel}>Protein (gr)</Text>
              <TextInput 
                style={styles.input}
                keyboardType="numeric"
                placeholder="Opsiyonel"
                placeholderTextColor="#64748B"
                value={protein}
                onChangeText={setProtein}
              />
            </View>
            <View style={styles.macroInputContainer}>
              <Text style={styles.subLabel}>Yağ (gr)</Text>
              <TextInput 
                style={styles.input}
                keyboardType="numeric"
                placeholder="Opsiyonel"
                placeholderTextColor="#64748B"
                value={fat}
                onChangeText={setFat}
              />
            </View>
          </View>
        </Animated.View>

        {/* LIVE EXPERT ADVICE ENGINE BANNER TRIGGERED ON HIGH FAT/PROTEIN */}
        {liveInsight && (
          <Animated.View entering={FadeIn.duration(400)} style={styles.insightBanner}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Ionicons name="warning" size={22} color="#F59E0B" />
              <Text style={styles.insightBannerTitle}>EXPERT ADVICE ALERT</Text>
            </View>
            <Text style={styles.insightBannerText}>{liveInsight}</Text>
          </Animated.View>
        )}

        {/* Tags Block */}
        <Animated.View entering={FadeInUp.duration(600).springify()} style={styles.glassCard}>
          <Text style={styles.subLabel}>Etiket Seçimi</Text>
          <View style={styles.tagsContainer}>
            {tags.map((t) => (
              <TouchableOpacity 
                key={t} 
                style={[styles.tagButton, tag === t && styles.tagButtonActive]}
                onPress={() => setTag(t)}
              >
                <Text style={[styles.tagText, tag === t && styles.tagTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Exercise Mode Toggle */}
          <View style={styles.switchContainer}>
            <View style={styles.switchLabelRow}>
              <Ionicons name="fitness" size={22} color="#2DD4BF" />
              <Text style={styles.switchLabelText}>Exercise Mode</Text>
            </View>
            <Switch
              value={isExerciseMode}
              onValueChange={handleToggleExercise}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#0D9488' }}
              thumbColor={isExerciseMode ? '#2DD4BF' : '#94A3B8'}
            />
          </View>

          {isExerciseMode && (
            <View style={styles.warningBanner}>
              <Ionicons name="information-circle" size={20} color="#38BDF8" />
              <Text style={styles.warningBannerText}>
                Clinical Insight: Exercise mode active. Dose reduced by 20% to prevent delayed hypoglycemia.
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Calculation Button */}
        <Animated.View entering={FadeInUp.duration(700).springify()}>
          <TouchableOpacity style={styles.calcButton} onPress={calculateInsulin}>
            <Text style={styles.calcButtonText}>İnsülin Dozunu Hesapla</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Results Block */}
        {insulinDose !== null && (
          <Animated.View entering={FadeInUp.duration(400).springify()} style={styles.resultContainer}>
            <Text style={styles.resultLabel}>ÖNERİLEN İNSÜLİN DOZU</Text>
            <Text style={styles.resultValue}>{insulinDose}</Text>
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Günlüğe Kaydet</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Global Deep Navy
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 0.5 },
  content: { padding: 20, paddingBottom: 60 },
  
  // Glassmorphic Base
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 20,
    marginBottom: 20,
  },
  inputHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  label: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2DD4BF' },
  subLabel: { fontSize: 13, fontWeight: '600', color: '#94A3B8', marginBottom: 6, marginTop: 8 },
  
  input: { 
    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.15)', 
    borderRadius: 12, 
    padding: 14, 
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  macroRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  macroInputContainer: { flex: 1 },

  // Live Expert Advice Banner
  insightBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  insightBannerTitle: { fontSize: 14, fontWeight: 'bold', color: '#FBBF24', letterSpacing: 0.5 },
  insightBannerText: { fontSize: 14, color: '#F8FAFC', lineHeight: 20, fontWeight: '500' },

  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  tagButton: { 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.15)', 
    backgroundColor: 'rgba(255, 255, 255, 0.03)' 
  },
  tagButtonActive: { backgroundColor: '#0D9488', borderColor: '#2DD4BF' },
  tagText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  tagTextActive: { color: '#FFFFFF', fontWeight: 'bold' },

  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: 20,
  },
  switchLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  switchLabelText: { fontSize: 15, fontWeight: '600', color: '#E2E8F0' },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    gap: 10,
  },
  warningBannerText: { flex: 1, fontSize: 13, color: '#38BDF8', fontWeight: '600', lineHeight: 18 },

  calcButton: { 
    backgroundColor: 'rgba(255, 255, 255, 0.08)', 
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    padding: 16, 
    borderRadius: 16, 
    alignItems: 'center', 
  },
  calcButtonText: { color: '#2DD4BF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },

  resultContainer: { 
    marginTop: 20, 
    padding: 24, 
    backgroundColor: 'rgba(13, 148, 136, 0.1)', 
    borderColor: '#0D9488',
    borderWidth: 1,
    borderRadius: 20, 
    alignItems: 'center', 
  },
  resultLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '700', marginBottom: 8, letterSpacing: 1 },
  resultValue: { fontSize: 36, fontWeight: '900', color: '#2DD4BF', marginBottom: 20 },
  
  saveButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0D9488', 
    paddingVertical: 14, 
    paddingHorizontal: 32, 
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2DD4BF',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
