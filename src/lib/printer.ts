import { TransactionData } from "@/types";
import { formatRupiah, parsePrice } from "./utils";
import { toast } from "sonner";

const PRINTER_WIDTH = 32;

function center(text: string): string {
  const safeText = text || "";
  const padding = Math.max(0, Math.floor((PRINTER_WIDTH - safeText.length) / 2));
  return " ".repeat(padding) + safeText;
}

function dashedLine(): string {
  return "-".repeat(PRINTER_WIDTH);
}

function formatRow(left: string, right: string): string {
  const safeLeft = left || "";
  const safeRight = right || "";
  const space = Math.max(0, PRINTER_WIDTH - safeLeft.length - safeRight.length);
  return safeLeft + " ".repeat(space) + safeRight;
}

export const printReceipt = (data: TransactionData) => {
  // 1. Validation: Check if data exists
  if (!data) {
    console.error("Print failed: No data provided");
    toast.error("Gagal mencetak: Data transaksi tidak ditemukan");
    return;
  }

  // 2. Validation: Check if items exist
  if (!data.items || data.items.length === 0) {
    console.error("Print failed: No items to print");
    toast.error("Gagal mencetak: Tidak ada item dalam transaksi");
    return;
  }

  let text = "";
  
  try {
      // Header
      text += center("WARUNG SALSABILA") + "\n";
      text += center("Mobile Cloud POS") + "\n";
      text += dashedLine() + "\n";
      
      // Transaction Info
      if (data.timestamp instanceof Date) {
          text += `Tgl: ${data.timestamp.toLocaleString('id-ID')}\n`;
      } else {
          // Handle Firestore Timestamp or other format
          text += `Tgl: ${new Date().toLocaleString('id-ID')}\n`;
      }
      text += `No : ${data.id || 'N/A'}\n`;
      
      if (data.customerName) {
        text += `Nama  : ${data.customerName.substring(0, 24)}\n`;
      }
      if (data.customerAddress) {
        text += `Alamat: ${data.customerAddress.substring(0, 24)}\n`;
      }

      text += dashedLine() + "\n";

      // Items
      let calculatedTotal = 0;

      data.items.forEach((item) => {
        const safeName = item.name || "Item";
        const safeQty = Number(item.qty) || 0;
        const safePrice = parsePrice(item.price);
        
        const lineTotal = safeQty * safePrice;
        calculatedTotal += lineTotal;

        text += `${safeName}\n`;
        const qtyPrice = `${safeQty} x ${formatRupiah(safePrice)}`;
        const totalStr = formatRupiah(lineTotal);
        text += formatRow(qtyPrice, totalStr) + "\n";
      });

      text += dashedLine() + "\n";

      // Totals
      // Use calculated total if data.totalAmount is fishy, or just use safe parsing
      const safeTotal = parsePrice(data.totalAmount); 
      const finalTotal = safeTotal > 0 ? safeTotal : calculatedTotal;
      
      const safeCash = parsePrice(data.cashAmount);
      const safeChange = parsePrice(data.changeAmount);

      text += formatRow("Total", formatRupiah(finalTotal)) + "\n";
      text += formatRow("Tunai", formatRupiah(safeCash)) + "\n";
      text += formatRow("Kembali", formatRupiah(safeChange)) + "\n";

      text += dashedLine() + "\n";
      text += center("Terima Kasih") + "\n";
      text += center("Selamat Belanja Kembali") + "\n";
      text += "\n\n\n"; // Feed

      // Send to RawBT (Base64 Intent Method - Safe for Vercel/HTTPS)
      // Reference: https://rawbt.ru/en/
      const base64 = btoa(text);
      const rawbtUrl = `rawbt:base64,${base64}`;
      
      console.log("Attempting to launch RawBT (Base64):", rawbtUrl);

      // 3. Execution: Launch RawBT Scheme
      // We do not restrict by device type (Desktop/Mobile) as requested.
      // The focus is on ensuring the Printer (Bluetooth/USB) is connected.
      
      if (typeof window !== 'undefined') {
          toast.info("Menghubungkan ke Printer...", {
              description: "Pastikan Bluetooth/USB Printer SUDAH TERSAMBUNG dan Aplikasi RawBT SIAP menerima data.",
              duration: 5000,
              // Force high contrast: White background, Black text, Bold font as requested
              className: "!bg-white !border-black !border-2 !text-black",
              descriptionClassName: "!text-black !font-bold !opacity-100 !text-sm"
          });

          console.log("Launching RawBT scheme...");

          // Use a small timeout to allow UI to update before handing off to the OS/App
          setTimeout(() => {
              try {
                  window.location.href = rawbtUrl;
              } catch (e) {
                  console.error("Navigation failed:", e);
                  toast.error("Gagal Membuka Driver Printer", {
                      description: "Tidak dapat meluncurkan aplikasi RawBT. Pastikan aplikasi terinstall.",
                      className: "!bg-white !border-red-600 !border-2 !text-black",
                      descriptionClassName: "!text-black !font-bold !opacity-100"
                  });
              }
          }, 800);
      }

  } catch (error) {
      console.error("Error constructing receipt:", error);
      toast.error("Gagal membuat struk", {
          description: (error as Error).message
      });
  }
};
