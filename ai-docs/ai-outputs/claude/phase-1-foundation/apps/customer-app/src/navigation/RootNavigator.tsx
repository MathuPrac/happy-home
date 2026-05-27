import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

// Screens (imported lazily in production)
const Stack = createStackNavigator();

export function RootNavigator(): React.JSX.Element {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStackNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MainTabNavigator(): React.JSX.Element {
  return <></>;  // TODO: Implement tab navigator
}

function AuthStackNavigator(): React.JSX.Element {
  return <></>;  // TODO: Implement auth stack
}
