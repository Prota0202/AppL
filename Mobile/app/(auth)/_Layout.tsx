// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '../../src/constants/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}