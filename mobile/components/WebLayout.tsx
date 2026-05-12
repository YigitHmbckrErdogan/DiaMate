import React from 'react';
import { View, Text, StyleSheet, Platform, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface WebLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function WebLayout({ children, title }: WebLayoutProps) {
  const navigation = useNavigation<any>();

  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.brand}>
          <Ionicons name="medical" size={28} color="#4A90E2" />
          <Text style={styles.brandText}>DiaMate</Text>
        </View>

        <View style={styles.navMenu}>
          <Pressable 
            style={({ hovered }: any) => [styles.navItem, hovered && styles.navItemHover]}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Ionicons name="grid-outline" size={20} color="#555" />
            <Text style={styles.navItemText}>Dashboard</Text>
          </Pressable>

          <Pressable 
            style={({ hovered }: any) => [styles.navItem, hovered && styles.navItemHover]}
            onPress={() => navigation.navigate('MealPlannerScreen')}
          >
            <Ionicons name="restaurant-outline" size={20} color="#555" />
            <Text style={styles.navItemText}>Food DB</Text>
          </Pressable>

          <Pressable 
            style={({ hovered }: any) => [styles.navItem, hovered && styles.navItemHover]}
            onPress={() => navigation.navigate('SettingsScreen')}
          >
            <Ionicons name="settings-outline" size={20} color="#555" />
            <Text style={styles.navItemText}>Settings</Text>
          </Pressable>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.headerRight}>
            <View style={styles.profileIcon}>
              <Ionicons name="person" size={16} color="#fff" />
            </View>
          </View>
        </View>

        {/* Scrollable Content */}
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F4F6F8', // Light gray background for the app shell
  },
  sidebar: {
    width: 250,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    paddingVertical: 20,
    display: 'flex',
    flexDirection: 'column',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
    gap: 12,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A202C',
    letterSpacing: -0.5,
  },
  navMenu: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 16,
    // @ts-ignore
    cursor: 'pointer',
  },
  navItemHover: {
    backgroundColor: '#EDF2F7',
  },
  navItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4A5568',
  },
  mainArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    height: 70,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 32,
  },
});
