// src/hooks/useDashboard.ts
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { apiService, handleApiError } from '../src/services/apiService';
import { CharacterDashboard } from '../src/types';

interface UseDashboardReturn {
  character: CharacterDashboard | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateAttributes: (attributes: any) => Promise<void>;
}

export const useDashboard = (): UseDashboardReturn => {
  const [character, setCharacter] = useState<CharacterDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const loadCharacterData = useCallback(async () => {
    if (!isAuthenticated) {
      setCharacter(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.getCharacterDashboard();
      setCharacter(data);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      console.error('Error loading character data:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCharacterData();
  }, [loadCharacterData]);

  const refreshData = useCallback(async () => {
    await loadCharacterData();
  }, [loadCharacterData]);

  const updateAttributes = useCallback(async (attributes: {
    strength: number;
    intelligence: number;
    endurance: number;
    availablePoints: number;
  }) => {
    try {
      setError(null);
      
      const updatedData = await apiService.updateCharacterAttributes(attributes);
      
      // Mettre à jour les données locales
      if (character) {
        setCharacter({
          ...character,
          ...updatedData,
        });
      }
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw error;
    }
  }, [character]);

  return {
    character,
    loading,
    error,
    refreshData,
    updateAttributes,
  };
};

// Hook pour les quêtes
export const useQuests = () => {
  const [quests, setQuests] = useState<Record<string, any[]>>({
    AVAILABLE: [],
    IN_PROGRESS: [],
    COMPLETED: [],
    FAILED: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const loadQuests = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.getQuests();
      setQuests(data);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadQuests();
  }, [loadQuests]);

  const updateQuest = useCallback(async (questId: number, action: 'accept' | 'progress' | 'cancel') => {
    try {
      setError(null);
      await apiService.updateQuest(questId, action);
      await loadQuests(); // Recharger les données
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw error;
    }
  }, [loadQuests]);

  return {
    quests,
    loading,
    error,
    refreshQuests: loadQuests,
    updateQuest,
  };
};

// Hook pour les skills
export const useSkills = () => {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const loadSkills = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.getSkills();
      setSkills(data);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  const upgradeSkill = useCallback(async (skillId: number) => {
    try {
      setError(null);
      await apiService.upgradeSkill(skillId);
      await loadSkills();
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw error;
    }
  }, [loadSkills]);

  const removeSkill = useCallback(async (skillId: number) => {
    try {
      setError(null);
      await apiService.removeSkill(skillId);
      await loadSkills();
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw error;
    }
  }, [loadSkills]);

  return {
    skills,
    loading,
    error,
    refreshSkills: loadSkills,
    upgradeSkill,
    removeSkill,
  };
};