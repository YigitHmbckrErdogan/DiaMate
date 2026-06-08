import React, { useContext } from 'react';
import { StyleSheet, SafeAreaView, Platform, StatusBar, Pressable, View, Text, KeyboardAvoidingView, ScrollView } from 'react-native';
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
              <Ionicons name="arrow-back" size={22} color="#1E293B" />
            </Pressable>
            <Text style={styles.headerTitle}>{titleStr}</Text>
            <View style={{ width: 24 }} />
          </View>
        )}

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={{ flex: 1 }}>
            <MealPlannerCore />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </WebLayout>
  );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8', // Clinical Light Theme
    paddingTop: !isWeb ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#F8FAFC',
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', letterSpacing: 0.5 },
  scrollContent: { padding: isWeb ? 0 : 20, maxWidth: isWeb ? '100%' : 900, alignSelf: 'center', width: '100%' },
});
