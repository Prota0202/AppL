import { json } from "@solidjs/router";

export async function GET() {
  return json({ message: "Register2 GET works!" });
}

export async function POST() {
  return json({ message: "Register2 POST works!" });
}