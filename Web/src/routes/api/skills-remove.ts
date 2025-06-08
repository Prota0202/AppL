import { json } from "@solidjs/router";
import { APIEvent } from "@solidjs/start/server";
import db from "~/lib/db";
import { authenticateRequest } from "~/lib/jwt-auth";

export async function DELETE({ request }: APIEvent) {
  try {
    console.log('🔧 Skill delete API called');
    
    // Authentification JWT
    const user = await authenticateRequest(request);
    console.log('✅ User authenticated:', user.email);

    // Lire le body pour récupérer l'ID du skill
    const body = await request.json();
    const skillId = parseInt(body.skillId);
    console.log('📝 Deleting skill ID:', skillId);
    
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

    // Supprimer le skill
    await db.skill.delete({
      where: { id: skillId }
    });

    console.log('✅ Skill deleted successfully:', skill.name);

    return json({
      message: 'Skill removed successfully.'
    });
    
  } catch (error) {
    console.error('❌ Skill delete error:', error);
    
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
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS', 
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}