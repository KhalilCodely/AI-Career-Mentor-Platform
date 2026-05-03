"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function UserboardAiChatPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/ai-chat"); }, [router]);
  return <div className="p-4 text-sm text-zinc-600">Redirecting to AI Chat...</div>;
}
