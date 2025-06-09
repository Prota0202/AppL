import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import LoadingSpinner from '../src/components/common/LoadingSpinner';
import { Colors } from '../src/constants/colors';
import { useAuth } from '../src/contexts/AuthContext';

export default function IndexPage() {
  const { isAuthenticated, isLoading, user, hasCharacter, error, logout } = useAuth();
    
  console.log('🏠 Index page - isAuthenticated:', isAuthenticated);
  console.log('🏠 Index page - isLoading:', isLoading);
  console.log('🏠 Index page - user:', user);
  console.log('🏠 Index page - hasCharacter:', hasCharacter);
  console.log('🏠 Index page - error:', error);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        if (hasCharacter) {
          console.log('✅ User authenticated with character, redirecting to dashboard');
          router.replace('/(dashboard)');
        } else if (hasCharacter === false) {
          console.log('⚠️ User authenticated but no character, redirecting to character creation');
          router.replace('/(dashboard)/character-create');
        } else {
          console.log('🤔 User authenticated, hasCharacter unknown, going to dashboard');
          router.replace('/(dashboard)');
        }
      } else {
        console.log('❌ User not authenticated, redirecting to login');
        router.replace('/(auth)/login');
      }
    }
  }, [isAuthenticated, isLoading, user, hasCharacter]);

  // Temporary debug UI - REMOVE IN PRODUCTION
  if (isAuthenticated && user) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
        <Text style={{ color: Colors.textPrimary, fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
          Debug Mode - User logged in
        </Text>
        <Text style={{ color: Colors.textSecondary, marginBottom: 10, textAlign: 'center' }}>
          Email: {user.email}
        </Text>
        <Text style={{ color: Colors.textSecondary, marginBottom: 20, textAlign: 'center' }}>
          Has character: {hasCharacter?.toString() || 'null'}
        </Text>
        
        <TouchableOpacity 
          style={{
            backgroundColor: Colors.error,
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
          }}
          onPress={async () => {
            await logout();
            console.log('✅ Storage cleared, restarting...');
          }}
        >
          <Text style={{ color: Colors.textPrimary, fontWeight: 'bold' }}>
            Full Logout
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={{
            backgroundColor: Colors.primary,
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
          }}
          onPress={() => router.replace('/(dashboard)')}
        >
          <Text style={{ color: Colors.textPrimary, fontWeight: 'bold' }}>
            Go to Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={{
            backgroundColor: Colors.warning,
            padding: 15,
            borderRadius: 8,
          }}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={{ color: Colors.textPrimary, fontWeight: 'bold' }}>
            Go to Login
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: Colors.background,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <LoadingSpinner 
        size="large" 
        message="Initializing Solo Leveling..." 
      />
    </View>
  );
}
