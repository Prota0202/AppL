import { json } from "@solidjs/router";
import { APIEvent } from "@solidjs/start/server";
import db from "~/lib/db";
import { authenticateRequest } from "~/lib/jwt-auth";
import { skillSchema } from "~/lib/validation";

export async function POST({ request }: APIEvent) {
  try {
    console.log('🔧 Skill creation API called');
    
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
    console.log('📝 Received skill data:', body);
    
    const raw = {
      name: body.name,
      description: body.description,
      maxLevel: Number(body.maxLevel),
    };

    // Validation avec le schéma existant
    const parsed = skillSchema.safeParse(raw);

    if (!parsed.success) {
      const errorMessages = parsed.error.errors.map(err => err.message).join(', ');
      console.log('❌ Validation failed:', errorMessages);
      return json({ error: errorMessages }, { status: 400 });
    }

    // Créer le skill
    const newSkill = await db.skill.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        maxLevel: parsed.data.maxLevel,
        characterId: character.id,
      },
    });

    console.log('✅ Skill created successfully:', newSkill.name);

    return json({
      message: "Skill created successfully",
      skill: newSkill
    });
    
  } catch (error) {
    console.error('❌ Skill creation error:', error);
    
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