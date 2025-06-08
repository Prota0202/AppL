import { json } from "@solidjs/router";
import { APIEvent } from "@solidjs/start/server";
import db from "~/lib/db";
import { authenticateRequest } from "~/lib/jwt-auth";
import { characterSchema } from "~/lib/validation";

export async function POST({ request }: APIEvent) {
  try {
    console.log('🔧 Character creation API called');
    
    // Authentification JWT
    const user = await authenticateRequest(request);
    console.log('✅ User authenticated:', user.email);

    // Vérifie que l'utilisateur n'a pas déjà un personnage
    const existingCharacter = await db.character.findUnique({
      where: { userId: user.id }
    });

    if (existingCharacter) {
      console.log('❌ User already has a character');
      return json({ error: "User already has a character" }, { status: 400 });
    }

    // Lire le body de la requête
    const body = await request.json();
    console.log('📝 Received character data:', body);
    
    const raw = {
      name: body.name,
      class: body.class,
      strength: Number(body.strength),
      intelligence: Number(body.intelligence),
      endurance: Number(body.endurance),
      remainingPoints: 0 // Pour la validation, on assume que tous les points sont distribués
    };

    // Validation avec le schéma existant
    const parsed = characterSchema.safeParse(raw);

    if (!parsed.success) {
      const errorMessages = parsed.error.errors.map(err => err.message).join(', ');
      console.log('❌ Validation failed:', errorMessages);
      return json({ error: errorMessages }, { status: 400 });
    }

    // Vérifie que les points d'attributs sont valides (total = 20, minimum 5 chacun)
    const totalPoints = parsed.data.strength + parsed.data.intelligence + parsed.data.endurance;
    if (totalPoints !== 20) {
      console.log('❌ Invalid attribute distribution');
      return json({ error: "Invalid attribute point distribution" }, { status: 400 });
    }

    // Créer le personnage
    const newCharacter = await db.character.create({
      data: {
        name: parsed.data.name,
        class: parsed.data.class,
        strength: parsed.data.strength,
        intelligence: parsed.data.intelligence,
        endurance: parsed.data.endurance,
        availablePoints: 0,
        maxLevelReached: 100,
        userId: user.id,
      },
    });

    console.log('✅ Character created successfully:', newCharacter.name);

    // Retourner les données du personnage créé
    return json({
      message: "Character created successfully",
      character: {
        id: newCharacter.id,
        name: newCharacter.name,
        class: newCharacter.class,
        level: newCharacter.level,
        experience: newCharacter.experience,
        strength: newCharacter.strength,
        intelligence: newCharacter.intelligence,
        endurance: newCharacter.endurance,
        availablePoints: newCharacter.availablePoints,
      }
    });
    
  } catch (error) {
    console.error('❌ Character creation error:', error);
    
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS', 
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}