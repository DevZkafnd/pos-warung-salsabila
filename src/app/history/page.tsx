"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Transaction, TransactionData } from "@/types";
import { formatRupiah } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { printReceipt } from "@/lib/printer";
import { Printer, CalendarIcon } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      }
    });

    // Query last 100 transactions (client-side filtering for simplicity with small data)
    // For larger datasets, use compound queries with 'where' clause
    const q = query(
      collection(db, "transactions"), 
      orderBy("timestamp", "desc"), 
      limit(100)
    );

    const unsubscribeTrans = onSnapshot(q, (snapshot) => {
      const trans = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];
      setTransactions(trans);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching history:", error);
        setLoading(false);
    });

    return () => {
        unsubscribeAuth();
        unsubscribeTrans();
    };
  }, [router]);

  useEffect(() => {
    if (!date) {
        setFilteredTransactions(transactions);
        return;
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const filtered = transactions.filter(trx => {
        if (trx.timestamp instanceof Timestamp) {
            const trxDate = trx.timestamp.toDate();
            return trxDate >= startOfDay && trxDate <= endOfDay;
        }
        return false;
    });

    setFilteredTransactions(filtered);
  }, [date, transactions]);

  const handlePrint = (transaction: Transaction) => {
    // Convert transaction to TransactionData if needed, or pass directly if compatible
    // Firestore Timestamp needs to be handled in printer or converted to Date here.
    // My printer helper handles Timestamp if it is the firebase class instance.
    // If it's a plain object (from JSON), we might need to reconstruct it.
    // But onSnapshot returns real Timestamp objects.
    
    // However, let's convert to Date to be safe for display logic inside printer
    const date = transaction.timestamp instanceof Timestamp 
        ? transaction.timestamp.toDate() 
        : new Date(); // Fallback

    const dataToPrint: TransactionData = {
        ...transaction,
        timestamp: date
    };

    printReceipt(dataToPrint);
  };

  if (loading) {
      return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Riwayat Transaksi</h1>
        
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: id }) : <span>Pilih Tanggal</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
      </div>
      
      {filteredTransactions.length === 0 ? (
          <div className="text-center text-muted-foreground py-10">
            {date ? "Tidak ada transaksi pada tanggal ini." : "Belum ada transaksi."}
          </div>
      ) : (
          <div className="space-y-3">
            {filteredTransactions.map((trx) => (
                <Card key={trx.id} className="overflow-hidden">
                    <CardContent className="p-4 flex justify-between items-center">
                        <div>
                            <div className="font-bold text-lg">{formatRupiah(trx.totalAmount)}</div>
                            <div className="text-sm text-muted-foreground">
                                {trx.items.length} Item • {
                                    trx.timestamp instanceof Timestamp 
                                    ? format(trx.timestamp.toDate(), "EEEE, d MMMM yyyy HH:mm", { locale: id })
                                    : "Invalid Date"
                                }
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">ID: {trx.id}</div>
                        </div>
                        <Button variant="outline" size="icon" onClick={() => handlePrint(trx)}>
                            <Printer className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            ))}
          </div>
      )}
    </div>
  );
}
