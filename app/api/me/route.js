import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUserProfile } from "../../lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const profile = await getUserProfile(accessToken);
    return NextResponse.json({
      ok: true,
      product: profile?.product || "free",
      id: profile?.id,
      display_name: profile?.display_name,
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
