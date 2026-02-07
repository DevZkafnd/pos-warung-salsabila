"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { Product } from "@/types";
import { formatRupiah, parsePrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "Makanan",
    image: "",
    isAvailable: true
  });

  // Listen to Products
  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];
      setProducts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter Logic
  useEffect(() => {
    if (search === "") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase())
      ));
    }
  }, [search, products]);

  // Form Handlers
  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "Makanan",
      image: "",
      isAvailable: true
    });
    setCurrentProduct(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      image: product.image || "",
      isAvailable: product.isAvailable
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        name: formData.name,
        price: parsePrice(formData.price),
        category: formData.category,
        image: formData.image || null, // Handle empty string
        isAvailable: formData.isAvailable,
        updatedAt: serverTimestamp()
      };

      if (currentProduct) {
        // Update
        await updateDoc(doc(db, "products", currentProduct.id), payload);
        toast.success("Menu berhasil diperbarui");
      } else {
        // Create
        await addDoc(collection(db, "products"), {
          ...payload,
          createdAt: serverTimestamp()
        });
        toast.success("Menu baru berhasil ditambahkan");
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentProduct) return;
    setIsSaving(true);
    try {
      await deleteDoc(doc(db, "products", currentProduct.id));
      toast.success("Menu berhasil dihapus");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus data");
    } finally {
      setIsSaving(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    const lower = category?.toLowerCase() || '';
    if (lower === 'makanan') return '/icons/makanan.svg';
    if (lower === 'minuman') return '/icons/minuman.svg';
    if (lower === 'tambahan') return '/icons/tambahan.svg';
    return '/icons/default.svg';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
             <Link href="/pos">
                <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-6 w-6" />
                </Button>
             </Link>
             <h1 className="text-xl font-bold">Manajemen Menu</h1>
          </div>
          <Button onClick={openAddDialog} size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Tambah
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari menu..." 
            className="pl-9 bg-gray-100 border-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Product List */}
      <div className="p-4 grid grid-cols-1 gap-3">
        {loading ? (
            <p className="text-center text-muted-foreground mt-10">Memuat data...</p>
        ) : filteredProducts.length === 0 ? (
            <div className="text-center mt-10 space-y-2">
                <p className="text-muted-foreground">Tidak ada menu ditemukan</p>
                <Button variant="outline" onClick={openAddDialog}>Tambah Menu Baru</Button>
            </div>
        ) : (
            filteredProducts.map((product) => (
            <Card key={product.id} className="flex flex-row items-center p-3 gap-3 overflow-hidden">
                <div className="h-16 w-16 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center border">
                    <Image 
                        src={product.image || getCategoryIcon(product.category)} 
                        alt={product.name} 
                        width={40} 
                        height={40} 
                        className="object-contain"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate">{product.name}</h3>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                    <p className="text-sm font-bold text-primary mt-1">{formatRupiah(product.price)}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditDialog(product)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => openDeleteDialog(product)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </Card>
            ))
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>{currentProduct ? "Edit Menu" : "Tambah Menu Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Menu</Label>
              <Input 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Contoh: Nasi Goreng"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Harga</Label>
                    <Input 
                        type="number"
                        required 
                        value={formData.price} 
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        placeholder="15000"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Kategori</Label>
                    <select 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                        <option value="Makanan">Makanan</option>
                        <option value="Minuman">Minuman</option>
                        <option value="Tambahan">Tambahan</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
              <Label>Path Gambar (Opsional)</Label>
              <Input 
                value={formData.image} 
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                placeholder="Contoh: /icons/nasgor.svg"
              />
              <p className="text-xs text-muted-foreground">
                Kosongkan untuk menggunakan icon default kategori.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
                <input 
                    type="checkbox" 
                    id="isAvailable"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                />
                <Label htmlFor="isAvailable" className="font-normal cursor-pointer">
                    Menu Tersedia (Stok Ada)
                </Label>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-xs rounded-lg">
            <DialogHeader>
                <DialogTitle>Hapus Menu?</DialogTitle>
                <DialogDescription>
                    Apakah anda yakin ingin menghapus <strong>{currentProduct?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isSaving}>
                    {isSaving ? "..." : "Hapus"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}