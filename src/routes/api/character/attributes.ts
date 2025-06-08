// src/routes/api/character/attributes.ts
import { json } from "@solidjs/router";
import { APIEvent } from "@solidjs/start/server";
import db from "~/lib/db";
import { authenticateRequest } from "~/lib/jwt-auth";

export async function PUT({ request }: APIEvent) {
  try {
    console.log('🔧 Character attributes update called');
    
    // Authentification JWT
    const user = await authenticateRequest(request);
    console.log('✅ User authenticated:', user.email);

    // Vérifier que l'utilisateur a un personnage
    const character = await db.character.findUnique({
      where: { userId: user.id }
    });

    if (!character) {
      console.log('❌ Character not found for user:', user.id);
      return json({ error: "Character not found" }, { status: 404 });
    }

    // Lire le body de la requête
    const body = await request.json();
    console.log('📝 Received attributes:', body);
    
    const { strength, intelligence, endurance, availablePoints } = body;

    // Validation basique
    if (typeof strength !== 'number' || typeof intelligence !== 'number' || 
        typeof endurance !== 'number' || typeof availablePoints !== 'number') {
      console.log('❌ Invalid attribute types');
      return json({ error: "Invalid attribute values" }, { status: 400 });
    }

    // Vérifier que les valeurs sont valides
    if (strength < character.strength || intelligence < character.intelligence || 
        endurance < character.endurance) {
      console.log('❌ Trying to decrease attributes below original values');
      return json({ error: "Cannot decrease attributes below original values" }, { status: 400 });
    }

    // Vérifier que les points sont cohérents
    const totalPointsUsed = (strength - character.strength) + 
                           (intelligence - character.intelligence) + 
                           (endurance - character.endurance);
    const originalAvailablePoints = character.availablePoints;
    
    if (availablePoints + totalPointsUsed !== originalAvailablePoints) {
      console.log('❌ Points calculation error');
      return json({ error: "Points calculation error" }, { status: 400 });
    }

    // Mettre à jour le personnage
    const updatedCharacter = await db.character.update({
      where: { id: character.id },
      data: {
        strength,
        intelligence,
        endurance,
        availablePoints,
        updatedAt: new Date(),
      },
    });

    console.log('✅ Character attributes updated successfully');

    // Retourner seulement les attributs mis à jour
    const result = {
      strength: updatedCharacter.strength,
      intelligence: updatedCharacter.intelligence,
      endurance: updatedCharacter.endurance,
      availablePoints: updatedCharacter.availablePoints,
    };

    console.log('📤 Returning:', result);
    return json(result);
    
  } catch (error) {
    console.error('❌ Character attributes update error:', error);
    
    if (error instanceof Error && error.message.includes('token')) {
      return json({ error: "Invalid authentication token" }, { status: 401 });
    }
    
    if (error instanceof Error && error.message.includes('JSON')) {
      return json({ error: "Invalid JSON in request body" }, { status: 400 });
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