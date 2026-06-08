import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, Pressable, Platform, Alert, Switch } from 'react-native';
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
      {/* Top Section: Add New Food */}
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

      {/* Bottom Section: Split Columns */}
      <View style={styles.splitLayout}>
        {/* Left Column: Food Database */}
        <View style={[isWeb ? styles.cardWeb : styles.glassCard, styles.flexColumn]}>
            <Text style={isWeb ? styles.sectionTitleWeb : styles.glassSectionTitle}>{t('databaseSection', language)}</Text>
            <TextInput 
              style={[isWeb ? styles.inputWeb : styles.glassInput, { marginBottom: 12 }]} 
              placeholder={t('searchPlaceholder', language)} 
              placeholderTextColor={isWeb ? '#94A3B8' : '#64748B'}
              value={searchQuery}
              onChangeText={setSearchQuery} 
            />
            <FlatList
              data={filteredFoods}
              keyExtractor={item => item.id}
              style={styles.list}
              renderItem={({ item }) => (
                <Pressable onPress={() => addToMeal(item)} style={({hovered}: any) => [isWeb ? styles.listItemWeb : styles.glassListItem, hovered && styles.listItemHover] as any}>
                  <View>
                    <Text style={isWeb ? styles.foodNameWeb : styles.glassFoodName}>{item.name}</Text>
                    <Text style={isWeb ? styles.foodDetailsWeb : styles.glassFoodDetails}>{item.carbs}g CHO | {item.historicalDose} {t('unitText', language)}</Text>
                  </View>
                  <Ionicons name="add-circle" size={24} color="#10B981" />
                </Pressable>
              )}
            />
        </View>

        {/* Right Column: Selected Meal Summary */}
        <View style={[isWeb ? styles.cardWeb : styles.glassCard, styles.flexColumn]}>
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
                    <View style={styles.quantityControls}>
                      <Pressable onPress={() => updateQuantity(item.id, -1)} style={isWeb ? styles.qtyBtnWeb : styles.glassQtyBtn}>
                        <Ionicons name="remove" size={16} color="#FFFFFF" />
                      </Pressable>
                      <Text style={isWeb ? styles.qtyTextWeb : styles.glassQtyText}>{item.quantity}</Text>
                      <Pressable onPress={() => updateQuantity(item.id, 1)} style={isWeb ? styles.qtyBtnWeb : styles.glassQtyBtn}>
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>

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
                trackColor={{ false: isWeb ? '#cbd5e1' : 'rgba(255,255,255,0.1)', true: '#0D9488' }}
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

            {/* Contextual CTA Button */}
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
    </View>
  );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  mainWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  
  // Web Card tokens
  cardWeb: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitleWeb: { fontSize: 18, fontWeight: '700', color: '#1A202C', marginBottom: 16 },
  labelWeb: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 8 },
  inputWeb: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 14, color: '#1A202C' },
  primaryButtonWeb: { backgroundColor: '#10b981', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  
  // Mobile Premium Glassmorphic tokens
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 4,
  },
  glassSectionTitle: { fontSize: 17, fontWeight: '800', color: '#2DD4BF', marginBottom: 16, letterSpacing: 0.5 },
  glassLabel: { fontSize: 13, fontWeight: '700', color: '#94A3B8', marginBottom: 6 },
  glassInput: { 
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.1)', 
    borderRadius: 12, 
    padding: 12, 
    fontSize: 15, 
    color: '#FFFFFF',
    fontWeight: '600'
  },
  glassPrimaryButton: { 
    backgroundColor: '#10B981', 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#34D399',
  },

  formRow: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 16,
    flexWrap: 'wrap',
  },
  inputGroup: { flex: 1, minWidth: isWeb ? 150 : '100%' },
  buttonHover: { opacity: 0.8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  
  splitLayout: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 20,
  },
  flexColumn: { flex: 1 },
  list: { minHeight: 250, maxHeight: 400 },
  
  // List Item web vs mobile glass
  listItemWeb: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F7', cursor: 'pointer' },
  glassListItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 12,
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.06)' 
  },
  listItemHover: { opacity: 0.7 },
  
  foodNameWeb: { fontSize: 16, fontWeight: '600', color: '#1A202C' },
  glassFoodName: { fontSize: 16, fontWeight: '700', color: '#F1F5F9' },
  
  foodDetailsWeb: { fontSize: 13, color: '#718096', marginTop: 4 },
  glassFoodDetails: { fontSize: 12, color: '#94A3B8', marginTop: 2, fontWeight: '500' },
  
  emptyTextWeb: { color: '#A0AEC0', fontStyle: 'italic', marginTop: 20 },
  glassEmptyText: { color: '#64748B', fontStyle: 'italic', marginTop: 20, textAlign: 'center' },
  
  selectedItemWeb: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  glassSelectedItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 12,
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255,255,255,0.06)' 
  },
  selectedInfo: { flex: 1 },
  
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtnWeb: { backgroundColor: '#CBD5E0', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  glassQtyBtn: { backgroundColor: 'rgba(255,255,255,0.1)', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  
  qtyTextWeb: { fontSize: 16, fontWeight: '600', width: 20, textAlign: 'center' },
  glassQtyText: { fontSize: 16, fontWeight: '700', width: 20, textAlign: 'center', color: '#FFFFFF' },
  
  summaryBoxWeb: { marginTop: 24, padding: 16, backgroundColor: '#F8F9FA', borderRadius: 12, gap: 8 },
  glassSummaryBox: { marginTop: 20, padding: 16, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', gap: 8 },
  
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabelWeb: { fontSize: 16, fontWeight: '600', color: '#4A5568' },
  glassSummaryLabel: { fontSize: 14, fontWeight: '600', color: '#CBD5E1' },
  
  summaryValueWeb: { fontSize: 18, fontWeight: 'bold', color: '#1A202C' },
  glassSummaryValue: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  
  switchContainerWeb: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 16 },
  glassSwitchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.2)', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', marginTop: 16 },
  
  switchLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  switchLabelTextWeb: { fontSize: 15, fontWeight: '600', color: '#334155' },
  glassSwitchLabelText: { fontSize: 14, fontWeight: '600', color: '#E2E8F0' },
  
  warningBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderColor: 'rgba(56, 189, 248, 0.3)', borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 12, gap: 10 },
  warningBannerText: { flex: 1, fontSize: 13, color: '#38BDF8', fontWeight: '600', lineHeight: 18 },
  
  insightBox: { marginTop: 16, padding: 16, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: '#F59E0B', borderWidth: 1, borderRadius: 14, borderLeftWidth: 4, borderLeftColor: '#F59E0B', flexDirection: 'row', alignItems: 'center', gap: 12 },
  insightText: { flex: 1, fontSize: 13, color: '#F8FAFC', fontWeight: '600', lineHeight: 18 },
  
  ctaButton: {
    backgroundColor: 'rgba(13, 148, 136, 0.85)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2DD4BF',
    marginTop: 20,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  ctaButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 }
});
