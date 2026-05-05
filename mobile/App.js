import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from './screens/DashboardScreen';
import AddLogScreen from './screens/AddLogScreen';
import SettingsScreen from './screens/SettingsScreen';
import MealPlannerScreen from './screens/MealPlannerScreen';
import { DiabetesProvider } from './context/DiabetesContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <DiabetesProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="AddLogScreen" component={AddLogScreen} />
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
          <Stack.Screen name="MealPlannerScreen" component={MealPlannerScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </DiabetesProvider>
  );
}
