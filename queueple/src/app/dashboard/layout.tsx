"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CoupleProvider, useCouple } from "@/context/CoupleContext";

function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, loaded, loading, data } = useCouple();

  useEffect(() => {
    if (loaded && !session) {
      router.replace("/");
    }
  }, [loaded, session, router]);

  if (!loaded || loading || !data) {
    return (
      <div className="min-h-dvh bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CoupleProvider>
      <DashboardGuard>
        <div className="min-h-dvh bg-cream safe-top">
          {children}
        </div>
      </DashboardGuard>
    </CoupleProvider>
  );
}
