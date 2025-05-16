/* global BigInt */

import React, { createContext, useContext, useEffect, useCallback, useState, useMemo } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export const AuthContext = createContext();

const log = (message, data = null) => {
  console.log(`AuthProvider: ${message}`, data);
};

export const AuthProvider = ({ children }) => {
  const privy = usePrivy();
  const {
    ready,
    authenticated,
    login,
    logout,
    user,
    sendTransaction: privySendTransaction,
    connectWallet
  } = privy;

  const [smartWalletAddress, setSmartWalletAddress] = useState(null);
  const [walletType, setWalletType] = useState(null); // 'embedded' or 'external'

  useEffect(() => {
    if (authenticated && user?.wallet) {
      setSmartWalletAddress(user.wallet.address);
      
      // Determine wallet type
      if (user.wallet.walletClientType === 'privy') {
        setWalletType('embedded');
      } else {
        setWalletType('external');
      }
      
      console.log("User wallet info:", user.wallet);
    } else {
      setSmartWalletAddress(null);
      setWalletType(null);
    }
  }, [authenticated, user?.wallet]);

  const getSmartWalletAddress = useCallback(() => smartWalletAddress, [smartWalletAddress]);

  const checkSmartWalletStatus = useCallback(() => {
    log('Checking wallet status', {
      address: smartWalletAddress,
      authenticated,
      walletType
    });
  }, [smartWalletAddress, authenticated, walletType]);

  // Separate function specifically for external wallet transactions
  const sendExternalWalletTransaction = useCallback(async (txParams) => {
    if (!window.ethereum) {
      throw new Error('No Ethereum provider found');
    }
    
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. User may need to connect their wallet.');
    }
    
    const from = accounts[0];
    console.log("Transaction params received:", txParams);
    
    try {
      // Try to estimate gas first as a fallback
      let estimatedGas;
      try {
        console.log("Attempting gas estimation...");
        estimatedGas = await window.ethereum.request({
          method: 'eth_estimateGas',
          params: [{
            from,
            to: txParams.to,
            data: txParams.data || '0x',
            value: txParams.value ? 
              (typeof txParams.value === 'bigint' ? 
                '0x' + txParams.value.toString(16) : 
                '0x' + BigInt(txParams.value).toString(16)) : 
              '0x0'
          }]
        });
        console.log("Gas estimation result:", estimatedGas);
      } catch (estimateError) {
        console.warn("Gas estimation failed:", estimateError);
        estimatedGas = null;
      }
      
      // Format values properly
      let value = '0x0';
      if (txParams.value) {
        if (typeof txParams.value === 'bigint') {
          value = '0x' + txParams.value.toString(16);
        } else {
          value = '0x' + BigInt(txParams.value).toString(16);
        }
      }
      
      // FALLBACK MINIMUM GAS VALUE
      const MIN_GAS = '0x5208'; // 21000 (minimum for a standard tx)
      const HIGH_GAS = '0x186A0'; // 100,000
      const VERY_HIGH_GAS = '0x989680'; // 10,000,000
      
      // Determine gas to use - use estimation if available, otherwise fallback to high value
      const gasToUse = estimatedGas && estimatedGas !== '0x0' ? 
                       estimatedGas : 
                       VERY_HIGH_GAS;
                       
      console.log("Using gas value:", gasToUse);
      
      // Build a minimal transaction object
      const txObject = {
        from: from,
        to: txParams.to
      };
      
      // Only add non-empty/non-zero values to prevent defaults from being overridden
      if (txParams.data && txParams.data !== '0x') {
        txObject.data = txParams.data;
      }
      
      if (value !== '0x0') {
        txObject.value = value;
      }
      
      // Try different approaches to setting gas
      // Approach 1: Use gas parameter
      txObject.gas = gasToUse;
      
      // Approach 2: Also try gasLimit as some providers use this
      txObject.gasLimit = gasToUse;
      
      console.log("Sending transaction with params:", JSON.stringify(txObject));
      
      try {
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [txObject]
        });
        console.log("Transaction successful, hash:", txHash);
        return txHash;
      } catch (innerError) {
        console.error("First transaction attempt failed:", innerError);
        
        // Try a second approach with a different format if first fails
        if (innerError.message && (
            innerError.message.includes("gas") || 
            innerError.message.includes("intrinsic")
        )) {
          console.warn("Gas error detected, trying alternative approach");
          
          // Remove gasLimit and try again with only gas
          delete txObject.gasLimit;
          // Set an extremely high gas value
          txObject.gas = VERY_HIGH_GAS;
          
          console.log("Retrying with simplified params:", JSON.stringify(txObject));
          return await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [txObject]
          });
        }
        throw innerError;
      }
    } catch (error) {
      console.error("External wallet transaction failed:", error);
      throw error;
    }
  }, []);

  // Enhanced sendTransaction that uses the appropriate method based on wallet type
  const sendTransaction = useCallback(async (txParams) => {
    if (!authenticated) {
      throw new Error('User must be authenticated to send a transaction');
    }

    if (!user?.wallet) {
      throw new Error('No wallet available');
    }

    console.log("Sending transaction with wallet type:", walletType);
    
    try {
      if (walletType === 'embedded') {
        return await privySendTransaction(txParams);
      } else {
        // For external wallets, use our dedicated function
        return await sendExternalWalletTransaction(txParams);
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }, [authenticated, user, walletType, privySendTransaction, sendExternalWalletTransaction]);

  const value = useMemo(() => ({
    ready,
    authenticated,
    login,
    logout,
    sendTransaction,
    getSmartWalletAddress,
    checkSmartWalletStatus,
    user,
    smartWalletAddress,
    walletType,
    connectWallet
  }), [ready, authenticated, login, logout, sendTransaction, getSmartWalletAddress, 
      checkSmartWalletStatus, user, smartWalletAddress, walletType, connectWallet]);

  // Log only when important values change
  useEffect(() => {
    log('Auth state changed', {
      ready,
      authenticated,
      userAddress: user?.wallet?.address,
      smartWalletAddress,
      walletType
    });
  }, [ready, authenticated, user?.wallet?.address, smartWalletAddress, walletType]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
