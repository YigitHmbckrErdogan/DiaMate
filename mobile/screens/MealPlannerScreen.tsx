import React, { useContext } from 'react';
import { StyleSheet, SafeAreaView, Platform, StatusBar, Pressable, ScrollView, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MealPlannerCore from '../components/MealPlannerCore';
import WebLayout from '../components/WebLayout';
import { DiabetesContext } from '../context/DiabetesContext';
import { t } from '../utils/translations';

export default function MealPlannerScreen({ navigation }: any) {
  const { language } = useContext(DiabetesContext);
  const titleStr = t('mealPlannerScreenTitle', language);

  return (
    <WebLayout title={titleStr}>
      <SafeAreaView style={styles.container}>
        {Platform.OS !== 'web' && (
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={({hovered}: any) => [styles.backButton, hovered && { opacity: 0.7 }] as any}>
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.headerTitle}>{titleStr}</Text>
            <View style={{ width: 24 }} />
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <MealPlannerCore />
        </ScrollView>
      </SafeAreaView>
    </WebLayout>
  );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isWeb ? '#F8FAFC' : '#020617', // Unified Global Theme: Deep Space Navy
    paddingTop: !isWeb ? StatusBar.currentHeight : 0,
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
  backButton: { 
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
  scrollContent: { padding: isWeb ? 0 : 20, maxWidth: isWeb ? '100%' : 900, alignSelf: 'center', width: '100%' },
});
