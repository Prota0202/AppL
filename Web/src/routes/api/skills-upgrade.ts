import { json } from "@solidjs/router";
import { APIEvent } from "@solidjs/start/server";
import db from "~/lib/db";
import { authenticateRequest } from "~/lib/jwt-auth";
import { updateCharacterExpAndLevel } from "~/actions/update-character-exp-and-level";

export async function PUT({ request }: APIEvent) {
  try {
    console.log('🔧 Skill upgrade API called');
    
    // Authentification JWT
    const user = await authenticateRequest(request);
    console.log('✅ User authenticated:', user.email);

    // Lire le body pour récupérer l'ID du skill
    const body = await request.json();
    const skillId = parseInt(body.skillId);
    console.log('📝 Upgrading skill ID:', skillId);
    
    if (isNaN(skillId)) {
      return json({ error: "Invalid skill ID" }, { status: 400 });
    }

    // Vérifier que le skill existe et appartient à l'utilisateur
    const skill = await db.skill.findUnique({
      where: { id: skillId },
      include: { character: true }
    });

    if (!skill || skill.character.userId !== user.id) {
      console.log('❌ Skill not found or unauthorized');
      return json({ error: "Skill not found" }, { status: 404 });
    }

    if (skill.level >= skill.maxLevel) {
      console.log('❌ Skill already at max level');
      return json({ error: "Skill has already reached max level" }, { status: 400 });
    }

    // Upgrade le skill
    const updatedSkill = await db.skill.update({
      where: { id: skillId },
      data: {
        level: skill.level + 1
      }
    });

    // Donner de l'expérience au personnage
    const gainedExp = 20;
    const { updatedCharacter, leveledUp } = await updateCharacterExpAndLevel({
      character: skill.character,
      experienceGained: gainedExp,
    });

    console.log('✅ Skill upgraded successfully from level', skill.level, 'to', updatedSkill.level);

    const response: {
      message: string;
      skill: typeof updatedSkill;
      leveledUp: boolean;
      levelUpMessage?: string;
    } = {
      message: `Skill upgraded successfully. (+${gainedExp} EXP)`,
      skill: updatedSkill,
      leveledUp: leveledUp
    };

    if (leveledUp) {
      response.levelUpMessage = `🎉 Level Up! ${updatedCharacter.name} has reached level ${updatedCharacter.level} and gained 5 attribute points!`;
    }

    return json(response);
    
  } catch (error) {
    console.error('❌ Skill upgrade error:', error);
    
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