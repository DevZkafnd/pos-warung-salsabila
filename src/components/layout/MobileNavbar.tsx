"use client";

import { Store, History, LogOut, Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function MobileNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
      toast.success("Berhasil logout");
    } catch (error) {
      toast.error("Gagal logout");
    }
  };

  if (pathname === "/login") return null;

  const navItems = [
    { href: "/pos", label: "Kasir", icon: Store },
    { href: "/products", label: "Produk", icon: Package },
    { href: "/history", label: "Riwayat", icon: History },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t h-16 flex items-center justify-around pb-safe">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full space-y-1",
            pathname === item.href ? "text-primary" : "text-muted-foreground"
          )}
        >
          <item.icon className="h-5 w-5" />
          <span className="text-xs font-medium">{item.label}</span>
        </Link>
      ))}
      <button
        onClick={handleLogout}
        className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground text-destructive"
      >
        <LogOut className="h-5 w-5" />
        <span className="text-xs font-medium">Keluar</span>
      </button>
    </div>
  );
}
