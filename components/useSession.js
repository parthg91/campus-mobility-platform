"use client";

import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
});

export function useSession() {
  const session = useSWR("/api/auth/me", fetcher, {
    onError: () => window.location.assign("/login")
  });

  return session;
}
