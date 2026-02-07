import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number): string {
  // Manual formatting to ensure compatibility with thermal printers (avoid non-breaking spaces)
  const numberString = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  
  return `Rp. ${numberString}`;
}

export function parsePrice(value: any): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  if (typeof value === 'string') {
    // Check if it looks like it has decimals (comma followed by digits at the end)
    // e.g. "10.000,00"
    if (value.includes(',') && value.split(',')[1].length === 2) {
       // Remove the decimals part if it's ,00 or similar, or just treat as integer
       value = value.split(',')[0]; 
    }
    
    // Remove all non-numeric characters
    const cleanString = value.replace(/[^0-9]/g, '');
    return Number(cleanString) || 0;
  }
  return 0;
}
