import React, { createContext, useContext, useEffect, useCallback, useState, useMemo } from 'react';
import { usePrivySmartAccount } from "@zerodev/privy";

export const AuthContext = createContext();

const log = (message, data = null) => {
  console.log(`AuthProvider: ${message}`, data);
};

export const AuthProvider = ({ children }) => {
  const privySmartAccount = usePrivySmartAccount();
  const {
    ready,
    authenticated,
    login,
    logout,
    sendTransaction,
    user
  } = privySmartAccount;

  const [smartWalletAddress, setSmartWalletAddress] = useState(null);

  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      setSmartWalletAddress(user.wallet.address);
    } else {
      setSmartWalletAddress(null);
    }
  }, [authenticated, user?.wallet?.address]);

  const getSmartWalletAddress = useCallback(() => smartWalletAddress, [smartWalletAddress]);

  const checkSmartWalletStatus = useCallback(() => {
    log('Checking smart wallet status', {
      address: smartWalletAddress,
      authenticated,
    });
  }, [smartWalletAddress, authenticated]);

  const value = useMemo(() => ({
    ready,
    authenticated,
    login,
    logout,
    sendTransaction,
    getSmartWalletAddress,
    checkSmartWalletStatus,
    user,
    smartWalletAddress
  }), [ready, authenticated, login, logout, sendTransaction, getSmartWalletAddress, checkSmartWalletStatus, user, smartWalletAddress]);

  // Log only when important values change
  useEffect(() => {
    log('Auth state changed', {
      ready,
      authenticated,
      userAddress: user?.wallet?.address,
      smartWalletAddress
    });
  }, [ready, authenticated, user?.wallet?.address, smartWalletAddress]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};