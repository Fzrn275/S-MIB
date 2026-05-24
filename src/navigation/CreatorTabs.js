import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { CreatorDashboardScreen } from '../screens/creator/CreatorDashboardScreen';
import { CreatorProjectsScreen } from '../screens/creator/CreatorProjectsScreen';
import { CreatorAnalyticsScreen } from '../screens/creator/CreatorAnalyticsScreen';
import { CreatorProfileScreen } from '../screens/creator/CreatorProfileScreen';
import { FloatingTabBar } from '../components/FloatingTabBar';

const Tab = createBottomTabNavigator();

const iconFor = (name) => ({ color, size }) => {
  const m = {
    Dashboard: 'grid',
    Projects: 'briefcase',
    Analytics: 'bar-chart',
    Profile: 'person',
  };
  return <Ionicons name={m[name] || 'ellipse'} size={size} color={color} />;
};

export function CreatorTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { position: 'absolute', backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0 },
        tabBarIcon: iconFor(route.name),
      })}
    >
      <Tab.Screen name="Dashboard" component={CreatorDashboardScreen} />
      <Tab.Screen name="Projects" component={CreatorProjectsScreen} />
      <Tab.Screen name="Analytics" component={CreatorAnalyticsScreen} />
      <Tab.Screen name="Profile" component={CreatorProfileScreen} />
    </Tab.Navigator>
  );
}
