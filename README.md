# Warung Salsabila POS

Mobile Cloud POS built with Next.js, Firebase, and RawBT integration for thermal printing.

## Features
- **Mobile First Design**: Optimized for Android phones.
- **Offline Capable**: Works without internet (syncs when online).
- **One-Click Print**: Integrates with RawBT for Bluetooth thermal printers.
- **Cloud Storage**: Real-time data with Firebase Firestore.

## Prerequisites
1. **Node.js** 18+ installed.
2. **Firebase Project**:
   - Create a project at [console.firebase.google.com](https://console.firebase.google.com).
   - Enable **Authentication** (Email/Password).
   - Enable **Firestore Database**.
   - Create a Web App and get the configuration keys.
3. **RawBT Driver** (Android):
   - Install "RawBT driver for thermal printer" from Play Store.
   - Configure your Bluetooth printer in RawBT.
   - Enable "Allow remote print" in RawBT settings if needed (usually works via URI scheme by default).

## Setup

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Rename `.env.local` to `.env.local.backup` (or keep it as reference) and create a new `.env.local` with your Firebase keys:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Build for Production**
   ```bash
   npm run build
   ```

## Usage
1. Login with a Firebase user (create one in Firebase Console first).
2. Add products in Firebase Console (`products` collection) or use the app (currently read-only menu, add products manually in DB).
   - Collection: `products`
   - Document fields:
     - `name` (string)
     - `price` (number)
     - `category` (string)
     - `isAvailable` (boolean)
3. Select items to add to cart.
4. Open cart and click "Bayar & Cetak".
5. App will save transaction and trigger RawBT to print.

## Data Structure
**Products Collection (`products`)**:
```json
{
  "name": "Nasi Goreng",
  "price": 15000,
  "category": "Makanan",
  "isAvailable": true,
  "createdAt": timestamp
}
```

**Transactions Collection (`transactions`)**:
Automatically created upon checkout.
