import React, { createContext, useContext, useEffect, useCallback, useState, useMemo } from 'react';
import { usePrivySmartAccount } from "@zerodev/privy";

export const AuthContext = createContext();

const log = (message, data = null) => {
  console.log(`AuthProvider: ${message}`, data);
};

export const AuthProvider = ({ children }) => {
  const privyValues = usePrivySmartAccount();
  const { 
    ready, 
    authenticated, 
    login, 
    logout, 
    sendTransaction,
    user
  } = privyValues;

  const [smartWalletAddress, setSmartWalletAddress] = useState(null);

  useEffect(() => {
    log('Privy values changed', privyValues);
  }, [privyValues]);

  useEffect(() => {
    log('AuthProvider mounted');
    return () => log('AuthProvider unmounted');
  }, []);

  useEffect(() => {
    log('Auth state changed', {
      ready,
      authenticated,
      userAddress: user?.wallet?.address
    });
    console.log("USER:")
    console.log(user)

    if (authenticated && user?.wallet?.address) {
      setSmartWalletAddress(user.wallet.address);
    } else {
      setSmartWalletAddress(null);
    }
  }, [authenticated, user?.wallet?.address]);

  const getSmartWalletAddress = useCallback(() => {
    return smartWalletAddress;
  }, [smartWalletAddress]);

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);