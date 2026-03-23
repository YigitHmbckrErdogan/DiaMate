import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const mockReadings = [
  { id: '1', date: '15 Mar', value: '145 mg/dL' },
  { id: '2', date: '14 Mar', value: '132 mg/dL' },
  { id: '3', date: '13 Mar', value: '110 mg/dL' },
  { id: '4', date: '12 Mar', value: '128 mg/dL' },
  { id: '5', date: '11 Mar', value: '140 mg/dL' },
];

export default function DashboardScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.readingItem}>
      <Text style={styles.readingDate}>{item.date}</Text>
      <Text style={styles.readingValue}>{item.value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DiaMate</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Prominent HbA1c Block */}
      <View style={styles.hba1cContainer}>
        <Text style={styles.hba1cLabel}>Tahmini HbA1c</Text>
        <Text style={styles.hba1cValue}>%6.8</Text>
      </View>

      {/* Readings List */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Geçmiş Ölçümler</Text>
        <FlatList
          data={mockReadings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  hba1cContainer: {
    margin: 20,
    padding: 30,
    backgroundColor: '#4A90E2',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  hba1cLabel: {
    fontSize: 16,
    color: '#E0E8F5',
    marginBottom: 8,
  },
  hba1cValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 80, // space for FAB
  },
  readingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  readingDate: {
    fontSize: 16,
    color: '#555',
  },
  readingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF5A5F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
