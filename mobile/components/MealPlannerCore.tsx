import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, Pressable, Platform, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DiabetesContext, FoodItem } from '../context/DiabetesContext';
import { getClinicalInsight } from '../utils/ExpertAdviceEngine';

interface SelectedFood extends FoodItem {
  quantity: number;
}

export default function MealPlannerCore() {
  const { foodDatabase, addFood } = useContext(DiabetesContext);

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
      Alert.alert('Hata', 'Lütfen geçerli besin adı, karbonhidrat ve doz miktarı girin.');
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
    
    if (Platform.OS === 'web') {
      alert('Besin başarıyla eklendi!');
    } else {
      Alert.alert('Başarılı', 'Besin başarıyla eklendi!');
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

  const insight = getClinicalInsight(totalProtein, totalFat);

  return (
    <View style={styles.mainWrapper}>
      {/* Top Section: Add New Food */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Yeni Besin Ekle</Text>
        <View style={styles.formRow}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Besin Adı</Text>
            <TextInput style={styles.input} value={newFoodName} onChangeText={setNewFoodName} placeholder="Örn: Muz" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Karbonhidrat (gr)</Text>
            <TextInput style={styles.input} value={newFoodCarbs} onChangeText={setNewFoodCarbs} keyboardType="numeric" placeholder="20" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Protein (gr)</Text>
            <TextInput style={styles.input} value={newFoodProtein} onChangeText={setNewFoodProtein} keyboardType="numeric" placeholder="Opsiyonel" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Yağ (gr)</Text>
            <TextInput style={styles.input} value={newFoodFat} onChangeText={setNewFoodFat} keyboardType="numeric" placeholder="Opsiyonel" />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Doz (Ünite)</Text>
            <TextInput style={styles.input} value={newFoodDose} onChangeText={setNewFoodDose} keyboardType="numeric" placeholder="2.0" />
          </View>
          <View style={[styles.inputGroup, { justifyContent: 'flex-end' }]}>
            <Pressable onPress={handleAddFood} style={({hovered}: any) => [styles.primaryButton, hovered && styles.buttonHover] as any}>
              <Text style={styles.primaryButtonText}>Ekle</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Bottom Section: Split Columns */}
      <View style={styles.splitLayout}>
        {/* Left Column: Food Database */}
        <View style={[styles.card, styles.flexColumn]}>
            <Text style={styles.sectionTitle}>Veritabanı</Text>
            <TextInput 
              style={[styles.input, { marginBottom: 12 }]} 
              placeholder="Besin ara..." 
              value={searchQuery}
              onChangeText={setSearchQuery} 
            />
            <FlatList
              data={filteredFoods}
              keyExtractor={item => item.id}
              style={styles.list}
              renderItem={({ item }) => (
                <Pressable onPress={() => addToMeal(item)} style={({hovered}: any) => [styles.listItem, hovered && styles.listItemHover] as any}>
                  <View>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <Text style={styles.foodDetails}>{item.carbs}g CHO | {item.historicalDose} Ünite</Text>
                  </View>
                  <Ionicons name="add-circle" size={24} color="#10b981" />
                </Pressable>
              )}
            />
        </View>

        {/* Right Column: Selected Meal Summary */}
        <View style={[styles.card, styles.flexColumn]}>
            <Text style={styles.sectionTitle}>Seçili Öğün</Text>
            <View style={styles.list}>
              {selectedMeal.length === 0 ? (
                <Text style={styles.emptyText}>Henüz besin eklenmedi.</Text>
              ) : (
                selectedMeal.map(item => (
                  <View key={item.id} style={styles.selectedItem}>
                    <View style={styles.selectedInfo}>
                      <Text style={styles.foodName}>{item.name}</Text>
                      <Text style={styles.foodDetails}>{(item.carbs * item.quantity).toFixed(1)}g CHO</Text>
                    </View>
                    <View style={styles.quantityControls}>
                      <Pressable onPress={() => updateQuantity(item.id, -1)} style={styles.qtyBtn}>
                        <Ionicons name="remove" size={18} color="#fff" />
                      </Pressable>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <Pressable onPress={() => updateQuantity(item.id, 1)} style={styles.qtyBtn}>
                        <Ionicons name="add" size={18} color="#fff" />
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Toplam Karbonhidrat:</Text>
                <Text style={styles.summaryValue}>{totalCarbs.toFixed(1)}g</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tahmini Doz:</Text>
                <Text style={[styles.summaryValue, { color: '#ef4444' }]}>{totalDose.toFixed(1)} Ünite</Text>
              </View>
            </View>

            {/* Exercise Mode Toggle */}
            <View style={styles.switchContainer}>
              <View style={styles.switchLabelRow}>
                <Ionicons name="fitness" size={20} color="#10b981" />
                <Text style={styles.switchLabelText}>Exercise Mode</Text>
              </View>
              <Switch
                value={isExerciseMode}
                onValueChange={setIsExerciseMode}
                trackColor={{ false: '#cbd5e1', true: '#10b981' }}
                thumbColor="#fff"
              />
            </View>

            {isExerciseMode && (
              <View style={styles.warningBanner}>
                <Ionicons name="warning" size={20} color="#d97706" />
                <Text style={styles.warningBannerText}>
                  Clinical Insight: Exercise mode active. Dose reduced by 20% to prevent delayed hypoglycemia.
                </Text>
              </View>
            )}

            {insight && (
              <View style={styles.insightBox}>
                <Ionicons name="medical" size={24} color="#ef4444" />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
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
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A202C', marginBottom: 16 },
  formRow: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 16,
    flexWrap: 'wrap',
  },
  inputGroup: { flex: 1, minWidth: isWeb ? 150 : '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 8 },
  input: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 14, color: '#1A202C' },
  primaryButton: { backgroundColor: '#10b981', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buttonHover: { backgroundColor: '#059669' },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  splitLayout: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 20,
  },
  flexColumn: { flex: 1 },
  list: { minHeight: 250, maxHeight: 400 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F7', cursor: 'pointer' },
  listItemHover: { backgroundColor: '#F8F9FA', borderRadius: 8 },
  foodName: { fontSize: 16, fontWeight: '600', color: '#1A202C' },
  foodDetails: { fontSize: 13, color: '#718096', marginTop: 4 },
  emptyText: { color: '#A0AEC0', fontStyle: 'italic', marginTop: 20 },
  selectedItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  selectedInfo: { flex: 1 },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { backgroundColor: '#CBD5E0', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  qtyText: { fontSize: 16, fontWeight: '600', width: 20, textAlign: 'center' },
  summaryBox: { marginTop: 24, padding: 16, backgroundColor: '#F8F9FA', borderRadius: 12, gap: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 16, fontWeight: '600', color: '#4A5568' },
  summaryValue: { fontSize: 18, fontWeight: 'bold', color: '#1A202C' },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 16,
  },
  switchLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchLabelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    gap: 12,
  },
  warningBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
    fontWeight: '600',
    lineHeight: 18,
  },
  insightBox: { marginTop: 16, padding: 16, backgroundColor: '#FFF5F5', borderColor: '#FEB2B2', borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  insightText: { flex: 1, fontSize: 14, color: '#C53030', fontWeight: '500', lineHeight: 20 }
});
