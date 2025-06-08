import { getSession } from "@auth/solid-start";
import { APIEvent } from "node_modules/@solidjs/start/dist/server";
import { json } from "@solidjs/router";
import db from "~/lib/db";
import { authOptions } from "./auth/[...solidauth]";
import { authenticateRequest } from "~/lib/jwt-auth";

export async function GET({ request }: APIEvent) {
  try {
    
    try {
      const user = await authenticateRequest(request);
      console.log('✅ Mobile JWT auth successful for inventory:', user.email);

      const character = await db.character.findUnique({
        where: { userId: user.id },
        select: { id: true }
      });

      if (!character) {
        return json({ error: "Character not found" }, { status: 404 });
      }

      const inventory = await db.item.findMany({
        where: {
          characterId: character.id,
          status: 'COMPLETED'
        },
        orderBy: {
          id: 'desc' // Les items les plus récents en premier
        }
      });

      console.log('📦 Inventory loaded for character:', character.id, 'Items count:', inventory.length);
      return json(inventory);

    } catch (jwtError) {
      // Fallback vers l'authentification session (web)
      console.log('🔄 JWT auth failed, trying session auth for inventory');
      
      const session = await getSession(request, authOptions);

      if (!session?.user) {
        return json({ error: "Unauthorized" }, { status: 403 });
      }

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

      const inventory = await db.item.findMany({
        where: {
          characterId: user.character.id,
          status: 'COMPLETED'
        },
        orderBy: {
          id: 'desc'
        }
      });

      console.log('📦 Inventory loaded via session for character:', user.character.id, 'Items count:', inventory.length);
      return json(inventory);
    }
  } catch (error) {
    console.error("Error fetching inventory:", error);
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