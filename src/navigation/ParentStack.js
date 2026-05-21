import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ParentTabs } from './ParentTabs';
import { ParentChildProgressScreen } from '../screens/parent/ParentChildProgressScreen';
import { ParentChildProjectViewScreen } from '../screens/parent/ParentChildProjectViewScreen';
import { ParentLinkChildScreen } from '../screens/parent/ParentLinkChildScreen';
import { ParentNotificationsScreen } from '../screens/parent/ParentNotificationsScreen';
import { getSharedScreens } from './sharedScreens';

const Stack = createNativeStackNavigator();

export function ParentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
      <Stack.Screen name="Tabs" component={ParentTabs} />
      <Stack.Screen name="ParentChildProgress" component={ParentChildProgressScreen} />
      <Stack.Screen name="ParentChildProjectView" component={ParentChildProjectViewScreen} />
      <Stack.Screen name="ParentLinkChild" component={ParentLinkChildScreen} />
      <Stack.Screen name="ParentNotifications" component={ParentNotificationsScreen} />
      {getSharedScreens(Stack)}
    </Stack.Navigator>
  );
}
