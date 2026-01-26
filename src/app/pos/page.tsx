"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Product } from "@/types";
import { parsePrice } from "@/lib/utils";
import { ProductCard } from "@/components/pos/ProductCard";
import { CartSheet } from "@/components/pos/CartSheet";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Extract unique categories
  const categories = ["Semua", ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))];

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      }
    });

    // Realtime listener for products
    const q = query(collection(db, "products"), orderBy("name"));
    const unsubscribeProducts = onSnapshot(q, (snapshot) => {
      const prods = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("Raw Firestore Data:", doc.id, data); // Debug log
        
        // Handle various price field names and formats
        const rawPrice = data.price ?? data.Price ?? data.harga ?? data.Harga ?? 0;
        
        return {
          id: doc.id,
          ...data,
          price: parsePrice(rawPrice), // Use robust parser
        };
      }) as Product[];
      setProducts(prods);
      setFilteredProducts(prods);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProducts();
    };
  }, [router]);

  useEffect(() => {
    let result = products;

    // Filter by category
    if (selectedCategory !== "Semua") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by search
    if (search !== "") {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [search, selectedCategory, products]);

  if (loading) {
      return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex items-center gap-2 sticky top-0 bg-gray-50 z-10 py-2 flex-col items-stretch">
        <div className="flex items-center gap-2 w-full">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Cari menu..."
                className="pl-8 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            {/* Cart Sheet Trigger inside Header/Top Bar */}
            <CartSheet />
        </div>
        
        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar w-full">
            {categories.map((cat) => (
                <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                        "whitespace-nowrap rounded-full px-4",
                        selectedCategory === cat ? "bg-primary text-primary-foreground shadow-md" : "bg-white text-muted-foreground hover:bg-gray-100"
                    )}
                >
                    {cat}
                </Button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="h-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">
              Tidak ada produk ditemukan.
          </div>
      )}
    </div>
  );
}
