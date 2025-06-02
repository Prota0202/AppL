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
      select: {
        character: {
          select: { id: true }
        }
      }
    });

    if (!user) {
      return json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!user.character) {
      return json({ error: "Character not found" }, { status: 404 });
    }

    const quests = await db.quest.findMany({
      where: { characterId: user.character.id },
    });

    const grouped = {
      AVAILABLE: [] as typeof quests,
      IN_PROGRESS: [] as typeof quests,
      COMPLETED: [] as typeof quests,
      FAILED: [] as typeof quests,
    };

    for (const quest of quests) {
      grouped[quest.status].push(quest);
    }

    return json(grouped);
  } catch (error) {
    console.error("Error fetching character:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
