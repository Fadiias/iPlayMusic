import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

export default async function PlayerPage() {
  // Legacy route: the app now uses a global mini/expanded player mounted in the root layout.
  // Redirect here to avoid rendering a second <audio> instance.
  redirect("/");
}
