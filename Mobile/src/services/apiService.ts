// src/services/apiService.ts
import { CharacterDashboard, Item, LeaderboardUser, Quest, QuestStatus, Skill } from '../types';

// Configuration de l'API
const API_BASE_URL = 'http://192.168.129.12:3000/api';


class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // ✅ Ajoute cette méthode publique pour debug
  get debugBaseUrl() {
    return this.baseUrl;
  }

  // Configuration de l'authentification
  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  // Méthode privée pour faire les requêtes
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // ✅ Ajoute ces logs pour debug
    console.log('🚀 Making request to:', url);
    console.log('🚀 Base URL:', this.baseUrl);
    console.log('🚀 Endpoint:', endpoint);
    console.log('🚀 Options:', options);

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      defaultHeaders.Authorization = `Bearer ${this.authToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // ✅ Ajoute aussi ce log
      console.log('📡 Response status:', response.status);
      console.log('📡 Response URL:', response.url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<{ user: any; token: string }> {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string): Promise<{ message: string }> {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  // Character Dashboard
  async getCharacterDashboard(): Promise<CharacterDashboard> {
    return this.makeRequest('/dashboard');
  }

  // Character Management
  async getCharacter(): Promise<any> {
    return this.makeRequest('/character');
  }

  async createCharacter(characterData: {
    name: string;
    class: string;
    strength: number;
    intelligence: number;
    endurance: number;
  }): Promise<any> {
    return this.makeRequest('/character', {
      method: 'POST',
      body: JSON.stringify(characterData),
    });
  }

  async updateCharacterAttributes(attributes: {
    strength: number;
    intelligence: number;
    endurance: number;
    availablePoints: number;
  }): Promise<any> {
    return this.makeRequest('/character/attributes', {
      method: 'PUT',
      body: JSON.stringify(attributes),
    });
  }

  // Quests
  async getQuests(): Promise<Record<QuestStatus, Quest[]>> {
    return this.makeRequest('/quests');
  }

  async updateQuest(questId: number, action: 'accept' | 'progress' | 'cancel'): Promise<any> {
    return this.makeRequest(`/quests/${questId}`, {
      method: 'PUT',
      body: JSON.stringify({ action }),
    });
  }

  async createQuest(questData: {
    title: string;
    description: string;
    difficulty: string;
    rewards: any[];
  }): Promise<any> {
    return this.makeRequest('/quests', {
      method: 'POST',
      body: JSON.stringify(questData),
    });
  }

  // Skills
  async getSkills(): Promise<Skill[]> {
    return this.makeRequest('/skills');
  }

  async upgradeSkill(skillId: number): Promise<any> {
    return this.makeRequest(`/skills/${skillId}/upgrade`, {
      method: 'PUT',
    });
  }

  async removeSkill(skillId: number): Promise<any> {
    return this.makeRequest(`/skills/${skillId}`, {
      method: 'DELETE',
    });
  }

  async createSkill(skillData: {
    name: string;
    description: string;
    maxLevel: number;
  }): Promise<any> {
    return this.makeRequest('/skills', {
      method: 'POST',
      body: JSON.stringify(skillData),
    });
  }

  // Inventory
  async getInventory(): Promise<Item[]> {
    return this.makeRequest('/inventory');
  }

  // Leaderboard
  async getLeaderboard(): Promise<{
    leaderboard: LeaderboardUser[];
    user: LeaderboardUser;
  }> {
    return this.makeRequest('/leaderboard');
  }

  // Sidebar data
  async getSidebarData(): Promise<any> {
    return this.makeRequest('/sidebar');
  }
}

// Instance exportée
export const apiService = new ApiService(API_BASE_URL);

// Helper pour gérer les erreurs réseau
export const handleApiError = (error: any): string => {
  if (error.message.includes('Network request failed')) {
    return 'Connexion réseau impossible. Vérifiez votre connexion internet.';
  }
  
  if (error.message.includes('HTTP 401')) {
    return 'Session expirée. Veuillez vous reconnecter.';
  }
  
  if (error.message.includes('HTTP 403')) {
    return 'Accès non autorisé.';
  }
  
  if (error.message.includes('HTTP 404')) {
    return 'Ressource non trouvée.';
  }
  
  if (error.message.includes('HTTP 500')) {
    return 'Erreur serveur. Veuillez réessayer plus tard.';
  }
  
  return error.message || 'Une erreur inattendue s\'est produite.';
};