import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  
  const response = NextResponse.json({ success: true });
  
  // Clear all auth cookies
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  
  return response;
}

export async function GET() {
  return POST();
}
