import { json } from "@solidjs/router";
import { APIEvent } from "@solidjs/start/server";
import bcrypt from "bcryptjs";
import db from "~/lib/db";
import { registerSchema } from "~/lib/validation";

// Fonction GET temporaire pour tester
export async function GET() {
  return json({ error: "Method not allowed. Use POST." }, { status: 405 });
}

export async function POST({ request }: APIEvent) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return json({ error: "Invalid JSON format" }, { status: 400 });
    }

    console.log('Received body:', body);

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const errorMessages = parsed.error.errors.map(err => err.message).join(', ');
      return json({ error: errorMessages }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        provider: 'CREDENTIALS'
      },
    });

    return json({ message: "User created successfully" });
  } catch (error) {
    console.error('Register error:', error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
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