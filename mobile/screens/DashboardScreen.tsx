import React, { useContext } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DiabetesContext } from '../context/DiabetesContext';

export default function DashboardScreen({ navigation }: any) {
  const { logs } = useContext(DiabetesContext);

  const getReadingStyle = (value: number) => {
    if (value < 70 || value > 180) {
      return { color: '#FF5A5F' }; // Red
    }
    return { color: '#34C759' }; // Green
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.readingItem}>
      <View>
        <Text style={styles.readingDate}>{item.date}</Text>
        <View style={styles.tagBadge}>
          <Text style={styles.tagText}>{item.tag}</Text>
        </View>
      </View>
      <Text style={[styles.readingValue, getReadingStyle(item.value)]}>
        {item.value} mg/dL
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DiaMate</Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity onPress={() => navigation.navigate('MealPlannerScreen')}>
            <Ionicons name="restaurant-outline" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('SettingsScreen')}>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
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
          data={logs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>Henüz kayıtlı ölçüm yok.</Text>}
        />
      </View>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddLogScreen')}
      >
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
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  hba1cContainer: { margin: 20, padding: 30, backgroundColor: '#4A90E2', borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  hba1cLabel: { fontSize: 16, color: '#E0E8F5', marginBottom: 8 },
  hba1cValue: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  listContainer: { flex: 1, paddingHorizontal: 20 },
  listTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 12 },
  listContent: { paddingBottom: 80 },
  readingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  readingDate: { fontSize: 16, color: '#555', marginBottom: 4 },
  tagBadge: { backgroundColor: '#EEF0F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  tagText: { fontSize: 12, color: '#666', fontWeight: '500' },
  readingValue: { fontSize: 22, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 20 },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#FF5A5F', alignItems: 'center', justifyContent: 'center', shadowColor: '#FF5A5F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
});
