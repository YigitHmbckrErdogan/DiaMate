import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Platform, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
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
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Klinik Ayarlar</Text>
            <View style={{ width: 40 }} />
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInUp.duration(500).springify()} style={[styles.content, isWeb ? styles.cardWeb : styles.glassCard]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Ionicons name="options" size={24} color={isWeb ? '#10b981' : '#2DD4BF'} />
              <Text style={isWeb ? styles.sectionTitleWeb : styles.glassSectionTitle}>Parametre Konfigürasyonu</Text>
            </View>

            <Text style={isWeb ? styles.descriptionWeb : styles.glassDescription}>
              İnsülin hesaplamalarınızın klinik doğrulukla yapılabilmesi için lütfen güncel duyarlılık ve oran parametrelerinizi tanımlayın.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={isWeb ? styles.labelWeb : styles.glassLabel}>Karbonhidrat Oranı (CR)</Text>
              <Text style={isWeb ? styles.hintWeb : styles.glassHint}>1 Ünite insülinin kaç gram karbonhidratı karşıladığı (Örn: 10)</Text>
              <TextInput 
                style={isWeb ? styles.inputWeb : styles.glassInput}
                keyboardType="numeric"
                value={cr}
                onChangeText={setCr}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={isWeb ? styles.labelWeb : styles.glassLabel}>İnsülin Duyarlılık Faktörü (ISF)</Text>
              <Text style={isWeb ? styles.hintWeb : styles.glassHint}>1 Ünite insülinin kan şekerini kaç mg/dL düşürdüğü (Örn: 50)</Text>
              <TextInput 
                style={isWeb ? styles.inputWeb : styles.glassInput}
                keyboardType="numeric"
                value={isf}
                onChangeText={setIsf}
              />
            </View>

            <TouchableOpacity style={isWeb ? styles.saveButtonWeb : styles.glassSaveButton} onPress={handleSave}>
              <Ionicons name="save-outline" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Parametreleri Kaydet</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </WebLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isWeb ? '#F8FAFC' : '#0F172A', // Crisp slate 50 on web, Global Deep Navy on mobile
    paddingTop: !isWeb ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
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
  scrollContent: { padding: isWeb ? 0 : 20 },
  content: { 
    maxWidth: isWeb ? 600 : '100%',
    width: '100%',
  },
  
  // Web specific styles
  cardWeb: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitleWeb: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  descriptionWeb: { fontSize: 15, color: '#475569', marginBottom: 24, lineHeight: 22 },
  labelWeb: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginBottom: 4 },
  hintWeb: { fontSize: 13, color: '#64748B', marginBottom: 8 },
  inputWeb: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, fontSize: 16, color: '#0F172A' },
  saveButtonWeb: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#0D9488', padding: 16, borderRadius: 12, marginTop: 32 },

  // Mobile Pro Glassmorphism design tokens
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 4,
  },
  glassSectionTitle: { fontSize: 18, fontWeight: '700', color: '#2DD4BF', letterSpacing: 0.5 },
  glassDescription: { fontSize: 14, color: '#CBD5E1', marginBottom: 24, lineHeight: 22, fontWeight: '500' },
  
  inputGroup: { marginBottom: 20 },
  glassLabel: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  glassHint: { fontSize: 12, color: '#94A3B8', marginBottom: 8, fontWeight: '500' },
  glassInput: { 
    backgroundColor: 'rgba(0, 0, 0, 0.25)', 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.15)', 
    borderRadius: 14, 
    padding: 14, 
    fontSize: 16, 
    color: '#FFFFFF',
    fontWeight: '600'
  },
  
  glassSaveButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0D9488', 
    padding: 16, 
    borderRadius: 16, 
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#2DD4BF',
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
