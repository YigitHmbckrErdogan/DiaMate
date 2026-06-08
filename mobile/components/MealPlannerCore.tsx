import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Platform, Alert, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { DiabetesContext, FoodItem } from '../context/DiabetesContext';
import { getClinicalInsight } from '../utils/ExpertAdviceEngine';
import { t } from '../utils/translations';

interface SelectedFood extends FoodItem {
  quantity: number;
}

export default function MealPlannerCore() {
  const { language, foodDatabase, addFood } = useContext(DiabetesContext);
  const navigation = useNavigation<any>();

  // New Food Form State
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodCarbs, setNewFoodCarbs] = useState('');
  const [newFoodProtein, setNewFoodProtein] = useState('');
  const [newFoodFat, setNewFoodFat] = useState('');
  const [newFoodDose, setNewFoodDose] = useState('');

  // Selected Meal State
  const [selectedMeal, setSelectedMeal] = useState<SelectedFood[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExerciseMode, setIsExerciseMode] = useState(false);

  const filteredFoods = foodDatabase.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddFood = () => {
    const carbs = parseFloat(newFoodCarbs);
    const protein = parseFloat(newFoodProtein);
    const fat = parseFloat(newFoodFat);
    const dose = parseFloat(newFoodDose);
    if (!newFoodName.trim() || isNaN(carbs) || isNaN(dose)) {
      Alert.alert(t('errTitle', language), t('errInvalidFoodFields', language));
      return;
    }
    
    addFood({ 
      name: newFoodName, 
      carbs, 
      protein: isNaN(protein) ? undefined : protein,
      fat: isNaN(fat) ? undefined : fat,
      historicalDose: dose 
    });
    setNewFoodName('');
    setNewFoodCarbs('');
    setNewFoodProtein('');
    setNewFoodFat('');
    setNewFoodDose('');
    
    const successMsg = t('foodAddedSuccess', language);
    if (Platform.OS === 'web') {
      alert(successMsg);
    } else {
      Alert.alert(t('successTitle', language), successMsg);
    }
  };

  const addToMeal = (food: FoodItem) => {
    const exists = selectedMeal.find(item => item.id === food.id);
    if (exists) {
      setSelectedMeal(selectedMeal.map(item => item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setSelectedMeal([...selectedMeal, { ...food, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setSelectedMeal(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQ = item.quantity + delta;
          return { ...item, quantity: newQ > 0 ? newQ : 0 };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const totalCarbs = selectedMeal.reduce((sum, item) => sum + (item.carbs * item.quantity), 0);
  const totalProtein = selectedMeal.reduce((sum, item) => sum + ((item.protein || 0) * item.quantity), 0);
  const totalFat = selectedMeal.reduce((sum, item) => sum + ((item.fat || 0) * item.quantity), 0);
  const baseDose = selectedMeal.reduce((sum, item) => sum + (item.historicalDose * item.quantity), 0);
  const totalDose = isExerciseMode ? baseDose * 0.8 : baseDose;

  const insight = getClinicalInsight(totalProtein, totalFat, language);

  return (
    <View style={styles.mainWrapper}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Top Section: Food Database Search prominently at the top */}
        <View style={isWeb ? styles.cardWeb : styles.glassCard}>
            <Text style={isWeb ? styles.sectionTitleWeb : styles.glassSectionTitle}>{t('databaseSection', language)}</Text>
            <TextInput 
              style={[isWeb ? styles.inputWeb : styles.glassInput, { marginBottom: 12 }]} 
              placeholder={t('searchPlaceholder', language)} 
              placeholderTextColor={isWeb ? '#94A3B8' : '#64748B'}
              value={searchQuery}
              onChangeText={setSearchQuery} 
            />
            <View style={styles.list}>
              {filteredFoods.map((item) => (
                <Pressable key={item.id} onPress={() => addToMeal(item)} style={({hovered}: any) => [isWeb ? styles.listItemWeb : styles.glassListItem, hovered && styles.listItemHover] as any}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={isWeb ? styles.foodNameWeb : styles.glassFoodName}>{item.name}</Text>
                    <Text style={isWeb ? styles.foodDetailsWeb : styles.glassFoodDetails}>{item.carbs}g CHO | {item.historicalDose} {t('unitText', language)}</Text>
                  </View>
                  <Ionicons name="add-circle" size={28} color="#10B981" />
                </Pressable>
              ))}
            </View>
        </View>

        {/* Selected Meal List in Scrollable Area */}
        <View style={isWeb ? styles.cardWeb : styles.glassCard}>
            <Text style={isWeb ? styles.sectionTitleWeb : styles.glassSectionTitle}>{t('selectedMealSection', language)}</Text>
            <View style={styles.list}>
              {selectedMeal.length === 0 ? (
                <Text style={isWeb ? styles.emptyTextWeb : styles.glassEmptyText}>{t('emptyMealText', language)}</Text>
              ) : (
                selectedMeal.map(item => (
                  <View key={item.id} style={isWeb ? styles.selectedItemWeb : styles.glassSelectedItem}>
                    <View style={styles.selectedInfo}>
                      <Text style={isWeb ? styles.foodNameWeb : styles.glassFoodName}>{item.name}</Text>
                      <Text style={isWeb ? styles.foodDetailsWeb : styles.glassFoodDetails}>{(item.carbs * item.quantity).toFixed(1)}g CHO</Text>
                    </View>
                    
                    {/* REDESIGNED STEPPER CONTROLS */}
                    <View style={styles.stepperControls}>
                      <Pressable onPress={() => updateQuantity(item.id, -1)} style={styles.stepperBtn}>
                        <Ionicons name="remove" size={20} color="#FFFFFF" />
                      </Pressable>
                      <Text style={styles.stepperText}>{item.quantity}</Text>
                      <Pressable onPress={() => updateQuantity(item.id, 1)} style={styles.stepperBtn}>
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>
        </View>

        {/* Bottom Section: Create Custom Food */}
        <View style={isWeb ? styles.cardWeb : styles.glassCard}>
          <Text style={isWeb ? styles.sectionTitleWeb : styles.glassSectionTitle}>{t('addNewFoodSection', language)}</Text>
          <View style={styles.formRow}>
            <View style={styles.inputGroup}>
              <Text style={isWeb ? styles.labelWeb : styles.glassLabel}>{t('foodNameInputLabel', language)}</Text>
              <TextInput 
                style={isWeb ? styles.inputWeb : styles.glassInput} 
                value={newFoodName} 
                onChangeText={setNewFoodName} 
                placeholder={t('foodNamePlaceholder', language)} 
                placeholderTextColor={isWeb ? '#94A3B8' : '#64748B'}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={isWeb ? styles.labelWeb : styles.glassLabel}>{t('carbsLabel', language)}</Text>
              <TextInput 
                style={isWeb ? styles.inputWeb : styles.glassInput} 
                value={newFoodCarbs} 
                onChangeText={setNewFoodCarbs} 
                keyboardType="numeric" 
                placeholder="20" 
                placeholderTextColor={isWeb ? '#94A3B8' : '#64748B'}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={isWeb ? styles.labelWeb : styles.glassLabel}>{t('proteinLabel', language)}</Text>
              <TextInput 
                style={isWeb ? styles.inputWeb : styles.glassInput} 
                value={newFoodProtein} 
                onChangeText={setNewFoodProtein} 
                keyboardType="numeric" 
                placeholder={t('optionalPlaceholder', language)} 
                placeholderTextColor={isWeb ? '#94A3B8' : '#64748B'}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={isWeb ? styles.labelWeb : styles.glassLabel}>{t('fatLabel', language)}</Text>
              <TextInput 
                style={isWeb ? styles.inputWeb : styles.glassInput} 
                value={newFoodFat} 
                onChangeText={setNewFoodFat} 
                keyboardType="numeric" 
                placeholder={t('optionalPlaceholder', language)} 
                placeholderTextColor={isWeb ? '#94A3B8' : '#64748B'}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={isWeb ? styles.labelWeb : styles.glassLabel}>{t('doseInputLabel', language)}</Text>
              <TextInput 
                style={isWeb ? styles.inputWeb : styles.glassInput} 
                value={newFoodDose} 
                onChangeText={setNewFoodDose} 
                keyboardType="numeric" 
                placeholder="2.0" 
                placeholderTextColor={isWeb ? '#94A3B8' : '#64748B'}
              />
            </View>
            <View style={[styles.inputGroup, { justifyContent: 'flex-end' }]}>
              <Pressable onPress={handleAddFood} style={({hovered}: any) => [isWeb ? styles.primaryButtonWeb : styles.glassPrimaryButton, hovered && styles.buttonHover] as any}>
                <Text style={styles.primaryButtonText}>{t('addBtn', language)}</Text>
              </Pressable>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* STICKY FOOTER (CART PATTERN) */}
      <View style={styles.stickyFooter}>
        <View style={isWeb ? styles.summaryBoxWeb : styles.glassSummaryBox}>
          <View style={styles.summaryRow}>
            <Text style={isWeb ? styles.summaryLabelWeb : styles.glassSummaryLabel}>{t('totalCarbsLabel', language)}</Text>
            <Text style={isWeb ? styles.summaryValueWeb : styles.glassSummaryValue}>{totalCarbs.toFixed(1)}g</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={isWeb ? styles.summaryLabelWeb : styles.glassSummaryLabel}>{t('estDoseLabel', language)}</Text>
            <Text style={[isWeb ? styles.summaryValueWeb : styles.glassSummaryValue, { color: '#10B981' }]}>{totalDose.toFixed(1)} {t('unitText', language)}</Text>
          </View>
        </View>

        {/* Exercise Mode Toggle */}
        <View style={isWeb ? styles.switchContainerWeb : styles.glassSwitchContainer}>
          <View style={styles.switchLabelRow}>
            <Ionicons name="fitness" size={20} color="#2DD4BF" />
            <Text style={isWeb ? styles.switchLabelTextWeb : styles.glassSwitchLabelText}>{t('exerciseModeLabel', language)}</Text>
          </View>
          <Switch
            value={isExerciseMode}
            onValueChange={setIsExerciseMode}
            trackColor={{ false: isWeb ? '#cbd5e1' : '#E2E8F0', true: '#0D9488' }}
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

        {insight && (
          <View style={styles.insightBox}>
            <Ionicons name="warning" size={22} color="#F59E0B" />
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        )}

        {/* Contextual CTA Button ALWAYS at the bottom */}
        {selectedMeal.length > 0 && (
          <Pressable 
            onPress={() => navigation.navigate('AddLogScreen', { carbs: totalCarbs.toFixed(1), tag: 'Post-meal' })}
            style={({hovered}: any) => [
              styles.ctaButton, 
              hovered && styles.buttonHover
            ] as any}
          >
            <Text style={styles.ctaButtonText}>🍽️ Bunları Şimdi Yiyorum</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#F4F6F8',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 320, // Huge padding to allow scrolling past the sticky footer
  },
  
  // Web Card tokens
  cardWeb: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitleWeb: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  labelWeb: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 8 },
  inputWeb: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, fontSize: 15, color: '#1E293B' },
  primaryButtonWeb: { backgroundColor: '#10b981', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  
  // Mobile Premium Clinical Light tokens
  glassCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  glassSectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 16, letterSpacing: 0.5 },
  glassLabel: { fontSize: 14, fontWeight: '700', color: '#64748B', marginBottom: 8 },
  glassInput: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    padding: 14, 
    fontSize: 15, 
    color: '#1E293B',
    fontWeight: '600'
  },
  glassPrimaryButton: { 
    backgroundColor: '#10B981', 
    paddingVertical: 14, 
    paddingHorizontal: 20, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#059669',
  },

  formRow: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 16,
    flexWrap: 'wrap',
  },
  inputGroup: { flex: 1, minWidth: isWeb ? 150 : '100%' },
  buttonHover: { opacity: 0.8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  
  list: { flexGrow: 1, marginTop: 4 },
  
  // List Item web vs mobile glass
  listItemWeb: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', cursor: 'pointer' },
  glassListItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 14, 
    paddingHorizontal: 12,
    borderBottomWidth: 1, 
    borderBottomColor: '#E2E8F0' 
  },
  listItemHover: { opacity: 0.7 },
  
  foodNameWeb: { fontSize: 16, fontWeight: '600', color: '#1E293B', flexShrink: 1, flexWrap: 'wrap', lineHeight: 22 },
  glassFoodName: { fontSize: 16, fontWeight: '700', color: '#1E293B', flexShrink: 1, flexWrap: 'wrap', lineHeight: 22 },
  
  foodDetailsWeb: { fontSize: 14, color: '#64748B', marginTop: 4, flexShrink: 1, flexWrap: 'wrap', lineHeight: 20 },
  glassFoodDetails: { fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: '500', flexShrink: 1, flexWrap: 'wrap', lineHeight: 20 },
  
  emptyTextWeb: { color: '#94A3B8', fontStyle: 'italic', marginTop: 20 },
  glassEmptyText: { color: '#64748B', fontStyle: 'italic', marginTop: 20, textAlign: 'center' },
  
  selectedItemWeb: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  glassSelectedItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 14, 
    paddingHorizontal: 12,
    borderBottomWidth: 1, 
    borderBottomColor: '#E2E8F0' 
  },
  selectedInfo: { flex: 1, marginRight: 12 },
  
  // REDESIGNED STEPPER
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepperBtn: { 
    backgroundColor: '#20C997', // Primary Teal 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  stepperText: { fontSize: 16, fontWeight: '800', width: 24, textAlign: 'center', color: '#1E293B' },
  
  // STICKY FOOTER
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  
  summaryBoxWeb: { backgroundColor: '#F8F9FA', borderRadius: 12, gap: 12, padding: 12 },
  glassSummaryBox: { backgroundColor: '#F8FAFC', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', gap: 12, padding: 16 },
  
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabelWeb: { fontSize: 16, fontWeight: '600', color: '#4A5568' },
  glassSummaryLabel: { fontSize: 15, fontWeight: '600', color: '#64748B' },
  
  summaryValueWeb: { fontSize: 18, fontWeight: 'bold', color: '#1A202C' },
  glassSummaryValue: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  
  switchContainerWeb: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 12 },
  glassSwitchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8FAFC', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 12 },
  
  switchLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  switchLabelTextWeb: { fontSize: 15, fontWeight: '600', color: '#1E293B', flexShrink: 1, flexWrap: 'wrap', lineHeight: 22 },
  glassSwitchLabelText: { fontSize: 15, fontWeight: '600', color: '#1E293B', flexShrink: 1, flexWrap: 'wrap', lineHeight: 22 },
  
  warningBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0F2FE', borderColor: '#BAE6FD', borderWidth: 1, borderRadius: 12, padding: 16, marginTop: 12, gap: 12 },
  warningBannerText: { flex: 1, fontSize: 14, color: '#0369A1', fontWeight: '600', lineHeight: 22, flexShrink: 1, flexWrap: 'wrap' },
  
  insightBox: { marginTop: 12, padding: 16, backgroundColor: '#FEF3C7', borderColor: '#FDE68A', borderWidth: 1, borderRadius: 14, borderLeftWidth: 4, borderLeftColor: '#F59E0B', flexDirection: 'row', alignItems: 'center', gap: 12 },
  insightText: { flex: 1, fontSize: 14, color: '#92400E', fontWeight: '600', lineHeight: 22, flexShrink: 1, flexWrap: 'wrap' },
  
  ctaButton: {
    backgroundColor: '#0D9488',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0F766E',
    marginTop: 16,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  ctaButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 }
});
