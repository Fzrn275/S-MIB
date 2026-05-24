import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ParentDashboardScreen } from '../screens/parent/ParentDashboardScreen';
import { ParentActivityScreen } from '../screens/parent/ParentActivityScreen';
import { ParentProfileScreen } from '../screens/parent/ParentProfileScreen';
import { FloatingTabBar } from '../components/FloatingTabBar';

const Tab = createBottomTabNavigator();

const iconFor = (name) => ({ color, size }) => {
  const m = {
    Home: 'home',
    Activity: 'pulse',
    Profile: 'person',
  };
  return <Ionicons name={m[name] || 'ellipse'} size={size} color={color} />;
};

export function ParentTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { position: 'absolute', backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0 },
        tabBarIcon: iconFor(route.name),
      })}
    >
      <Tab.Screen name="Home" component={ParentDashboardScreen} />
      <Tab.Screen name="Activity" component={ParentActivityScreen} />
      <Tab.Screen name="Profile" component={ParentProfileScreen} />
    </Tab.Navigator>
  );
}
