"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
});

export function useSession() {
  const router = useRouter();
  const session = useSWR("/api/auth/me", fetcher, {
    onError: () => router.push("/login")
  });

  return session;
}
