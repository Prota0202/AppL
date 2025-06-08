import jwt from "jsonwebtoken";
import db from "./db";

export interface JWTPayload {
  userId: number;
  email: string;
}

export interface AuthenticatedUser {
  id: number;
  email: string;
  name: string | null;
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET!) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export async function getUserFromJWT(token: string): Promise<AuthenticatedUser> {
  const payload = await verifyJWT(token);
  
  const user = await db.user.findUnique({
    where: { id: payload.userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export function extractTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

export async function authenticateRequest(request: Request): Promise<AuthenticatedUser> {
  const token = extractTokenFromRequest(request);
  
  if (!token) {
    throw new Error('No authentication token provided');
  }
  
  return await getUserFromJWT(token);
}