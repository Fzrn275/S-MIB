import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegStep1 } from '../screens/auth/RegStep1';
import { RegStep2 } from '../screens/auth/RegStep2';
import { RegVerify } from '../screens/auth/RegVerify';
import { RegSuccess } from '../screens/auth/RegSuccess';

const Stack = createNativeStackNavigator();

/**
 * Auth flow stack: login + the 3-step registration flow ending in a success
 * screen whose CTA enters the app.
 */
export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RegStep1" component={RegStep1} />
      <Stack.Screen name="RegStep2" component={RegStep2} />
      <Stack.Screen name="RegVerify" component={RegVerify} />
      <Stack.Screen name="RegSuccess" component={RegSuccess} options={{ animation: 'fade_from_bottom' }} />
    </Stack.Navigator>
  );
}
