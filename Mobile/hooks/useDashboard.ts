import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { apiService, handleApiError } from '../src/services/apiService';
import { CharacterDashboard } from '../src/types';

interface UseDashboardReturn {
  character: CharacterDashboard | null;
  loading: boolean;
  error: string | null;
  needsCharacterCreation: boolean;
  refreshData: () => Promise<void>;
  updateAttributes: (attributes: any) => Promise<void>;
}

export const useDashboard = (): UseDashboardReturn => {
  const [character, setCharacter] = useState<CharacterDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsCharacterCreation, setNeedsCharacterCreation] = useState(false);
  const { isAuthenticated, user, hasCharacter, setHasCharacter } = useAuth();

  const loadCharacterData = useCallback(async () => {
    if (!isAuthenticated) {
      setCharacter(null);
      setLoading(false);
      return;
    }

    // Si on sait déjà qu'il n'y a pas de personnage, pas besoin d'appeler l'API
    if (hasCharacter === false) {
      setNeedsCharacterCreation(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setNeedsCharacterCreation(false);
      
      const data = await apiService.getCharacterDashboard();
      setCharacter(data);
      
      // Mettre à jour le contexte auth si le personnage existe
      if (hasCharacter !== true) {
        setHasCharacter(true);
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      
      // Si c'est une erreur 404 "Character not found", c'est qu'il faut créer un personnage
      if (errorMessage.includes('Character not found') || errorMessage.includes('not found')) {
        console.log('⚠️ Character not found, user needs to create one');
        setNeedsCharacterCreation(true);
        setHasCharacter(false);
        setError(null); // On ne considère pas ça comme une erreur
      } else {
        console.error('❌ Error loading character data:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, hasCharacter, setHasCharacter]);

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
    needsCharacterCreation,
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
      const result = await apiService.upgradeSkill(skillId);
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw error;
    }
  }, []);

  const removeSkill = useCallback(async (skillId: number) => {
    try {
      setError(null);
      await apiService.removeSkill(skillId);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
      throw error;
    }
  }, []);

  return {
    skills,
    loading,
    error,
    refreshSkills: loadSkills,
    upgradeSkill,
    removeSkill,
  };
};


// Hook pour l'inventaire
export const useInventory = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const loadInventory = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await apiService.getInventory();
      setItems(data);
    } catch (error) {
      const errorMessage = handleApiError(error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  return {
    items,
    loading,
    error,
    refreshInventory: loadInventory,
  };
};