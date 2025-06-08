import { getSession } from "@auth/solid-start";
import { authOptions } from "~/routes/api/auth/[...solidauth]";
import { authenticateRequest } from "~/lib/jwt-auth";
import db from "~/lib/db";

export async function getAuthenticatedUser(request: Request) {
  // Try JWT first (mobile)
  try {
    const user = await authenticateRequest(request);
    return user;
  } catch (jwtError) {
    // Fallback to session (web)
    try {
      const session = await getSession(request, authOptions);
      if (!session?.user?.email) {
        throw new Error("No session found");
      }

      const user = await db.user.findUnique({
        where: { email: session.user.email }
      });

      if (!user) {
        throw new Error("User not found");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    } catch (sessionError) {
      throw new Error("Authentication failed");
    }
  }
}