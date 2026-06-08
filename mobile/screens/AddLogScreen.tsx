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
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
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
              <Ionicons name="water" size={20} color="#2DD4BF" />
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
              <Ionicons name="restaurant" size={20} color="#2DD4BF" />
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
                <Ionicons name="warning" size={22} color="#F59E0B" />
                <Text style={styles.insightBannerTitle}>{t('expertAlertTitle', language)}</Text>
              </View>
              <Text style={styles.insightBannerText}>{liveInsight}</Text>
            </Animated.View>
          )}

          <View style={styles.divider} />

          {/* Section 3: Tags & Exercise Toggle */}
          <View style={styles.sectionContainer}>
            <View style={styles.inputHeaderRow}>
              <Ionicons name="pricetag" size={20} color="#2DD4BF" />
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
                <Ionicons name="fitness" size={22} color="#2DD4BF" />
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
                <Ionicons name="information-circle" size={20} color="#38BDF8" />
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
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
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
    backgroundColor: '#020617', // Unified Global Theme: Deep Space Navy
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#020617',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
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
  
  // Unified single Glassmorphism card container
  singleGlassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 16,
  },

  inputHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  
  // Glowing Teal text labels
  glowingLabel: { 
    fontSize: 17, 
    fontWeight: '800', 
    color: '#2DD4BF',
    textShadowColor: 'rgba(45, 212, 191, 0.45)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    letterSpacing: 0.5,
  },
  subLabel: { fontSize: 13, fontWeight: '600', color: '#94A3B8', marginBottom: 6, marginTop: 8 },
  
  // Dark navy input fields
  darkNavyInput: { 
    backgroundColor: 'rgba(2, 6, 23, 0.75)', 
    borderWidth: 1, 
    borderColor: 'rgba(45, 212, 191, 0.25)', 
    borderRadius: 14, 
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
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  insightBannerTitle: { fontSize: 14, fontWeight: 'bold', color: '#FBBF24', letterSpacing: 0.5 },
  insightBannerText: { fontSize: 14, color: '#F8FAFC', lineHeight: 20, fontWeight: '500' },

  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  tagButton: { 
    paddingVertical: 12, 
    paddingHorizontal: 18, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.1)', 
    backgroundColor: 'rgba(0, 0, 0, 0.3)' 
  },
  tagButtonActive: { backgroundColor: '#0D9488', borderColor: '#2DD4BF' },
  tagText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  tagTextActive: { color: '#FFFFFF', fontWeight: 'bold' },

  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
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

  // Emerald Neon primary button
  calcButton: { 
    backgroundColor: '#10B981', 
    borderColor: '#34D399',
    borderWidth: 1,
    padding: 16, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginTop: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  calcButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },

  resultContainer: { 
    marginTop: 20, 
    padding: 24, 
    backgroundColor: 'rgba(16, 185, 129, 0.08)', 
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 20, 
    alignItems: 'center', 
  },
  resultLabel: { fontSize: 13, color: '#94A3B8', fontWeight: '700', marginBottom: 8, letterSpacing: 1 },
  resultValue: { fontSize: 36, fontWeight: '900', color: '#10B981', marginBottom: 20 },
  
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
