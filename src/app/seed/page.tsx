"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, writeBatch, doc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Raw data from user
const MENU_DATA = [
  // MAKANAN
  { name: "Nasgor Kebuli Sapi", price: "22K", category: "Makanan" },
  { name: "Nasgor Kebuli Katsu", price: "20K", category: "Makanan" },
  { name: "Nasgor Kebuli Ayam", price: "16K", category: "Makanan" },
  { name: "Nasi Mie Goreng Ayam Geprek", price: "19K", category: "Makanan" },
  { name: "Nasi Mie Goreng Ayam Bakar", price: "19K", category: "Makanan" },
  { name: "Nasi Mie Goreng Ayam Goreng", price: "19K", category: "Makanan" },
  { name: "Kentang/Nasi Katsu Salad", price: "17K", category: "Makanan" },
  { name: "Kentang/Nasi Katsu", price: "15K", category: "Makanan" },
  { name: "Kentang Dumpling Keju", price: "15K", category: "Makanan" },
  { name: "Kentang Goreng Saos", price: "13K", category: "Makanan" },
  { name: "Kentang/Nasi Cheese", price: "15K", category: "Makanan" },
  { name: "Kentang/Nasi Cheese Salad", price: "17K", category: "Makanan" },
  { name: "Nasi Ayam Geprek Gobyos + Tempe", price: "13K", category: "Makanan" },
  { name: "Nasi Ayam Penyet Bakar + Tempe", price: "13K", category: "Makanan" },
  { name: "Nasi Ayam Penyet Goreng + Tempe", price: "13K", category: "Makanan" },
  { name: "Nasi Lele Penyet + Tempe", price: "13K", category: "Makanan" },
  { name: "Nasi Ikan Patin Goreng + Tempe", price: "13K", category: "Makanan" },
  { name: "Nasi SFC + Tempe", price: "13K", category: "Makanan" },
  { name: "Nasi Soto Sapi", price: "18K", category: "Makanan" },
  { name: "Nasi Soto Ayam", price: "13K", category: "Makanan" },
  { name: "Nasi Soto Babat", price: "13K", category: "Makanan" },

  // MINUMAN
  { name: "Chocolatos Drink", price: "7K", category: "Minuman" },
  { name: "Jeruk Susu (Es/Hangat)", price: "7K", category: "Minuman" },
  { name: "Jeruk (Es/Hangat)", price: "5K", category: "Minuman" },
  { name: "Teh Susu (Es/Hangat)", price: "6K", category: "Minuman" },
  { name: "Kuku Bima Susu Es", price: "6K", category: "Minuman" },
  { name: "Extra Joss Susu Es", price: "6K", category: "Minuman" },
  { name: "Es Laguna Salsabilla", price: "7K", category: "Minuman" },
  { name: "Hillo (Es/Hangat)", price: "5K", category: "Minuman" },
  { name: "Susu Putih (Es/Hangat)", price: "5K", category: "Minuman" },
  { name: "Susu Coklat (Es/Hangat)", price: "5K", category: "Minuman" },
  { name: "Cappuccino Coffee (Es/Hangat)", price: "6K", category: "Minuman" },
  { name: "Lemon Tea (Es/Hangat)", price: "5K", category: "Minuman" },
  { name: "Orange Squash (Es/Hangat)", price: "5K", category: "Minuman" },
  { name: "Teh Tarik (Es/Hangat)", price: "6K", category: "Minuman" },
  { name: "Teh Leci (Es/Hangat)", price: "5K", category: "Minuman" },
  { name: "Teh Melon (Es/Hangat)", price: "6K", category: "Minuman" },
  { name: "Teh Mannga (Es/Hangat)", price: "5K", category: "Minuman" },
  { name: "Kopi Hitam", price: "3K", category: "Minuman" },
  { name: "Teh Manis (Es/Hangat)", price: "3K", category: "Minuman" },
  { name: "Teh Tawar (Es/Hangat)", price: "2K", category: "Minuman" },
  { name: "Es Batu", price: "2K", category: "Minuman" },
  { name: "Air Mineral 1,5L", price: "5K", category: "Minuman" },
  { name: "Air Mineral 300ml", price: "3K", category: "Minuman" },
  { name: "Aneka Nutrisari (Es/Hangat)", price: "5K", category: "Minuman" },

  // TAMBAHAN
  { name: "Telor Dadar/Ceplok", price: "4K", category: "Tambahan" },
  { name: "Krupuk Udang", price: "5K", category: "Tambahan" },
  { name: "Peyek", price: "3K", category: "Tambahan" },
  { name: "Tahu/Tempe Goreng", price: "1K", category: "Tambahan" },
  { name: "Mendoan/Bakwan", price: "1K", category: "Tambahan" },
  { name: "Bacem Tahu/Tempe", price: "1K", category: "Tambahan" },
  { name: "Kol/Terong Goreng", price: "4K", category: "Tambahan" },
  { name: "Nasi", price: "5K", category: "Tambahan" },
  { name: "Sambal", price: "3K", category: "Tambahan" },
];

const STORE_INFO = {
  jam_operasional: "07.30 - 20.00",
  hari_libur: "Sabtu",
  pemesanan_wa: "0813-8975-2975",
  alamat: "Jln. Sukabirus Blok F No. 48 RT 06 RW 13, Dayeuhkolot Bandung",
  promo: [
    "Setiap hari Jum'at ada diskon",
    "Menerima pesanan nasi kotak",
    "Gratis es teh manis bagi yang berbuka puasa di warung"
  ]
};

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const parseKPrice = (priceStr: string): number => {
    // "22K" -> 22000
    const clean = priceStr.toUpperCase().replace("K", "000").replace(/[^0-9]/g, "");
    return Number(clean);
  };

  const handleMigration = async () => {
    setLoading(true);
    setLogs([]);
    addLog("Memulai migrasi data...");

    try {
      const batch = writeBatch(db);
      let count = 0;

      // 1. Migrate Products
      for (const item of MENU_DATA) {
        const newDocRef = doc(collection(db, "products"));
        batch.set(newDocRef, {
          name: item.name,
          price: parseKPrice(item.price),
          category: item.category,
          isAvailable: true,
          createdAt: serverTimestamp()
        });
        count++;
        // Firestore batch limit is 500, we have ~50 items so it's safe
      }
      addLog(`Menyiapkan ${count} produk...`);

      // 2. Migrate Store Info
      const infoRef = doc(db, "settings", "store_info");
      batch.set(infoRef, {
        ...STORE_INFO,
        updatedAt: serverTimestamp()
      });
      addLog("Menyiapkan informasi toko...");

      // 3. Commit
      await batch.commit();
      
      addLog("✅ Migrasi Berhasil!");
      toast.success("Data berhasil dimigrasi ke Firebase!");
      
    } catch (error) {
      console.error("Migration error:", error);
      addLog(`❌ Error: ${(error as Error).message}`);
      toast.error("Gagal migrasi data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Migrasi Data Menu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Halaman ini akan mengupload {MENU_DATA.length} item menu dan informasi toko ke Firebase Firestore.
          </p>
          
          <div className="bg-gray-100 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? "Menunggu perintah..." : logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>

          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleMigration} 
            disabled={loading}
          >
            {loading ? "Sedang Memproses..." : "Mulai Migrasi Data"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
