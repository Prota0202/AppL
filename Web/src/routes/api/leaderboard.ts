import { getSession } from "@auth/solid-start";
import { APIEvent } from "node_modules/@solidjs/start/dist/server";
import { json } from "@solidjs/router";
import db from "~/lib/db";
import { authOptions } from "./auth/[...solidauth]";
import { authenticateRequest } from "~/lib/jwt-auth";

export async function GET({ request }: APIEvent) {
  try {
    let user;
    let characterId;

    // Essayer d'abord l'authentification JWT (mobile)
    try {
      user = await authenticateRequest(request);
      console.log('✅ Mobile JWT auth successful for leaderboard:', user.email);

      const dbUser = await db.user.findUnique({
        where: { id: user.id },
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

      if (!dbUser || !dbUser.character) {
        return json({ error: "Character not found" }, { status: 404 });
      }

      characterId = dbUser.character.id;
      user = dbUser; // Use the full user object with character

    } catch (jwtError) {
      // Fallback vers l'authentification session (web)
      console.log('🔄 JWT auth failed, trying session auth for leaderboard');
      
      const session = await getSession(request, authOptions);

      if (!session?.user) {
        return json({ error: "Unauthorized" }, { status: 403 });
      }

      user = await db.user.findUnique({
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

      if (!user || !user.character) {
        return json({ error: "Character not found" }, { status: 404 });
      }

      characterId = user.character.id;
    }

    // Récupérer le top des personnages
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
      userName: char.user.name || "Unknown",
      characterName: char.name,
      level: char.level,
      class: char.class,
      experience: char.experience,
      totalCompletedQuests: char.quests.length,
    }));

    const rankIndex = leaderboardData.findIndex((char) => char.id === characterId);
    const char = user.character!;

    const currentUser = {
      id: char.id,
      rank: rankIndex === -1 ? 100 : (rankIndex + 1),
      userName: user.name || "Unknown",
      characterName: char.name,
      level: char.level,
      class: char.class,
      experience: char.experience,
      totalCompletedQuests: char.quests.length,
    };

    console.log('🏆 Leaderboard data loaded successfully');
    
    return json({
      leaderboard: leaderboardData,
      user: currentUser
    });

  } catch (error) {
    console.error("Error fetching leaderboard:", error);
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