import db from "~/lib/db";
import { Character } from "~/lib/types";

type UpdateCharacterOptions = {
  character: Character;
  experienceGained: number;
};

type UpdateCharacterResult = {
  updatedCharacter: Character;
  leveledUp: boolean;
};

export async function updateCharacterExpAndLevel({
  character,
  experienceGained,
}: UpdateCharacterOptions): Promise<UpdateCharacterResult> {
  let newExp = character.experience + experienceGained;
  let newLevel = character.level;
  let newAvailablePoints = character.availablePoints;
  let newMaxExpNeeded = character.maxExpNeeded;
  let leveledUp = false;

  const reachedMaxLevel = character.level >= character.maxLevelReached;

  if (!reachedMaxLevel && newExp >= character.maxExpNeeded) {
    newLevel += 1;
    newAvailablePoints += 5;
    newMaxExpNeeded = Math.floor(character.maxExpNeeded * 2.5);
    leveledUp = true;
  } else if (reachedMaxLevel && newExp >= character.maxExpNeeded) {
    
    newMaxExpNeeded = 0;
  }

  const updatedCharacter = await db.character.update({
    where: { id: character.id },
    data: {
      experience: newExp,
      level: newLevel,
      availablePoints: newAvailablePoints,
      maxExpNeeded: newMaxExpNeeded,
    },
  });

  return {
    updatedCharacter,
    leveledUp,
  };
}
