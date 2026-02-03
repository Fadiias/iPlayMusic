"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear cookies
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full py-3 px-4 rounded-(--radius-button) border border-(--color-error) text-(--color-error) font-medium hover:bg-(--color-error) hover:text-white transition-colors"
    >
      Log Out
    </button>
  );
}
