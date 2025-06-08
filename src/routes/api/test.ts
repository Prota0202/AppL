// src/routes/api/test.ts
import { json } from "@solidjs/router";

export async function GET() {
  return json({ message: "Test route works!" });
}