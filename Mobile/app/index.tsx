// app/index.tsx
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import LoadingSpinner from '../src/components/common/LoadingSpinner';
import { Colors } from '../src/constants/colors';
import { useAuth } from '../src/contexts/AuthContext';

export default function IndexPage() {
  const { isAuthenticated, isLoading } = useAuth();
    console.log('🏠 Index page - isAuthenticated:', isAuthenticated);
    console.log('🏠 Index page - isLoading:', isLoading);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(dashboard)');
        console.log('connecté');
      } else {
        router.replace('/(auth)/register');
        console.log('pas connecté');
      }
    }
  }, [isAuthenticated, isLoading]);

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: Colors.background,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <LoadingSpinner 
        size="large" 
        message="Initialisation de Solo Leveling..." 
      />
    </View>
  );
}