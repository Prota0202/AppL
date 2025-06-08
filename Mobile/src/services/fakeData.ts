import { Character, CharacterDashboard, Item, LeaderboardUser, Quest, QuestStatus, Skill } from '../types';

export const fakeUser = {
  id: 1,
  email: 'sung.jinwoo@hunters.com',
  name: 'Sung Jin-Woo',
};

export const fakeCharacter: Character = {
  id: 1,
  name: 'Shadow Monarch',
  level: 15,
  experience: 1250,
  strength: 25,
  intelligence: 15,
  endurance: 20,
  availablePoints: 3,
  maxLevelReached: 100,
  maxExpNeeded: 2000,
  class: 'WARRIOR',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-20T15:30:00Z',
  userId: 1,
};

export const fakeSkills: Skill[] = [
  {
    id: 1,
    name: 'Shadow Extraction',
    description: 'Extract shadows from defeated enemies to create loyal minions',
    level: 3,
    maxLevel: 15,
    characterId: 1,
  },
  {
    id: 2,
    name: "Dominator's Touch",
    description: 'Control and command shadow soldiers with enhanced power',
    level: 2,
    maxLevel: 10,
    characterId: 1,
  },
  {
    id: 3,
    name: 'Shadow Exchange',
    description: 'Instantly teleport between shadows within range',
    level: 1,
    maxLevel: 8,
    characterId: 1,
  },
  {
    id: 4,
    name: 'Ruler\'s Authority',
    description: 'Telekinetic power to move objects and enemies',
    level: 4,
    maxLevel: 12,
    characterId: 1,
  },
];

export const fakeItems: Item[] = [
  {
    id: 1,
    name: "Knight's Dagger",
    description: 'A sharp dagger imbued with shadow energy. +5 Strength',
    quantity: 1,
    status: 'COMPLETED',
    characterId: 1,
  },
  {
    id: 2,
    name: 'Health Potion',
    description: 'Restores 50 HP when consumed',
    quantity: 5,
    status: 'COMPLETED',
    characterId: 1,
  },
  {
    id: 3,
    name: 'Shadow Armor',
    description: 'Armor forged from condensed shadows. +10 Endurance',
    quantity: 1,
    status: 'COMPLETED',
    characterId: 1,
  },
  {
    id: 4,
    name: 'Monster Core',
    description: 'A rare crystalline core from a high-level monster',
    quantity: 3,
    status: 'COMPLETED',
    characterId: 1,
  },
  {
    id: 5,
    name: 'Magic Scroll',
    description: 'Ancient scroll containing powerful spells',
    quantity: 2,
    status: 'COMPLETED',
    characterId: 1,
  },
];

export const fakeQuests: Record<QuestStatus, Quest[]> = {
  AVAILABLE: [
    {
      id: 1,
      title: 'Clear the Goblin Dungeon',
      description: 'Eliminate all goblins in the E-rank dungeon',
      difficulty: 'E',
      reward: '50 XP + x2 Health Potion',
      progress: 0,
      status: 'AVAILABLE',
      characterId: 1,
    },
    {
      id: 2,
      title: 'Hunt the Red Orc',
      description: 'Defeat the Red Orc boss in the D-rank gate',
      difficulty: 'D',
      reward: '150 XP + x1 Monster Core',
      progress: 0,
      status: 'AVAILABLE',
      characterId: 1,
    },
  ],
  IN_PROGRESS: [
    {
      id: 3,
      title: 'Collect Magic Crystals',
      description: 'Gather 10 magic crystals from the Crystal Cave',
      difficulty: 'C',
      reward: '300 XP + x3 Magic Scroll',
      progress: 60,
      status: 'IN_PROGRESS',
      characterId: 1,
    },
  ],
  COMPLETED: [
    {
      id: 4,
      title: 'First Shadow Extraction',
      description: 'Successfully extract your first shadow soldier',
      difficulty: 'B',
      reward: '500 XP + Shadow Extraction Skill',
      progress: 100,
      status: 'COMPLETED',
      completedDate: '2024-01-18T14:00:00Z',
      characterId: 1,
    },
    {
      id: 5,
      title: 'Defeat the Stone Golem',
      description: 'Overcome the guardian of the ancient ruins',
      difficulty: 'A',
      reward: '1000 XP + Knight\'s Dagger',
      progress: 100,
      status: 'COMPLETED',
      completedDate: '2024-01-19T16:30:00Z',
      characterId: 1,
    },
  ],
  FAILED: [
    {
      id: 6,
      title: 'Raid the Dragon\'s Lair',
      description: 'Challenge the ancient dragon (attempted too early)',
      difficulty: 'A',
      reward: '1000 XP + Dragon Scale Armor',
      progress: 25,
      status: 'FAILED',
      failedDate: '2024-01-17T12:00:00Z',
      reason: 'Insufficient level - recommended level 25+',
      characterId: 1,
    },
  ],
};

export const fakeCharacterDashboard: CharacterDashboard = {
  ...fakeCharacter,
  user: fakeUser,
  skills: fakeSkills.slice(0, 4),
  inventory: fakeItems.slice(0, 3),
  quests: {
    completed: fakeQuests.COMPLETED.length,
    inProgress: fakeQuests.IN_PROGRESS.length,
    failed: fakeQuests.FAILED.length,
  },
};

export const fakeLeaderboard: LeaderboardUser[] = [
  {
    id: 5,
    rank: 1,
    userName: 'Thomas Andre',
    characterName: 'The Goliath',
    level: 28,
    class: 'WARRIOR',
    experience: 15420,
    totalCompletedQuests: 45,
  },
  {
    id: 3,
    rank: 2,
    userName: 'Liu Zhigang',
    characterName: 'Thunder Emperor',
    level: 25,
    class: 'MAGE',
    experience: 12890,
    totalCompletedQuests: 38,
  },
  {
    id: 1,
    rank: 3,
    userName: 'Sung Jin-Woo',
    characterName: 'Shadow Monarch',
    level: 15,
    class: 'WARRIOR',
    experience: 1250,
    totalCompletedQuests: 2,
  },
  {
    id: 4,
    rank: 4,
    userName: 'Christopher Reed',
    characterName: 'Storm Caller',
    level: 22,
    class: 'MAGE',
    experience: 8750,
    totalCompletedQuests: 28,
  },
  {
    id: 2,
    rank: 5,
    userName: 'Cha Hae-In',
    characterName: 'Sword Saint',
    level: 20,
    class: 'ROGUE',
    experience: 7200,
    totalCompletedQuests: 25,
  },
];

export const availableItems = [
  { id: 1, name: "Steel Sword", description: "A basic sword for combat" },
  { id: 2, name: "Health Potion", description: "Restores HP when used" },
  { id: 3, name: "Shadow Armor", description: "Armor made of shadows" },
  { id: 4, name: "Monster Core", description: "A rare material from high-level monsters" },
  { id: 5, name: "Magic Scroll", description: "A scroll for learning new spells" },
  { id: 6, name: "Dragon Scale", description: "Scales from ancient dragons" },
  { id: 7, name: "Elven Bow", description: "A bow crafted by forest elves" },
  { id: 8, name: "Mystic Orb", description: "An orb containing magical energy" },
];

// Helper functions for fake API simulation
export const getExpReward = (difficulty: 'E' | 'D' | 'C' | 'B' | 'A'): number => {
  switch (difficulty) {
    case 'E': return 50;
    case 'D': return 150;
    case 'C': return 300;
    case 'B': return 500;
    case 'A': return 1000;
    default: return 0;
  }
};

export const simulateApiDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};