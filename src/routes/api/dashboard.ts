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
      where: { email: session.user.email! }
    });

    if (!user) {
      return json({ error: "Unauthorized" }, { status: 403 });
    }

    const character = await db.character.findUnique({
      where: { userId: user.id },
      include: {
        user: true,
        skills: { take: 4 },
        inventory: { take: 3 },
      }
    });

    if (!character) {
      return json({ error: "Character not found" }, { status: 404 });
    }

    const [completedCount, inProgressCount, failedCount] = await Promise.all([
      db.quest.count({
        where: {
          characterId: character.id,
          status: "COMPLETED",
        },
      }),
      db.quest.count({
        where: {
          characterId: character.id,
          status: "IN_PROGRESS",
        },
      }),
      db.quest.count({
        where: {
          characterId: character.id,
          status: "FAILED",
        },
      }),
    ]);

    const enrichedCharacter = {
      ...character,
      quests: {
        completed: completedCount,
        inProgress: inProgressCount,
        failed: failedCount,
      },
    };

    return json(enrichedCharacter);
  } catch (error) {
    console.error("Error fetching character:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
