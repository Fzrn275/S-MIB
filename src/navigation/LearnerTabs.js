import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { PlaceholderScreen } from '../screens/_PlaceholderScreen';
import { LearnerHomeScreen } from '../screens/learner/LearnerHomeScreen';
import { colors } from '../theme/tokens';

const Tab = createBottomTabNavigator();

const iconFor = (name) => ({ color, size }) => {
  const m = {
    Home: 'home',
    Explore: 'compass',
    Progress: 'trophy',
    Profile: 'person',
  };
  return <Ionicons name={m[name] || 'ellipse'} size={size} color={color} />;
};

export function LearnerTabs() {
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
      <Tab.Screen name="Home" component={LearnerHomeScreen} />
      <Tab.Screen name="Explore" component={PlaceholderScreen} />
      <Tab.Screen name="Progress" component={PlaceholderScreen} />
      <Tab.Screen name="Profile" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
}
