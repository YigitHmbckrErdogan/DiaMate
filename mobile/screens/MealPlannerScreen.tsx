import React from 'react';
import { StyleSheet, SafeAreaView, Platform, StatusBar, Pressable, ScrollView, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MealPlannerCore from '../components/MealPlannerCore';
import WebLayout from '../components/WebLayout';

export default function MealPlannerScreen({ navigation }: any) {
  return (
    <WebLayout title="Food Database & Meal Planner">
      <SafeAreaView style={styles.container}>
        {Platform.OS !== 'web' && (
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={({hovered}: any) => [styles.backButton, hovered && { opacity: 0.7 }] as any}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </Pressable>
            <Text style={styles.headerTitle}>Food Database & Meal Planner</Text>
            <View style={{ width: 24 }} />
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent}>
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
  scrollContent: { padding: isWeb ? 0 : 20, maxWidth: isWeb ? '100%' : 900, alignSelf: 'center', width: '100%' },
});
