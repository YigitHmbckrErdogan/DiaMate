import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, SafeAreaView, Platform, StatusBar, Pressable, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DiabetesContext, FoodItem } from '../context/DiabetesContext';

interface SelectedFood extends FoodItem {
  quantity: number;
}

export default function MealPlannerScreen({ navigation }: any) {
  const { foodDatabase, addFood } = useContext(DiabetesContext);

  // New Food Form State
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodCarbs, setNewFoodCarbs] = useState('');
  const [newFoodDose, setNewFoodDose] = useState('');

  // Selected Meal State
  const [selectedMeal, setSelectedMeal] = useState<SelectedFood[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFoods = foodDatabase.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddFood = () => {
    const carbs = parseFloat(newFoodCarbs);
    const dose = parseFloat(newFoodDose);
    if (!newFoodName.trim() || isNaN(carbs) || isNaN(dose)) {
      Alert.alert('Hata', 'Lütfen geçerli besin adı, karbonhidrat ve doz miktarı girin.');
      return;
    }
    
    addFood({ name: newFoodName, carbs: carbs, historicalDose: dose });
    setNewFoodName('');
    setNewFoodCarbs('');
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
  const totalDose = selectedMeal.reduce((sum, item) => sum + (item.historicalDose * item.quantity), 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={({hovered}: any) => [styles.backButton, hovered && { opacity: 0.7 }] as any}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Food Database & Meal Planner</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
                <Text style={styles.label}>Geçmiş Doz (Ünite)</Text>
                <TextInput style={styles.input} value={newFoodDose} onChangeText={setNewFoodDose} keyboardType="numeric" placeholder="2.0" />
              </View>
              <View style={[styles.inputGroup, { justifyContent: 'flex-end' }]}>
                <Pressable onPress={handleAddFood} style={({hovered}: any) => [styles.primaryButton, hovered && styles.buttonHover] as any}>
                  <Text style={styles.primaryButtonText}>Ekle</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Bottom Section: Split Columns on Web */}
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
                     <Ionicons name="add-circle" size={24} color="#4A90E2" />
                   </Pressable>
                 )}
               />
            </View>

            {/* Right Column: Selected Meal Summary */}
            <View style={[styles.card, styles.flexColumn]}>
               <Text style={styles.sectionTitle}>Seçili Öğün (Meal Summary)</Text>
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
                   <Text style={styles.summaryLabel}>Tahmini Doz (Örnek):</Text>
                   <Text style={[styles.summaryValue, { color: '#FF5A5F' }]}>{totalDose.toFixed(1)} Ünite</Text>
                 </View>
               </View>

            </View>

          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    paddingTop: !isWeb ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },
  backButton: { padding: 5, borderRadius: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  scrollContent: { padding: 20 },
  mainWrapper: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 16 },
  formRow: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 16,
    flexWrap: 'wrap',
  },
  inputGroup: { flex: 1, minWidth: isWeb ? 150 : '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8 },
  input: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E9ECEF', borderRadius: 8, padding: 12, fontSize: 14, color: '#333' },
  primaryButton: { backgroundColor: '#4A90E2', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  buttonHover: { backgroundColor: '#357ABD' },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  splitLayout: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 20,
  },
  flexColumn: { flex: 1 },
  list: { minHeight: 250, maxHeight: 400 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F3F5', cursor: 'pointer' },
  listItemHover: { backgroundColor: '#F8F9FA', borderRadius: 8 },
  foodName: { fontSize: 16, fontWeight: '600', color: '#333' },
  foodDetails: { fontSize: 13, color: '#888', marginTop: 4 },
  emptyText: { color: '#999', fontStyle: 'italic', marginTop: 20 },
  selectedItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F3F5' },
  selectedInfo: { flex: 1 },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: { backgroundColor: '#ced4da', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  qtyText: { fontSize: 16, fontWeight: '600', width: 20, textAlign: 'center' },
  summaryBox: { marginTop: 24, padding: 16, backgroundColor: '#F8F9FA', borderRadius: 12, gap: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 16, fontWeight: '600', color: '#555' },
  summaryValue: { fontSize: 18, fontWeight: 'bold', color: '#333' }
});
