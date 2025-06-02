import { getSession } from "@auth/solid-start";
import { APIEvent } from "node_modules/@solidjs/start/dist/server";
import { json } from "@solidjs/router";
import db from "~/lib/db";
import { authOptions } from "./auth/[...solidauth]";

export async function GET({ request }: APIEvent) {
  const session = await getSession(request, authOptions);

  if (!session?.user) {
    return json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const user = await db.user.findUnique({
      where: { email: session.user.email! },
      include: {
        character: {
          include: {
            quests: {
              where: { status: "COMPLETED" },
              select: { id: true },
            },
          }
        }
      }
    });

    if (!user) {
      return json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!user.character) {
      return json({ error: "Character not found" }, { status: 404 });
    }

    const characterId = user.character.id;

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

    const leaderboardData = topCharacters.map((char, index) => ({
      id: char.id,
      rank: index + 1,
      userName: char.user.name,
      characterName: char.name,
      level: char.level,
      class: char.class,
      experience: char.experience,
      totalCompletedQuests: char.quests.length,
    }));

    const rankIndex = leaderboardData.findIndex((char) => char.id === characterId);
    const char = user.character;

    return json({
      leaderboard: leaderboardData,
      user: {
        id: char.id,
        rank: rankIndex === -1 ? '99+' : (rankIndex + 1).toString(),
        userName: user.name,
        characterName: char.name,
        level: char.level,
        class: char.class,
        experience: char.experience,
        totalCompletedQuests: char.quests.length,
      }
    });
  } catch (error) {
    console.error("Error fetching character:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
