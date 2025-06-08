import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { apiService, handleApiError } from '../services/apiService';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasCharacter: boolean | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  setHasCharacter: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const HAS_CHARACTER_KEY = 'has_character';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCharacter, setHasCharacterState] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      const storedUser = await AsyncStorage.getItem(USER_KEY);
      const storedHasCharacter = await AsyncStorage.getItem(HAS_CHARACTER_KEY);

      console.log('🔐 Checking auth status...');
      console.log('🔐 Stored token:', storedToken ? 'exists' : 'none');
      console.log('🔐 Stored user:', storedUser ? 'exists' : 'none');
      console.log('🔐 Stored hasCharacter:', storedHasCharacter);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setHasCharacterState(storedHasCharacter === 'true');
        apiService.setAuthToken(storedToken);
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, HAS_CHARACTER_KEY]);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔐 Attempting login with:', email);
      console.log('🔐 API Base URL:', apiService.debugBaseUrl);

      const response = await apiService.login(email, password);
      
      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
      await AsyncStorage.setItem(HAS_CHARACTER_KEY, response.hasCharacter ? 'true' : 'false');
      
      setToken(response.token);
      setUser(response.user);
      setHasCharacterState(response.hasCharacter);
      apiService.setAuthToken(response.token);

      console.log('✅ Login successful for:', response.user.email);
      console.log('✅ Has character:', response.hasCharacter);
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📝 Attempting registration with:', { name, email });

      await apiService.register(name, email, password);
      
      console.log('✅ Registration successful for:', email);
      
    } catch (error) {
      console.error('❌ Registration failed:', error);
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, HAS_CHARACTER_KEY]);
      
      setToken(null);
      setUser(null);
      setHasCharacterState(null);
      apiService.clearAuthToken();
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  };

  const setHasCharacter = (value: boolean) => {
    setHasCharacterState(value);
    AsyncStorage.setItem(HAS_CHARACTER_KEY, value ? 'true' : 'false');
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    hasCharacter,
    login,
    register,
    logout,
    error,
    clearError,
    setHasCharacter,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};