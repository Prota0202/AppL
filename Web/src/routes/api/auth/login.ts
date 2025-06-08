import { json } from "@solidjs/router";
import { APIEvent } from "@solidjs/start/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "~/lib/db";

export async function POST({ request }: APIEvent) {
  try {
    const { email, password } = await request.json();

    const user = await db.user.findUnique({ 
      where: { email },
      include: { character: true }
    });

    if (!user || !user.password) {
      return json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.AUTH_SECRET!,
      { expiresIn: '7d' }
    );

    return json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
      hasCharacter: !!user.character
    });
  } catch (error) {
    console.error('Login error:', error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}

// Fonction GET pour forcer la reconnaissance de la route
export async function GET() {
  return json({ error: "Method not allowed. Use POST." }, { status: 405 });
}

export async function OPTIONS() {
  return new Response(null, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', 
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}