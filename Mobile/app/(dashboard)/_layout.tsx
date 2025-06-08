import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/colors';
import { AuthProvider } from '../../src/contexts/AuthContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" backgroundColor={Colors.background} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.background },
            }}
          >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="character-create" />
                  <Stack.Screen name="inventory" />
                  <Stack.Screen name="leaderboard" />
                  <Stack.Screen name="quests" />
                  <Stack.Screen name="skills" />
                  <Stack.Screen name="skill-create" />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}