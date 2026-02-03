import { NextResponse } from "next/server";

export async function GET() {
  const CLIENT_ID = process.env.NEXT_PUBLIC_CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  
  const hasClientId = !!CLIENT_ID && CLIENT_ID !== "your_spotify_client_id_here";
  const hasClientSecret = !!CLIENT_SECRET && CLIENT_SECRET !== "your_spotify_client_secret_here";
  
  const isProd = process.env.NODE_ENV === "production";
  return NextResponse.json({
    hasClientId,
    hasClientSecret,
    clientIdLength: isProd ? undefined : (CLIENT_ID?.length || 0),
    clientSecretLength: isProd ? undefined : (CLIENT_SECRET?.length || 0),
    clientIdPreview: isProd ? undefined : (CLIENT_ID ? `${CLIENT_ID.substring(0, 4)}...${CLIENT_ID.substring(CLIENT_ID.length - 4)}` : "Not set"),
    isConfigured: hasClientId && hasClientSecret,
    message: hasClientId && hasClientSecret 
      ? "✅ Environment variables are configured correctly!"
      : "❌ Please update your .env file with actual Spotify credentials"
  });
}
