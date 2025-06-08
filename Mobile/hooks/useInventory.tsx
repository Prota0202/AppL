import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { apiService, handleApiError } from '../src/services/apiService';
import { Item } from '../src/types';

interface UseInventoryReturn {
  items: Item[];
  loading: boolean;
  error: string | null;
  refreshInventory: () => Promise<void>;
}

export const useInventory = (): UseInventoryReturn => {
  const [items, setItems] = useState<Item[]>([]);
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
      console.error('❌ Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const refreshInventory = useCallback(async () => {
    await loadInventory();
  }, [loadInventory]);

  return {
    items,
    loading,
    error,
    refreshInventory,
  };
};