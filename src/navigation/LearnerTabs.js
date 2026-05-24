import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { LearnerHomeScreen } from '../screens/learner/LearnerHomeScreen';
import { LearnerExploreScreen } from '../screens/learner/LearnerExploreScreen';
import { LearnerProgressScreen } from '../screens/learner/LearnerProgressScreen';
import { LearnerProfileScreen } from '../screens/learner/LearnerProfileScreen';
import { FloatingTabBar } from '../components/FloatingTabBar';

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
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { position: 'absolute', backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0 },
        tabBarIcon: iconFor(route.name),
      })}
    >
      <Tab.Screen name="Home" component={LearnerHomeScreen} />
      <Tab.Screen name="Explore" component={LearnerExploreScreen} />
      <Tab.Screen name="Progress" component={LearnerProgressScreen} />
      <Tab.Screen name="Profile" component={LearnerProfileScreen} />
    </Tab.Navigator>
  );
}
