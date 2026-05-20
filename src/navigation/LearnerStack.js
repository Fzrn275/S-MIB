import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LearnerTabs } from './LearnerTabs';
import { MyProjectsScreen } from '../screens/learner/MyProjectsScreen';
import { ProjectDetailScreen } from '../screens/learner/ProjectDetailScreen';
import { StepDetailScreen } from '../screens/learner/StepDetailScreen';

const Stack = createNativeStackNavigator();

export function LearnerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="Tabs" component={LearnerTabs} />
      <Stack.Screen name="MyProjects" component={MyProjectsScreen} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <Stack.Screen name="StepDetail" component={StepDetailScreen} />
    </Stack.Navigator>
  );
}
