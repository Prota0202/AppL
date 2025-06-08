import { json } from "@solidjs/router";
import { APIEvent } from "@solidjs/start/server";
import db from "~/lib/db";
import { authenticateRequest } from "~/lib/jwt-auth";

export async function PUT({ request }: APIEvent) {
  try {
    const user = await authenticateRequest(request);

    // Vérifier que l'utilisateur a un personnage
    const character = await db.character.findUnique({
      where: { userId: user.id }
    });

    if (!character) {
      return json({ error: "Character not found" }, { status: 404 });
    }

    const body = await request.json();
    const { strength, intelligence, endurance, availablePoints } = body;

    // Validation basique
    if (typeof strength !== 'number' || typeof intelligence !== 'number' || 
        typeof endurance !== 'number' || typeof availablePoints !== 'number') {
      return json({ error: "Invalid attribute values" }, { status: 400 });
    }

    // Vérifier que les valeurs sont valides (pas en dessous des valeurs originales)
    if (strength < character.strength || intelligence < character.intelligence || 
        endurance < character.endurance) {
      return json({ error: "Cannot decrease attributes below original values" }, { status: 400 });
    }

    const updatedCharacter = await db.character.update({
      where: { id: character.id },
      data: {
        strength,
        intelligence,
        endurance,
        availablePoints,
      },
    });

    return json({
      strength: updatedCharacter.strength,
      intelligence: updatedCharacter.intelligence,
      endurance: updatedCharacter.endurance,
      availablePoints: updatedCharacter.availablePoints,
    });
  } catch (error) {
    console.error('Update attributes error:', error);
    
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
      'Access-Control-Allow-Methods': 'PUT, OPTIONS', 
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}