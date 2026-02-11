import { useState } from "react";
import { useCartStore } from "@/lib/store";
import { formatRupiah, parsePrice } from "@/lib/utils";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { printReceipt } from "@/lib/printer";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, QrCode } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Transaction, TransactionData } from "@/types";
import Image from "next/image";

export function CartSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentMode, setIsPaymentMode] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryFee, setDeliveryFee] = useState<string>("");
  
  const { items, removeFromCart, decreaseQty, addToCart, clearCart, getTotalPrice, getTotalItems } = useCartStore();
  const subTotal = getTotalPrice();
  const deliveryFeeNum = parsePrice(deliveryFee);
  const finalTotal = subTotal + deliveryFeeNum;
  const totalItems = getTotalItems();

  const getCategoryIcon = (category: string) => {
    const lower = category?.toLowerCase() || '';
    if (lower === 'makanan') return '/icons/makanan.svg';
    if (lower === 'minuman') return '/icons/minuman.svg';
    if (lower === 'tambahan') return '/icons/tambahan.svg';
    return '/icons/default.svg';
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setIsProcessing(true);
    try {
      const user = auth.currentUser;
      const userId = user ? user.uid : "guest";
      
      const transactionData = {
        userId,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          qty: item.qty
        })),
        totalAmount: subTotal,
        deliveryFee: deliveryFeeNum,
        finalAmount: finalTotal,
        cashAmount: finalTotal, // Simplification: assume exact cash or handle cash input dialog
        changeAmount: 0,
        customerName,
        customerAddress,
        timestamp: serverTimestamp()
      };

      // Save to Firestore
      const docRef = await addDoc(collection(db, "transactions"), transactionData);
      
      // Prepare data for printer (need concrete timestamp and id)
      const printData: TransactionData = {
        id: `INV-${Date.now().toString().slice(-6)}`, // Simple ID generation
        userId,
        items: transactionData.items,
        totalAmount: subTotal,
        deliveryFee: deliveryFeeNum,
        finalAmount: finalTotal,
        cashAmount: finalTotal,
        changeAmount: 0,
        customerName,
        customerAddress,
        timestamp: new Date()
      };

      // Print
      printReceipt(printData);
      
      // Clear Cart
      clearCart();
      setIsOpen(false);
      setIsPaymentMode(false); // Reset mode
      toast.success("Transaksi berhasil disimpan & dicetak!");

    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Gagal memproses transaksi");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) setIsPaymentMode(false);
    }}>
      <SheetTrigger asChild>
        <Button size="icon" className="relative h-12 w-12 rounded-full shadow-lg">
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col rounded-t-[20px] p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center gap-2">
            {isPaymentMode && (
              <Button variant="ghost" size="icon" onClick={() => setIsPaymentMode(false)} className="-ml-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <SheetTitle>{isPaymentMode ? "Pembayaran" : `Keranjang (${totalItems} Item)`}</SheetTitle>
          </div>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-4">
          {isPaymentMode ? (
             <div className="flex flex-col items-center h-full space-y-6 pt-4">
                <div className="w-full space-y-4 px-1">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nama Pembeli</Label>
                        <Input 
                            id="name" 
                            placeholder="Contoh: Budi" 
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Alamat / Kosan</Label>
                        <Input 
                            id="address" 
                            placeholder="Contoh: Kosan Mawar No. 12" 
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="deliveryFee">Ongkos Kirim (Opsional)</Label>
                        <Input 
                            id="deliveryFee" 
                            type="number"
                            placeholder="0" 
                            value={deliveryFee}
                            onChange={(e) => setDeliveryFee(e.target.value)}
                        />
                    </div>
                </div>

                <div className="text-center w-full pt-4 border-t space-y-1">
                  <div className="flex justify-between text-sm text-muted-foreground px-8">
                    <span>Subtotal</span>
                    <span>{formatRupiah(subTotal)}</span>
                  </div>
                  {deliveryFeeNum > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground px-8">
                        <span>Ongkir</span>
                        <span>{formatRupiah(deliveryFeeNum)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xl font-bold text-primary pt-2 px-8 border-t mt-2">
                    <span>Total</span>
                    <span>{formatRupiah(finalTotal)}</span>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center w-64 h-64 shrink-0">
                   {/* Placeholder for QR Code */}
                   <QrCode className="h-32 w-32 text-gray-800" />
                   <p className="mt-2 text-sm font-semibold text-gray-600">Scan QRIS</p>
                </div>

                <p className="text-center text-sm text-muted-foreground max-w-xs pb-4">
                  Tunjukkan QR Code ini kepada pelanggan untuk melakukan pembayaran.
                </p>
             </div>
          ) : (
            items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mb-2 opacity-20" />
                <p>Keranjang kosong</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center bg-card p-3 rounded-lg border shadow-sm">
                    <div className="relative w-12 h-12 mr-3 rounded-md overflow-hidden bg-white flex-shrink-0 flex items-center justify-center border">
                       <Image 
                          src={item.image || getCategoryIcon(item.category || '')} 
                          alt={item.name} 
                          width={32}
                          height={32}
                          className="object-contain w-full h-full p-1"
                       />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold line-clamp-1 text-sm">{item.name}</h4>
                      <p className="text-xs text-primary font-bold">{formatRupiah(item.price)}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => decreaseQty(item.productId)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-5 text-center font-bold text-sm">{item.qty}</span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => addToCart({ id: item.productId, name: item.name, price: item.price, category: item.category, image: item.image } as any)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        <SheetFooter className="p-4 border-t bg-background mt-auto">
            <div className="w-full space-y-4">
                {!isPaymentMode ? (
                  <>
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total</span>
                        <span>{formatRupiah(subTotal)}</span>
                    </div>
                    <Button 
                        className="w-full h-12 text-lg" 
                        onClick={() => setIsPaymentMode(true)}
                        disabled={items.length === 0}
                    >
                        Bayar
                    </Button>
                  </>
                ) : (
                  <Button 
                      className="w-full h-12 text-lg" 
                      onClick={handleCheckout}
                      disabled={isProcessing}
                  >
                      {isProcessing ? "Memproses..." : "Pembayaran Diterima"}
                  </Button>
                )}
            </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
