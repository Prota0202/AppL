// src/routes/api/quests/[id].ts
import { json } from "@solidjs/router";
import { APIEvent } from "@solidjs/start/server";
import jwt from "jsonwebtoken";
import db from "~/lib/db";
import { updateCharacterExpAndLevel } from "~/actions/update-character-exp-and-level";
import { getExpReward } from "~/lib/utils";

async function getUserFromToken(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, process.env.AUTH_SECRET!) as { userId: number };
  
  return await db.user.findUnique({
    where: { id: decoded.userId },
    include: { character: true }
  });
}

export async function PUT({ request, params }: APIEvent) {
  try {
    const user = await getUserFromToken(request);
    if (!user || !user.character) {
      return json({ error: "Character not found" }, { status: 404 });
    }

    const questId = parseInt(params.id);
    const { action } = await request.json();

    const quest = await db.quest.findUnique({
      where: { id: questId },
      include: { character: true }
    });

    if (!quest || quest.characterId !== user.character.id) {
      return json({ error: "Quest not found" }, { status: 404 });
    }

    let updatedQuest;
    let message = "";

    if (action === 'accept' && quest.status === 'AVAILABLE') {
      updatedQuest = await db.quest.update({
        where: { id: questId },
        data: {
          status: 'IN_PROGRESS',
          progress: 0,
        },
      });
      message = "Quest accepted successfully";
    } 
    else if (action === 'progress' && quest.status === 'IN_PROGRESS') {
      const nextProgress = quest.progress + 25;
      const isCompleted = nextProgress >= 100;

      updatedQuest = await db.quest.update({
        where: { id: questId },
        data: {
          progress: Math.min(nextProgress, 100),
          status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
          completedDate: isCompleted ? new Date() : undefined,
        },
        include: {
          character: true,
          itemsRewarded: true,
        }
      });

      if (isCompleted) {
        // Donner l'expérience et gérer le level up
        const gainedExp = getExpReward(quest.difficulty);
        const { leveledUp } = await updateCharacterExpAndLevel({
          character: quest.character,
          experienceGained: gainedExp,
        });

        // Gérer les récompenses d'items
        for (const rewardItem of updatedQuest.itemsRewarded) {
          const existingItem = await db.item.findFirst({
            where: {
              characterId: quest.characterId,
              name: rewardItem.name,
              status: 'COMPLETED'
            },
          });

          if (existingItem) {
            await db.item.update({
              where: { id: existingItem.id },
              data: {
                quantity: {
                  increment: rewardItem.quantity
                },
              },
            });
            await db.item.delete({
              where: { id: rewardItem.id },
            });
          } else {
            await db.item.update({
              where: { id: rewardItem.id },
              data: { status: 'COMPLETED' }
            });
          }
        }

        message = leveledUp 
          ? `Quest completed! You gained ${gainedExp} XP and leveled up!`
          : `Quest completed! You gained ${gainedExp} XP.`;
      } else {
        message = "Progress updated successfully";
      }
    }
    else if (action === 'cancel' && quest.status === 'IN_PROGRESS') {
      updatedQuest = await db.quest.update({
        where: { id: questId },
        data: {
          status: 'FAILED',
          failedDate: new Date(),
          reason: "Cancelled by player",
        },
      });
      message = "Quest cancelled";
    } else {
      return json({ error: "Invalid action for quest status" }, { status: 400 });
    }

    return json({
      message,
      quest: updatedQuest
    });
  } catch (error) {
    console.error('Update quest error:', error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}