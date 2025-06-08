import { getSession } from "@auth/solid-start";
import { APIEvent } from "node_modules/@solidjs/start/dist/server";
import { json } from "@solidjs/router";
import db from "~/lib/db";
import { authOptions } from "../api/auth/[...solidauth]";

export async function GET({ request }: APIEvent) {
  const session = await getSession(request, authOptions);

  if (!session?.user) {
    return json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const user = await db.user.findUnique({
      where: { email: session.user.email! }
    });

    if (!user) {
      return json({ error: "Unauthorized" }, { status: 403 });
    }

    const character = await db.character.findUnique({
      where: { userId: user.id },
      select: {
        userId: true,
        id: true,
      },
    });

    if (!character) {
      return json({
        error: "Character not found",
        userId: user.id
      }, { status: 404 });
    }

    return json(character);
  } catch (error) {
    console.error("Error fetching character:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
}
