import { useEffect } from 'react';
import { useConnectWallet, useWallets } from '@mysten/dapp-kit';

export function useStableAutoConnect() {
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();

  useEffect(() => {
    const lastWallet = localStorage.getItem('last_wallet');
    if (lastWallet) {
      const wallet = wallets.find((w) => w.name === lastWallet);
      if (wallet) {
        connect({ wallet });
      }
    }
  }, [wallets, connect]);

  return null;
}
