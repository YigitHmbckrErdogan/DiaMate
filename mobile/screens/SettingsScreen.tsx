import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Platform, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DiabetesContext } from '../context/DiabetesContext';
import WebLayout from '../components/WebLayout';

const isWeb = Platform.OS === 'web';

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
    if (Platform.OS === 'web') {
      alert('Ayarlarınız kaydedildi.');
    } else {
      Alert.alert('Başarılı', 'Ayarlarınız kaydedildi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    }
  };

  return (
    <WebLayout title="Settings">
      <SafeAreaView style={styles.container}>
        {/* Header (Mobile) */}
        {!isWeb && (
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ayarlar</Text>
            <View style={{ width: 24 }} />
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.content, isWeb && styles.card]}>
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
        </ScrollView>
      </SafeAreaView>
    </WebLayout>
  );
}

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
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  backButton: { padding: 5 },
  scrollContent: { padding: isWeb ? 0 : 20 },
  content: { 
    maxWidth: isWeb ? 600 : '100%',
    width: '100%',
  },
  card: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  description: { fontSize: 15, color: '#4A5568', marginBottom: 24, lineHeight: 22 },
  label: { fontSize: 16, fontWeight: '600', color: '#1A202C', marginTop: 16, marginBottom: 4 },
  hint: { fontSize: 13, color: '#718096', marginBottom: 8 },
  input: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 16, color: '#1A202C' },
  saveButton: { backgroundColor: '#4A90E2', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 40 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
