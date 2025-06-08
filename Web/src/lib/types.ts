import {CharacterClass,Character as CharacterType,User,Skill as SkillType,QuestStatus as QuestStatusType,Quest as QuestType,Item as ItemType} from '@prisma-app/client';

export interface CharacterSidebar {
  userName: string;
  name: string;
  class: CharacterClass;
  level: number;
}

export type CharacterDashboard = CharacterType & {
  user: User;
  skills: SkillType[];
  inventory: ItemType[];
  quests: {
    completed: number;
    inProgress: number;
    failed: number;
  }
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
export type Skill = SkillType;

export type Character = CharacterType;

export type QuestStatus = QuestStatusType;

export type Quest = QuestType;

export type Item = ItemType;