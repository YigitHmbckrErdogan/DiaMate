import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DiabetesContext } from '../context/DiabetesContext';

export default function SettingsScreen({ navigation }: any) {
  const { carbRatio, insulinSensitivityFactor, updateSettings } = useContext(DiabetesContext);
  
  const [cr, setCr] = useState(carbRatio.toString());
  const [isf, setIsf] = useState(insulinSensitivityFactor.toString());

  // Sync state if context changes externally
  useEffect(() => {
    setCr(carbRatio.toString());
    setIsf(insulinSensitivityFactor.toString());
  }, [carbRatio, insulinSensitivityFactor]);

  const handleSave = async () => {
    const crValue = parseFloat(cr);
    const isfValue = parseFloat(isf);

    if (isNaN(crValue) || crValue <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir Karbonhidrat Oranı girin.');
      return;
    }
    
    if (isNaN(isfValue) || isfValue <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir İnsülin Duyarlılık Faktörü girin.');
      return;
    }

    await updateSettings(crValue, isfValue);
    Alert.alert('Başarılı', 'Ayarlarınız kaydedildi.', [
      { text: 'Tamam', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          İnsülin hesaplamalarınızın doğru yapılabilmesi için lütfen güncel değerlerinizi girin.
        </Text>

        <Text style={styles.label}>Karbonhidrat Oranı (CR)</Text>
        <Text style={styles.hint}>1 Ünite insülinin kaç gram karbonhidratı karşıladığı (Örn: 10)</Text>
        <TextInput 
          style={styles.input}
          keyboardType="numeric"
          value={cr}
          onChangeText={setCr}
        />

        <Text style={styles.label}>İnsülin Duyarlılık Faktörü (ISF)</Text>
        <Text style={styles.hint}>1 Ünite insülinin kan şekerini kaç mg/dL düşürdüğü (Örn: 50)</Text>
        <TextInput 
          style={styles.input}
          keyboardType="numeric"
          value={isf}
          onChangeText={setIsf}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </TouchableOpacity>
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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  backButton: { padding: 5 },
  content: { padding: 20 },
  description: { fontSize: 14, color: '#666', marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginTop: 16, marginBottom: 4 },
  hint: { fontSize: 12, color: '#888', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16 },
  saveButton: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 40 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
