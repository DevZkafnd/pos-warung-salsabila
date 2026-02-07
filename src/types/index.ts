import { Timestamp } from 'firebase/firestore';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Makanan' | 'Minuman' | string;
  image?: string;
  isAvailable: boolean;
  createdAt: Timestamp;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  category?: string;
}

export interface Transaction {
  id: string; // INV-{Timestamp}
  userId: string;
  items: CartItem[];
  totalAmount: number;
  cashAmount: number;
  changeAmount: number;
  customerName?: string;
  customerAddress?: string;
  timestamp: Timestamp;
}

// For printer helper (can be same as Transaction or simplified)
export interface TransactionData extends Omit<Transaction, 'timestamp'> {
  timestamp: Date | Timestamp; // Allow flexible timestamp for printing
}
