// app/(auth)/login.tsx
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { useAuth } from '../../src/contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, clearError } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsLoading(true);
      clearError();
      
      await login(email, password);
      
      // Navigation vers le dashboard après connexion réussie
      router.replace('/(dashboard)');
    } catch (error) {
      // L'erreur est déjà gérée dans le context
      const errorMessage = (error instanceof Error && error.message) ? error.message : 'an unknow error occurred';
      Alert.alert('Erreur de connexion', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/(auth)/register');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Connexion en cours..." />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Enter in the Dunjon</Text>
          <Text style={styles.subtitle}>Continue your adventure</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@dungeon.com"
              placeholderTextColor={Colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.loginButton, (!email || !password) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!email || !password || isLoading}
          >
            <Text style={styles.loginButtonText}>Log in</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>No account ? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerLink}>Register here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 24,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  errorContainer: {
    backgroundColor: '#7C2D12',
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.6,
  },
  loginButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  registerLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});