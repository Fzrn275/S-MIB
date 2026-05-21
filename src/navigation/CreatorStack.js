import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CreatorTabs } from './CreatorTabs';
import { CreatorProjectDetailScreen } from '../screens/creator/CreatorProjectDetailScreen';
import { CreatorNewProjectScreen } from '../screens/creator/CreatorNewProjectScreen';
import { CreatorAddStepsScreen } from '../screens/creator/CreatorAddStepsScreen';
import { CreatorEditProjectScreen } from '../screens/creator/CreatorEditProjectScreen';
import { getSharedScreens } from './sharedScreens';

const Stack = createNativeStackNavigator();

export function CreatorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="Tabs" component={CreatorTabs} />
      <Stack.Screen name="CreatorProjectDetail" component={CreatorProjectDetailScreen} />
      <Stack.Screen name="CreatorNewProject" component={CreatorNewProjectScreen} />
      <Stack.Screen name="CreatorAddSteps" component={CreatorAddStepsScreen} />
      <Stack.Screen name="CreatorEditProject" component={CreatorEditProjectScreen} />
      {getSharedScreens(Stack)}
    </Stack.Navigator>
  );
}
