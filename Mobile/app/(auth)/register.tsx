// app/(auth)/register.tsx
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import LoadingSpinner from '../../src/components/common/LoadingSpinner';
import { Colors } from '../../src/constants/colors';
import { useAuth } from '../../src/contexts/AuthContext';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, error, clearError } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
    Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
    Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
    Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setIsLoading(true);
      clearError();
      
      await register(name, email, password);
      
      // Navigation vers le dashboard après inscription réussie
      router.replace('/(auth)/login');
    } catch (error) {
      const errorMessage = (error instanceof Error && error.message) ? error.message : 'An unknown error occurred';
    Alert.alert('Registration Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/(auth)/login');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" message="Creation of the account..." />
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
          <Text style={styles.title}>Becaume a hunter</Text>
          <Text style={styles.subtitle}>Create your account to start the adventure</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your Hunter Name"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="email@chasseur.com"
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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm your password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
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
            style={[
              styles.registerButton, 
              (!name || !email || !password || !confirmPassword || password !== confirmPassword) && styles.buttonDisabled
            ]}
            onPress={handleRegister}
            disabled={!name || !email || !password || !confirmPassword || password !== confirmPassword || isLoading}
          >
            <Text style={styles.registerButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Log in here</Text>
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
  registerButton: {
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
  registerButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});