import { APIEvent } from "node_modules/@solidjs/start/dist/server";
import { json } from "@solidjs/router";
import db from "~/lib/db";
import { authenticateRequest } from "~/lib/jwt-auth";

export async function GET({ request }: APIEvent) {
  try {
    // Authentification JWT au lieu de getSession
    const user = await authenticateRequest(request);

    const character = await db.character.findUnique({
      where: { userId: user.id },
      include: {
        user: true,
        skills: { take: 4 },
        inventory: { take: 3, where: { status: 'COMPLETED' } },
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
    console.error("Authentication error:", error);
    
    if (error instanceof Error && error.message.includes('token')) {
      return json({ error: "Invalid authentication token" }, { status: 401 });
    }
    
    return json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS', 
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}