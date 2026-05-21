import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { CreatorDashboardScreen } from '../screens/creator/CreatorDashboardScreen';
import { CreatorProjectsScreen } from '../screens/creator/CreatorProjectsScreen';
import { CreatorAnalyticsScreen } from '../screens/creator/CreatorAnalyticsScreen';
import { CreatorProfileScreen } from '../screens/creator/CreatorProfileScreen';
import { colors } from '../theme/tokens';

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
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.navy,
          borderTopColor: colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.cyan,
        tabBarInactiveTintColor: colors.textMuted,
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
