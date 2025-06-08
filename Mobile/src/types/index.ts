export type CharacterClass = 'WARRIOR' | 'MAGE' | 'ROGUE';

export type QuestStatus = 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export type ItemStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export type Difficulty = 'E' | 'D' | 'C' | 'B' | 'A';

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Character {
  id: number;
  name: string;
  level: number;
  experience: number;
  strength: number;
  intelligence: number;
  endurance: number;
  availablePoints: number;
  maxLevelReached: number;
  maxExpNeeded: number;
  class: CharacterClass;
  createdAt: string;
  updatedAt: string;
  userId: number;
}

export interface CharacterDashboard extends Character {
  user: User;
  skills: Skill[];
  inventory: Item[];
  quests: {
    completed: number;
    inProgress: number;
    failed: number;
  };
}

export interface Skill {
  id: number;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  characterId: number;
}

export interface Item {
  id: number;
  name: string;
  description?: string;
  quantity: number;
  status: ItemStatus;
  characterId: number;
  rewardFromQuestId?: number;
}

export interface Quest {
  id: number;
  title: string;
  description?: string;
  difficulty: Difficulty;
  reward: string;
  progress: number;
  status: QuestStatus;
  completedDate?: string;
  failedDate?: string;
  reason?: string;
  characterId: number;
}

export interface LeaderboardUser {
  id: number;
  rank: number;
  userName: string;
  characterName: string;
  level: number;
  class: CharacterClass;
  experience: number;
  totalCompletedQuests: number;
}

export interface CharacterSidebar {
  userName: string;
  name: string;
  class: CharacterClass;
  level: number;
}