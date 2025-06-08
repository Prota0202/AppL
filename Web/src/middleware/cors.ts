import { createMiddleware } from '@solidjs/start/middleware';
import { getSession } from "@auth/solid-start";
import { redirect } from "@solidjs/router";
import { authOptions } from "~/routes/api/auth/[...solidauth]";

const authRoutes = ["/login", "/sign-up"];
const protectedRoutes = ["/", "/quests", "/inventory", "/skills", "/leaderboard", "/quest/create", "/skill/create", "/character/create", "/checking"];

export default createMiddleware({
  onRequest: async (event) => {
    // Gestion de l'authentification pour les routes web (pas API)
    if (!event.request.url.includes('/api/')) {
      const url = new URL(event.request.url);
      const path = url.pathname;
      const session = await getSession(event.request, authOptions);

      if (authRoutes.includes(path) && session?.user) {
        return redirect(new URL("/", url).toString(), 301);
      }

      if (protectedRoutes.includes(path) && !session?.user) {
        return redirect(new URL("/login", url).toString(), 301);
      }
    }
  },
  
  onBeforeResponse: (event) => {
    // CORS très permissif pour le développement
    event.response.headers.set('Access-Control-Allow-Origin', '*');
    event.response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    event.response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    event.response.headers.set('Access-Control-Max-Age', '86400');
    
    // Pour les requêtes OPTIONS (preflight)
    if (event.request.method === 'OPTIONS') {
      event.response.status = 200;
    }
  },
});