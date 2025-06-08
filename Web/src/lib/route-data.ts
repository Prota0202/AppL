import { getSession } from "@auth/solid-start";
import { query, redirect } from "@solidjs/router";
import { authOptions } from "~/routes/api/auth/[...solidauth]";
import db from "./db";
import { CharacterSidebar, LeaderboardUser, Quest, QuestStatus, Skill, Item } from "./types";
import { getRequestEvent } from "solid-js/web";

// Helper pour obtenir l'utilisateur authentifié
export const getAuthenticatedUser = query(async () => {
  "use server";
  
  const event = getRequestEvent();
  if (!event) throw new Error("No request event");
  
  const session = await getSession(event.request, authOptions);
  
  if (!session?.user?.email) {
    throw redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    throw redirect("/login");
  }

  return user;
}, "authenticated-user");

// Helper pour obtenir le personnage de l'utilisateur (avec redirection si pas de personnage)
export const getUserCharacter = query(async () => {
  "use server";
  
  const event = getRequestEvent();
  if (!event) throw new Error("No request event");
  
  const session = await getSession(event.request, authOptions);
  
  if (!session?.user?.email) {
    throw redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    throw redirect("/login");
  }
  
  const character = await db.character.findUnique({
    where: { userId: user.id },
    include: {
      user: true
    }
  });

  if (!character) {
    throw redirect("/character/create");
  }

  return character;
}, "user-character");

// Données pour la sidebar (sans dépendance sur getUserCharacter)
export const getSidebarData = query(async (): Promise<CharacterSidebar | null> => {
  "use server";
  
  try {
    const event = getRequestEvent();
    if (!event) return null;
    
    const session = await getSession(event.request, authOptions);
    
    if (!session?.user?.email) {
      return null;
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return null;
    }
    
    const character = await db.character.findUnique({
      where: { userId: user.id },
      include: {
        user: true
      }
    });

    if (!character) {
      return null;
    }

    return {
      userName: character.user.name || "Unknown",
      name: character.name,
      class: character.class,
      level: character.level
    };
  } catch (error) {
    console.log("Error in getSidebarData:", error);
    return null;
  }
}, "sidebar-data");

// Données pour l'inventaire
export const getInventoryData = query(async (): Promise<Item[]> => {
  "use server";
  
  const character = await getUserCharacter();

  const inventory = await db.item.findMany({
    where: {
      characterId: character.id,
      status: 'COMPLETED'
    },
  });

  return inventory;
}, "inventory-data");

// Données pour les skills
export const getSkillsData = query(async (): Promise<Skill[]> => {
  "use server";
  
  const character = await getUserCharacter();

  const skills = await db.skill.findMany({
    where: { characterId: character.id },
  });

  return skills;
}, "skills-data");

// Données pour les quêtes
export const getQuestsData = query(async () => {
  "use server";
  
  const character = await getUserCharacter();

  const quests = await db.quest.findMany({
    where: { characterId: character.id },
  });

  const grouped: Record<QuestStatus, Quest[]> = {
    AVAILABLE: [],
    IN_PROGRESS: [],
    COMPLETED: [],
    FAILED: [],
  };

  for (const quest of quests) {
    grouped[quest.status].push(quest);
  }

  return grouped;
}, "quests-data");

// Données pour le leaderboard
export const getLeaderboardData = query(async () => {
  "use server";
  
  const character = await getUserCharacter();

  const topCharacters = await db.character.findMany({
    orderBy: [
      { level: "desc" },
      { experience: "desc" },
    ],
    take: 99,
    include: {
      user: true,
      quests: {
        where: { status: "COMPLETED" },
        select: { id: true },
      },
    },
  });

  const leaderboardData: LeaderboardUser[] = topCharacters.map((char, index) => ({
    id: char.id,
    rank: index + 1,
    userName: char.user.name || "Unknown",
    characterName: char.name,
    level: char.level,
    class: char.class,
    experience: char.experience,
    totalCompletedQuests: char.quests.length,
  }));

  const rankIndex = leaderboardData.findIndex((char) => char.id === character.id);

  const currentUser: LeaderboardUser = {
    id: character.id,
    rank: rankIndex === -1 ? 100 : (rankIndex + 1),
    userName: character.user.name || "Unknown",
    characterName: character.name,
    level: character.level,
    class: character.class,
    experience: character.experience,
    totalCompletedQuests: await db.quest.count({
      where: {
        characterId: character.id,
        status: "COMPLETED"
      }
    }),
  };

  return {
    leaderboard: leaderboardData,
    user: currentUser
  };
}, "leaderboard-data");

// Vérifier si l'utilisateur a un personnage
export const checkUserCharacter = query(async () => {
  "use server";
  
  const event = getRequestEvent();
  if (!event) throw new Error("No request event");
  
  const session = await getSession(event.request, authOptions);
  
  if (!session?.user?.email) {
    throw redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    throw redirect("/login");
  }
  
  const character = await db.character.findUnique({
    where: { userId: user.id },
    select: { id: true }
  });

  return {
    hasCharacter: !!character,
    userId: user.id
  };
}, "check-character");