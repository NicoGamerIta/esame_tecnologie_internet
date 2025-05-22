// AppWalletProvider.tsx
"use client";

import React, { useMemo, useEffect, useState, createContext, useContext } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { createPhantom, Position } from "@phantom/wallet-sdk";
import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletAuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  phantomEmbedded: any;
  isEmbeddedConnected: boolean;
}

const WalletAuthContext = createContext<WalletAuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  phantomEmbedded: null,
  isEmbeddedConnected: false,
});

export const useWalletAuth = () => useContext(WalletAuthContext);

const AppWalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [phantomEmbedded, setPhantomEmbedded] = useState<any>(null);
  const [isEmbeddedConnected, setIsEmbeddedConnected] = useState(false);
  
  useEffect(() => {
    const initPhantomEmbedded = async () => {
      // Inizializza Phantom Embedded
      const phantom = await createPhantom({
        position: Position.bottomLeft,
      });
      setPhantomEmbedded(phantom);

      // Controlla se l'utente è già connesso con Phantom Embedded
      const publicKey = await phantom.solana.connect();
      setIsEmbeddedConnected(!!publicKey);
    };

    initPhantomEmbedded();
  }, []);

  // In questo esempio, non passiamo wallet adapter a WalletProvider
  // perché usi Phantom Embedded in maniera separata.
  const wallets = useMemo(() => [new PhantomWalletAdapter(),], []);

  const authContextValue = useMemo(() => ({
    isAuthenticated: isUserAuthenticated,
    setIsAuthenticated: setIsUserAuthenticated,
    phantomEmbedded,
    isEmbeddedConnected,
  }), [isUserAuthenticated, phantomEmbedded, isEmbeddedConnected]);

  return (
    <WalletAuthContext.Provider value={authContextValue}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </WalletAuthContext.Provider>
  );
};

export default AppWalletProvider;
