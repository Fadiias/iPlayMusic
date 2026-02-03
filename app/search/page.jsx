import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SearchPageClient from "./SearchPageClient";

export const dynamic = "force-dynamic";

export default async function SearchPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  return <SearchPageClient />;
}
