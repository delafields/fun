"use client";

import { useState, useEffect, useCallback } from "react";
import { Session } from "@/lib/types";

const STORAGE_KEY = "queueple_session";
const COOKIE_KEY = "queueple_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function setCookie(session: Session) {
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(JSON.stringify(session))}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function getCookie(): Session | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

function clearCookie() {
  document.cookie = `${COOKIE_KEY}=; path=/; max-age=0`;
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Try localStorage first, fall back to cookie
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSession(parsed);
        // Sync cookie in case it's missing
        setCookie(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    } else {
      // localStorage cleared — restore from cookie
      const fromCookie = getCookie();
      if (fromCookie) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fromCookie));
        setSession(fromCookie);
      }
    }
    setLoaded(true);
  }, []);

  const saveSession = useCallback((newSession: Session) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    setCookie(newSession);
    setSession(newSession);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    clearCookie();
    setSession(null);
  }, []);

  return { session, loaded, saveSession, clearSession };
}
