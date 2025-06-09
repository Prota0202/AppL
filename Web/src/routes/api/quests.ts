import { getSession } from "@auth/solid-start";
import { APIEvent } from "node_modules/@solidjs/start/dist/server";
import { json } from "@solidjs/router";
import db from "~/lib/db";
import { authOptions } from "./auth/[...solidauth]";
import { authenticateRequest } from "~/lib/jwt-auth";
import { questFormSchema, rewardListSchema } from "~/lib/validation";
import { getExpReward } from "~/lib/utils";

export async function GET({ request }: APIEvent) {
  try {
    
    try {
      const user = await authenticateRequest(request);
      console.log('✅ Mobile JWT auth successful for quests:', user.email);

      const character = await db.character.findUnique({
        where: { userId: user.id },
        select: { id: true }
      });

      if (!character) {
        return json({ error: "Character not found" }, { status: 404 });
      }

      const quests = await db.quest.findMany({
        where: { characterId: character.id },
      });

      const grouped = {
        AVAILABLE: [] as typeof quests,
        IN_PROGRESS: [] as typeof quests,
        COMPLETED: [] as typeof quests,
        FAILED: [] as typeof quests,
      };

      for (const quest of quests) {
        grouped[quest.status].push(quest);
      }

      console.log('📋 Quests loaded for character:', character.id);
      return json(grouped);

    } catch (jwtError) {
      // Fallback vers l'authentification session (web)
      console.log('🔄 JWT auth failed, trying session auth for quests');
      
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

      const quests = await db.quest.findMany({
        where: { characterId: user.character.id },
      });

      const grouped = {
        AVAILABLE: [] as typeof quests,
        IN_PROGRESS: [] as typeof quests,
        COMPLETED: [] as typeof quests,
        FAILED: [] as typeof quests,
      };

      for (const quest of quests) {
        grouped[quest.status].push(quest);
      }

      return json(grouped);
    }
  } catch (error) {
    console.error("Error fetching quests:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST({ request }: APIEvent) {
  try {
    console.log('🔧 Quest creation API called');
    
    // Authentification JWT pour mobile
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
    console.log('📝 Received quest data:', body);
    
    const raw = {
      title: body.title,
      description: body.description,
      difficulty: body.difficulty,
    };

    const parsedRewards = rewardListSchema.safeParse(body.rewards || []);

    const parsed = questFormSchema.safeParse(raw);

    if (!parsed.success) {
      const errorMessages = parsed.error.errors.map(err => err.message).join(', ');
      console.log('❌ Validation failed:', errorMessages);
      return json({ error: errorMessages }, { status: 400 });
    }

    if (!parsedRewards.success && body.rewards && body.rewards.length > 0) {
      const errorMessages = parsedRewards.error.errors.map(err => err.message).join(', ');
      console.log('❌ Rewards validation failed:', errorMessages);
      return json({ error: errorMessages }, { status: 400 });
    }

    const exp = getExpReward(parsed.data.difficulty);
    const rewards = parsedRewards.success ? parsedRewards.data : [];

    // Créer la quête
    const createdQuest = await db.quest.create({
      data: {
        ...parsed.data,
        reward: `${exp} XP${rewards.length > 0 ? ` + ${rewards.map((r) => `x${r.quantity} ${r.itemName}`).join(' + ')}` : ''}`,
        characterId: character.id,
      }
    });

    // Créer les récompenses d'items si elles existent
    if (rewards.length > 0) {
      const itemData = rewards.map(item => ({
        name: item.itemName,
        description: item.description || '',
        quantity: item.quantity,
        characterId: character.id,
        rewardFromQuestId: createdQuest.id,
      }));

      await db.item.createMany({ data: itemData });
    }

    console.log('✅ Quest created successfully:', createdQuest.title);

    return json({
      message: "Quest created successfully",
      quest: createdQuest
    });
    
  } catch (error) {
    console.error('❌ Quest creation error:', error);
    
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}