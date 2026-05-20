import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { AuthStack } from './AuthStack';
import { LearnerTabs } from './LearnerTabs';
import { CreatorTabs } from './CreatorTabs';
import { ParentTabs } from './ParentTabs';
import { ScreenBackground } from '../components/ScreenBackground';
import { colors } from '../theme/tokens';

const RootStack = createNativeStackNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: 'transparent',
    card: 'transparent',
    border: 'transparent',
    primary: colors.teal,
    text: colors.white,
  },
};

function RoleRouter() {
  const { user } = useAuth();
  if (!user) return null; // RootNavigator picks AuthStack in this case
  if (user.isLearner && user.isLearner()) return <LearnerTabs />;
  if (user.isCreator && user.isCreator()) return <CreatorTabs />;
  if (user.isParent && user.isParent()) return <ParentTabs />;
  // Fallback: treat unknown role as learner shell so the app never dead-ends.
  return <LearnerTabs />;
}

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <ScreenBackground>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.cyan} />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <RootStack.Screen name="Main" component={RoleRouter} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthStack} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
