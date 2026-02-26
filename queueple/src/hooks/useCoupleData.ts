"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CoupleData } from "@/lib/types";
import { POLL_INTERVAL } from "@/lib/constants";

export function useCoupleData(coupleCode: string | undefined) {
  const [data, setData] = useState<CoupleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const versionRef = useRef<number>(0);

  const fetchData = useCallback(async () => {
    if (!coupleCode) return;

    try {
      const res = await fetch(`/api/couple?code=${coupleCode}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Couple not found");
          return;
        }
        throw new Error("Failed to fetch");
      }

      const newData: CoupleData = await res.json();

      if (newData.version !== versionRef.current) {
        versionRef.current = newData.version;
        setData(newData);
      }
      setError(null);
    } catch {
      setError("Connection issue. Retrying...");
    } finally {
      setLoading(false);
    }
  }, [coupleCode]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, POLL_INTERVAL);

    const onFocus = () => fetchData();
    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
