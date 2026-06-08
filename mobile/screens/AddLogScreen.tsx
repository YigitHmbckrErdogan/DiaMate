import React, { useState, useContext, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, Platform, StatusBar, ScrollView, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { DiabetesContext, LogTag } from '../context/DiabetesContext';
import { getClinicalInsight } from '../utils/ExpertAdviceEngine';
import { t } from '../utils/translations';

export default function AddLogScreen({ route, navigation }: any) {
  const { language, carbRatio, insulinSensitivityFactor, addLog, addFood } = useContext(DiabetesContext);

  const initialCarbs = route?.params?.carbs?.toString() || '';
  const initialTag = route?.params?.tag || 'Normal';

  const [bloodSugar, setBloodSugar] = useState('');
  const [carbs, setCarbs] = useState(initialCarbs);
  const [protein, setProtein] = useState('');
  const [fat, setFat] = useState('');
  const [tag, setTag] = useState<LogTag>(initialTag);
  const [insulinDose, setInsulinDose] = useState<string | null>(null);
  const [isExerciseMode, setIsExerciseMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const tags: LogTag[] = ['Fasting', 'Post-meal', 'Exercise', 'Normal'];

  const getTagTrans = (tg: LogTag) => {
    if (tg === 'Fasting') return t('tagFasting', language);
    if (tg === 'Post-meal') return t('tagPostMeal', language);
    if (tg === 'Exercise') return t('tagExercise', language);
    return t('tagNormal', language);
  };

  const calculateInsulin = () => {
    const bg = parseFloat(bloodSugar);
    const cb = parseFloat(carbs) || 0;
    
    if (isNaN(bg)) {
      setInsulinDose(t('pleaseEnterBg', language));
      return;
    }

    // Formula: (carbs / CR) + ((bloodSugar - 100) / ISF)
    let dose = (cb / carbRatio) + ((bg - 100) / insulinSensitivityFactor);
    if (isExerciseMode) {
      dose = dose * 0.8;
    }
    const finalDose = Math.max(0, dose).toFixed(1);
    setInsulinDose(`${finalDose} ${t('unitText', language)}`);
  };

  useEffect(() => {
    if (insulinDose !== null) {
      calculateInsulin();
    }
  }, [isExerciseMode, bloodSugar, carbs, language]);

  // Auto-scroll when dose is calculated to ensure save button is visible
  useEffect(() => {
    if (insulinDose !== null && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [insulinDose]);

  const handleToggleExercise = (val: boolean) => {
    setIsExerciseMode(val);
    if (val) {
      setTag('Exercise');
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    const bg = parseFloat(bloodSugar);
    if (isNaN(bg)) {
      Alert.alert(t('errTitle', language), t('errInvalidBg', language));
      return;
    }
    
    setIsSaving(true);
    try {
      const today = new Date();
      const dateStr = `${today.getDate()} ${today.toLocaleString(language === 'tr' ? 'tr-TR' : 'en-US', { month: 'short' })}`;
      
      // Save to Log
      await addLog({
        date: dateStr,
        value: bg,
        tag: tag
      });

      // Also optionally log to food database if macros are entered
      const cb = parseFloat(carbs);
      const pr = parseFloat(protein);
      const ft = parseFloat(fat);
      if (!isNaN(cb) || !isNaN(pr) || !isNaN(ft)) {
        await addFood({
          name: tag === 'Post-meal' ? t('mealLogPost', language) : t('mealLogNormal', language),
          carbs: isNaN(cb) ? 0 : cb,
          protein: isNaN(pr) ? undefined : pr,
          fat: isNaN(ft) ? undefined : ft,
          historicalDose: insulinDose ? parseFloat(insulinDose) || 0 : 0
        });
      }
      
      navigation.goBack();
    } catch (err) {
      console.log('Save cancelled or failed');
    } finally {
      setIsSaving(false);
    }
  };

  // Live Clinical Insight based on entered Protein and Fat
  const pVal = parseFloat(protein) || undefined;
  const fVal = parseFloat(fat) || undefined;
  const liveInsight = getClinicalInsight(pVal, fVal, language);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('addLogTitle', language)}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* SINGLE LARGE GLASSMORPHISM CARD CONSOLIDATING THE ENTIRE FORM */}
        <Animated.View entering={FadeInUp.duration(400).springify()} style={styles.singleGlassCard}>
          
          {/* Section 1: Glucose Input */}
          <View style={styles.sectionContainer}>
            <View style={styles.inputHeaderRow}>
              <Ionicons name="water" size={24} color="#2DD4BF" />
              <Text style={styles.glowingLabel}>{t('glucoseInputLabel', language)}</Text>
            </View>
            <TextInput 
              style={styles.darkNavyInput}
              keyboardType="numeric"
              placeholder={t('glucosePlaceholder', language)}
              placeholderTextColor="#64748B"
              value={bloodSugar}
              onChangeText={(txt) => { setBloodSugar(txt); }}
            />
          </View>

          <View style={styles.divider} />

          {/* Section 2: Nutrition Input */}
          <View style={styles.sectionContainer}>
            <View style={styles.inputHeaderRow}>
              <Ionicons name="restaurant" size={24} color="#2DD4BF" />
              <Text style={styles.glowingLabel}>{t('nutritionSection', language)}</Text>
            </View>

            <Text style={styles.subLabel}>{t('carbsLabel', language)}</Text>
            <TextInput 
              style={styles.darkNavyInput}
              keyboardType="numeric"
              placeholder={t('carbsPlaceholder', language)}
              placeholderTextColor="#64748B"
              value={carbs}
              onChangeText={setCarbs}
            />

            <View style={styles.macroRow}>
              <View style={styles.macroInputContainer}>
                <Text style={styles.subLabel}>{t('proteinLabel', language)}</Text>
                <TextInput 
                  style={styles.darkNavyInput}
                  keyboardType="numeric"
                  placeholder={t('optionalPlaceholder', language)}
                  placeholderTextColor="#64748B"
                  value={protein}
                  onChangeText={setProtein}
                />
              </View>
              <View style={styles.macroInputContainer}>
                <Text style={styles.subLabel}>{t('fatLabel', language)}</Text>
                <TextInput 
                  style={styles.darkNavyInput}
                  keyboardType="numeric"
                  placeholder={t('optionalPlaceholder', language)}
                  placeholderTextColor="#64748B"
                  value={fat}
                  onChangeText={setFat}
                />
              </View>
            </View>
          </View>

          {/* LIVE EXPERT ADVICE ENGINE BANNER TRIGGERED ON HIGH FAT/PROTEIN */}
          {liveInsight && (
            <Animated.View entering={FadeIn.duration(400)} style={styles.insightBanner}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Ionicons name="warning" size={24} color="#F59E0B" />
                <Text style={styles.insightBannerTitle}>{t('expertAlertTitle', language)}</Text>
              </View>
              <Text style={styles.insightBannerText}>{liveInsight}</Text>
            </Animated.View>
          )}

          <View style={styles.divider} />

          {/* Section 3: Tags & Exercise Toggle */}
          <View style={styles.sectionContainer}>
            <View style={styles.inputHeaderRow}>
              <Ionicons name="pricetag" size={24} color="#2DD4BF" />
              <Text style={styles.glowingLabel}>{t('tagSelectionLabel', language)}</Text>
            </View>
            <View style={styles.tagsContainer}>
              {tags.map((tItem) => (
                <TouchableOpacity 
                  key={tItem} 
                  style={[styles.tagButton, tag === tItem && styles.tagButtonActive]}
                  onPress={() => setTag(tItem)}
                >
                  <Text style={[styles.tagText, tag === tItem && styles.tagTextActive]}>{getTagTrans(tItem)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Exercise Mode Toggle */}
            <View style={styles.switchContainer}>
              <View style={styles.switchLabelRow}>
                <Ionicons name="fitness" size={26} color="#2DD4BF" />
                <Text style={styles.switchLabelText}>{t('exerciseModeLabel', language)}</Text>
              </View>
              <Switch
                value={isExerciseMode}
                onValueChange={handleToggleExercise}
                trackColor={{ false: 'rgba(255,255,255,0.08)', true: '#0D9488' }}
                thumbColor={isExerciseMode ? '#2DD4BF' : '#94A3B8'}
              />
            </View>

            {isExerciseMode && (
              <View style={styles.warningBanner}>
                <Ionicons name="information-circle" size={24} color="#38BDF8" />
                <Text style={styles.warningBannerText}>
                  {t('exerciseBannerText', language)}
                </Text>
              </View>
            )}
          </View>

          {/* Calculation Button styled with Emerald Neon gradient/colors */}
          <TouchableOpacity style={styles.calcButton} onPress={calculateInsulin}>
            <Text style={styles.calcButtonText}>{t('calcButtonText', language)}</Text>
          </TouchableOpacity>

          {/* Results Block */}
          {insulinDose !== null && (
            <Animated.View entering={FadeInUp.duration(400).springify()} style={styles.resultContainer}>
              <Text style={styles.resultLabel}>{t('recommendedDoseLabel', language)}</Text>
              <Text style={styles.resultValue}>{insulinDose}</Text>
              
              <TouchableOpacity 
                style={[styles.saveButton, isSaving && { opacity: 0.5 }]} 
                onPress={handleSave}
                disabled={isSaving}
              >
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>{isSaving ? 'Kaydediliyor...' : t('saveToLogBtn', language)}</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8', // Clinical Light Theme
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  iconBtn: {
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#F8FAFC',
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', letterSpacing: 0.5 },
  content: { padding: 20, paddingBottom: 60 },
  
  singleGlassCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 16,
  },
  inputHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  
  glowingLabel: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#0D9488', // Teal Dark
    letterSpacing: 0.5,
  },
  subLabel: { fontSize: 16, fontWeight: '600', color: '#64748B', marginBottom: 8, marginTop: 12 },
  
  darkNavyInput: { 
    backgroundColor: '#F8FAFC', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 14, 
    padding: 16, 
    fontSize: 18,
    color: '#1E293B',
    fontWeight: '600',
  },

  macroRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  macroInputContainer: { flex: 1 },

  insightBanner: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 18,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  insightBannerTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#D97706', letterSpacing: 0.5, flexShrink: 1, flexWrap: 'wrap' },
  insightBannerText: { flex: 1, fontSize: 16, color: '#92400E', lineHeight: 24, fontWeight: '500', flexShrink: 1, flexWrap: 'wrap' },

  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  tagButton: { 
    paddingVertical: 14, 
    paddingHorizontal: 20, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    backgroundColor: '#FFFFFF' 
  },
  tagButtonActive: { backgroundColor: '#F0FDFA', borderColor: '#2DD4BF' },
  tagText: { color: '#64748B', fontSize: 16, fontWeight: '600' },
  tagTextActive: { color: '#0F766E', fontWeight: 'bold' },

  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 20,
  },
  switchLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  switchLabelText: { fontSize: 18, fontWeight: '600', color: '#1E293B' },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    gap: 10,
  },
  warningBannerText: { flex: 1, fontSize: 16, color: '#0369A1', fontWeight: '600', lineHeight: 24, flexShrink: 1, flexWrap: 'wrap' },

  calcButton: { 
    backgroundColor: '#10B981', 
    borderColor: '#059669',
    borderWidth: 1,
    padding: 16, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginTop: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 3,
  },
  calcButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },

  resultContainer: { 
    marginTop: 20, 
    padding: 24, 
    backgroundColor: '#ECFDF5', 
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 20, 
    alignItems: 'center', 
  },
  resultLabel: { fontSize: 16, color: '#059669', fontWeight: '700', marginBottom: 12, letterSpacing: 1 },
  resultValue: { fontSize: 48, fontWeight: '900', color: '#047857', marginBottom: 24 },
  
  saveButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0D9488', 
    paddingVertical: 14, 
    paddingHorizontal: 32, 
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#0F766E',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});
