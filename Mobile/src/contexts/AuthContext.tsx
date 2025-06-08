// src/contexts/AuthContext.tsx
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
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si l'utilisateur est connecté au démarrage
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
      const storedUser = await AsyncStorage.getItem(USER_KEY);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        apiService.setAuthToken(storedToken);
      }
      // Dans useEffect de checkAuthStatus
    console.log('🔐 Checking auth status...');
    console.log('🔐 Stored token:', storedToken ? 'exists' : 'none');
    console.log('🔐 Stored user:', storedUser ? 'exists' : 'none');
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

        console.log('🔐 Attempting login with:', email);
        console.log('🔐 API Base URL:', apiService.debugBaseUrl); // ⚠️ Ajoute cette propriété publique

      const response = await apiService.login(email, password);
      
      // Stocker les données d'authentification
      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
      apiService.setAuthToken(response.token);
    } catch (error) {
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

    await apiService.register(name, email, password);
    
    // ❌ Commente cette ligne temporairement
    // await login(email, password);
    
    console.log('✅ Registration successful!');
    
  } catch (error) {
    const errorMessage = handleApiError(error);
    setError(errorMessage);
    throw new Error(errorMessage);
  } finally {
    setIsLoading(false);
  }
};

  const logout = async () => {
    try {
      // Supprimer les données stockées
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      
      // Réinitialiser l'état
      setToken(null);
      setUser(null);
      apiService.clearAuthToken();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    error,
    clearError,
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