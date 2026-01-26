"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/pos");
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  return <div className="flex h-screen items-center justify-center">Loading...</div>;
}
