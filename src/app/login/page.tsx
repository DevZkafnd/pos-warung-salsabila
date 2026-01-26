"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success("Akun berhasil dibuat! Silakan masuk.");
        setIsRegister(false); // Switch back to login
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Login berhasil!");
        router.push("/pos");
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.code === 'auth/email-already-in-use' 
        ? "Email sudah terdaftar." 
        : error.code === 'auth/invalid-credential'
        ? "Email atau password salah."
        : error.message;
      toast.error(isRegister ? "Gagal daftar: " + msg : "Login gagal: " + msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isRegister ? "Daftar Akun Baru" : "Warung Salsabila POS"}
          </CardTitle>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="kasir@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
              {loading ? "Loading..." : (isRegister ? "Daftar Sekarang" : "Masuk")}
            </Button>
            
            <Button 
              type="button" 
              variant="link" 
              className="text-sm text-muted-foreground"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Sudah punya akun? Login" : "Belum punya akun? Daftar disini"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
