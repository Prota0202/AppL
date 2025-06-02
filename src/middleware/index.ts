import { getSession } from "@auth/solid-start";
import { redirect } from "@solidjs/router";
import { createMiddleware } from "@solidjs/start/middleware";
import { authOptions } from "~/routes/api/auth/[...solidauth]";

const authRoutes = [
  "/login",
  "/sign-up",
];

const protectedRoutes = [
  "/",
  "/quests",
  "/inventory", 
  "/skills",
  "/leaderboard",
  "/quest/create",
  "/skill/create",
  "/character/create",
  "/checking"
];

export default createMiddleware({
  onRequest: async (event) => {
    const url = new URL(event.request.url);
    const path = url.pathname;
    const session = await getSession(event.request, authOptions);

    // Si l'utilisateur est connecté et essaie d'accéder aux pages d'auth, rediriger vers home
    if (authRoutes.includes(path) && session?.user) {
      return redirect(new URL("/", url).toString(), 301);
    }

    // Si l'utilisateur n'est pas connecté et essaie d'accéder aux pages protégées, rediriger vers login
    if (protectedRoutes.includes(path) && !session?.user) {
      return redirect(new URL("/login", url).toString(), 301);
    }
  },
});