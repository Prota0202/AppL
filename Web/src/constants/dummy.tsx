import { QuestStatus } from "~/lib/types";

export const availableItems = [
  { id: 1, name: "Steel Sword", description: "A basic sword for combat" },
  { id: 2, name: "Health Potion", description: "Restores HP when used" },
  { id: 3, name: "Shadow Armor", description: "Armor made of shadows" },
  { id: 4, name: "Monster Core", description: "A rare material from high-level monsters" },
  { id: 5, name: "Magic Scroll", description: "A scroll for learning new spells" }
];

export const questTabs: { label: string; value: QuestStatus }[] = [
  { label: 'Available', value: 'AVAILABLE' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Failed', value: 'FAILED' },
];

export const dummyCharacter = {
  id: 1,
  name: "Gojo Satoru",
  level: 15,
  experience: 1250,
  nextLevelExp: 2000,
  class: "WARRIOR",
  strength: 25,
  intelligence: 15,
  endurance: 20,
  quests: {
    completed: 12,
    inProgress: 3,
    failed: 2
  },
  skills: [
    { id: 1, name: "Shadow Extraction", level: 3, maxLevel: 15 },
    { id: 2, name: "Dominator's Touch", level: 2, maxLevel: 10 },
  ],
  items: [
    { id: 1, name: "Knight's Dagger", description: "A sharp dagger with +5 strength", quantity: 1 },
    { id: 2, name: "Health Potion", description: "Restores 50 HP", quantity: 5 },
  ]
};

export const navigationItems = [
  {
    name: "Dashboard", path: "/", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    )
  },
  {
    name: "Quest", path: "/quests", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
      </svg>
    )
  },
  {
    name: "Inventory", path: "/inventory", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
      </svg>
    )
  },
  {
    name: "Skills", path: "/skills", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
      </svg>
    )
  },
  {
    name: "Leaderboard", path: "/leaderboard", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
      </svg>
    )
  },
];