import { json } from "@solidjs/router";
import { APIEvent } from "@solidjs/start/server";
import db from "~/lib/db";
import { authenticateRequest } from "~/lib/jwt-auth";

export async function GET({ request }: APIEvent) {
  try {
    console.log('🔧 Skills GET API called');
    
    // Authentification JWT
    const user = await authenticateRequest(request);
    console.log('✅ User authenticated:', user.email);

    // Vérifier que l'utilisateur a un personnage
    const character = await db.character.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });

    if (!character) {
      console.log('❌ Character not found for user:', user.id);
      return json({ error: "Character not found" }, { status: 404 });
    }

    // Récupérer les skills du personnage
    const skills = await db.skill.findMany({
      where: { characterId: character.id },
    });

    console.log('✅ Skills retrieved:', skills.length);
    return json(skills);
    
  } catch (error) {
    console.error("❌ Skills GET error:", error);
    
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