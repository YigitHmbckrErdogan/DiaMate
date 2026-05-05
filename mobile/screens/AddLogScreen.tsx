import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, Platform, StatusBar, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DiabetesContext, LogTag } from '../context/DiabetesContext';

export default function AddLogScreen({ navigation }: any) {
  const { carbRatio, insulinSensitivityFactor, addLog } = useContext(DiabetesContext);

  const [bloodSugar, setBloodSugar] = useState('');
  const [carbs, setCarbs] = useState('');
  const [tag, setTag] = useState<LogTag>('Normal');
  const [insulinDose, setInsulinDose] = useState<string | null>(null);

  const tags: LogTag[] = ['Fasting', 'Post-meal', 'Exercise', 'Normal'];

  const calculateInsulin = () => {
    const bg = parseFloat(bloodSugar);
    const cb = parseFloat(carbs);
    
    if (isNaN(bg) || isNaN(cb)) {
      setInsulinDose('Lütfen değerleri girin');
      return;
    }

    // Formula: (carbs / CR) + ((bloodSugar - 100) / ISF)
    const dose = (cb / carbRatio) + ((bg - 100) / insulinSensitivityFactor);
    const finalDose = Math.max(0, dose).toFixed(1);
    setInsulinDose(`${finalDose} Ünite`);
  };

  const handleSave = async () => {
    const bg = parseFloat(bloodSugar);
    if (isNaN(bg)) {
      Alert.alert('Hata', 'Geçerli bir kan şekeri girmeniz gereklidir.');
      return;
    }
    
    const today = new Date();
    const dateStr = `${today.getDate()} ${today.toLocaleString('tr-TR', { month: 'short' })}`;
    
    await addLog({
      date: dateStr,
      value: bg,
      tag: tag
    });
    
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Ölçüm Ekle</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Kan Şekeri (mg/dL)</Text>
        <TextInput 
          style={styles.input}
          keyboardType="numeric"
          placeholder="Örn: 120"
          value={bloodSugar}
          onChangeText={setBloodSugar}
        />

        <Text style={styles.label}>Karbonhidrat (gr)</Text>
        <TextInput 
          style={styles.input}
          keyboardType="numeric"
          placeholder="Örn: 45"
          value={carbs}
          onChangeText={setCarbs}
        />

        <Text style={styles.label}>Etiket</Text>
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

        <TouchableOpacity style={styles.button} onPress={calculateInsulin}>
          <Text style={styles.buttonText}>İnsülin Hesapla</Text>
        </TouchableOpacity>

        {insulinDose !== null && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Önerilen Doz</Text>
            <Text style={styles.resultValue}>{insulinDose}</Text>
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Günlüğe Kaydet</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  content: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tagButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  tagButtonActive: { backgroundColor: '#4A90E2', borderColor: '#4A90E2' },
  tagText: { color: '#666', fontSize: 14, fontWeight: '500' },
  tagTextActive: { color: '#fff' },
  button: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resultContainer: { marginTop: 40, padding: 20, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  resultLabel: { fontSize: 16, color: '#555', marginBottom: 8 },
  resultValue: { fontSize: 32, fontWeight: 'bold', color: '#FF5A5F', marginBottom: 20 },
  saveButton: { backgroundColor: '#34C759', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
