"use client";

import { createContext, useContext, ReactNode } from "react";
import { CoupleData, Session } from "@/lib/types";
import { useSession } from "@/hooks/useSession";
import { useCoupleData } from "@/hooks/useCoupleData";

interface CoupleContextValue {
  session: Session | null;
  loaded: boolean;
  data: CoupleData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  saveSession: (session: Session) => void;
  clearSession: () => void;
  me: CoupleData["members"]["creator"] | null;
  partner: CoupleData["members"]["creator"] | null;
  myRole: "creator" | "partner" | null;
}

const CoupleCtx = createContext<CoupleContextValue | null>(null);

export function CoupleProvider({ children }: { children: ReactNode }) {
  const { session, loaded, saveSession, clearSession } = useSession();
  const { data, loading, error, refetch } = useCoupleData(session?.coupleCode);

  const myRole = session?.role ?? null;
  const me = data
    ? myRole === "creator"
      ? data.members.creator
      : data.members.partner
    : null;
  const partner = data
    ? myRole === "creator"
      ? data.members.partner
      : data.members.creator
    : null;

  return (
    <CoupleCtx.Provider
      value={{
        session,
        loaded,
        data,
        loading,
        error,
        refetch,
        saveSession,
        clearSession,
        me,
        partner,
        myRole,
      }}
    >
      {children}
    </CoupleCtx.Provider>
  );
}

export function useCouple() {
  const ctx = useContext(CoupleCtx);
  if (!ctx) throw new Error("useCouple must be used within CoupleProvider");
  return ctx;
}
