// Global type declarations for browser window object
interface Window {
  // Wallet extensions
  phantom?: any;
  suiWallet?: any;
  martian?: any;
  solana?: any;
}

// Extend the existing Window interface
declare global {
  interface Window {
    phantom?: any;
    suiWallet?: any;
    martian?: any;
    solana?: any;
  }
}

export {};
