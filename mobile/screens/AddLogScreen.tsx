import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AddLogScreen({ navigation }: any) {
  const [bloodSugar, setBloodSugar] = useState('');
  const [carbs, setCarbs] = useState('');
  const [insulinDose, setInsulinDose] = useState<string | null>(null);

  const calculateInsulin = () => {
    const bg = parseFloat(bloodSugar);
    const cb = parseFloat(carbs);
    
    if (isNaN(bg) || isNaN(cb)) {
      setInsulinDose('Lütfen değerleri girin');
      return;
    }

    // Formula: (carbs / 10) + ((bloodSugar - 100) / 50)
    const dose = (cb / 10) + ((bg - 100) / 50);
    // ensuring we don't display negative dose
    const finalDose = Math.max(0, dose).toFixed(1);
    setInsulinDose(`${finalDose} Ünite`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Ölçüm Ekle</Text>
        <View style={{ width: 24 }} /> {/* placeholder for alignment */}
      </View>

      <View style={styles.content}>
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

        <TouchableOpacity style={styles.button} onPress={calculateInsulin}>
          <Text style={styles.buttonText}>İnsülin Hesapla</Text>
        </TouchableOpacity>

        {insulinDose !== null && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Önerilen Doz</Text>
            <Text style={styles.resultValue}>{insulinDose}</Text>
          </View>
        )}
      </View>
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
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF5A5F',
  }
});
