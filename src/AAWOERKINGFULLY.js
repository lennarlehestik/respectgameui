import React, { useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { optimism } from 'viem/chains';
import { createPublicClient, http, Hex, createWalletClient, custom } from 'viem';
import { providerToSmartAccountSigner, ENTRYPOINT_ADDRESS_V07, bundlerActions } from "permissionless";
import { createZeroDevPaymasterClient, createKernelAccount, createKernelAccountClient } from "@zerodev/sdk";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";

const PrivyZeroDevDemo = () => {
  const { login, logout, ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [kernelClient, setKernelClient] = useState(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs((prevLogs) => [...prevLogs, `${new Date().toISOString()}: ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    const setupSmartAccount = async () => {
      if (authenticated && wallets.length > 0) {
        setIsLoading(true);
        addLog('Starting smart account setup');
        try {
          let provider;
          const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
          if (embeddedWallet) {
            addLog('Using embedded wallet');
            provider = await embeddedWallet.getEthereumProvider();
          } else {
            addLog('Using external wallet');
            const externalWallet = wallets[0]; // Assuming the first wallet is the connected one
            provider = await externalWallet.getEthereumProvider();
          }

          addLog('Got Ethereum provider');
          const smartAccountSigner = await providerToSmartAccountSigner(provider);
          addLog('Created smart account signer');
          
          const publicClient = createPublicClient({
            chain: optimism,
            transport: http('https://rpc.zerodev.app/api/v2/bundler/3e1ef186-3996-436f-a4ec-12b39e6d037a'),
          });
          addLog('Created public client');

          const entryPoint = ENTRYPOINT_ADDRESS_V07;
          const kernelVersion = KERNEL_V3_1;

          addLog('Creating ECDSA validator...');
          const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
            signer: smartAccountSigner,
            entryPoint,
            kernelVersion,
          });
          addLog('ECDSA validator created');

          addLog('Creating Kernel account...');
          const account = await createKernelAccount(publicClient, {
            plugins: {
              sudo: ecdsaValidator,
            },
            entryPoint,
            kernelVersion,
          });
          addLog(`Kernel account created: ${account.address}`);

          addLog('Creating Kernel account client...');
          const client = createKernelAccountClient({
            account,
            chain: optimism,
            entryPoint,
            bundlerTransport: http('https://rpc.zerodev.app/api/v2/bundler/3e1ef186-3996-436f-a4ec-12b39e6d037a'),
            middleware: {
              sponsorUserOperation: async ({ userOperation }) => {
                addLog('Sponsoring user operation...');
                const zerodevPaymaster = createZeroDevPaymasterClient({
                  chain: optimism,
                  entryPoint,
                  transport: http('https://rpc.zerodev.app/api/v2/paymaster/3e1ef186-3996-436f-a4ec-12b39e6d037a'),
                });
                const result = await zerodevPaymaster.sponsorUserOperation({
                  userOperation,
                  entryPoint,
                });
                addLog('User operation sponsored');
                return result;
              }
            }
          });
          addLog('Kernel account client created');

          setKernelClient(client);
          addLog('Smart account setup complete');
        } catch (error) {
          addLog(`Error setting up smart account: ${error.message}`);
          console.error('Error setting up smart account:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    setupSmartAccount();
  }, [authenticated, wallets]);

  const handleSendTransaction = async () => {
    if (kernelClient) {
      setIsLoading(true);
      addLog('Sending transaction...');
      try {
        const userOpHash = await kernelClient.sendUserOperation({
          userOperation: {
            callData: await kernelClient.account.encodeCallData({
              to: '0x0000000000000000000000000000000000000000', // Replace with actual recipient address
              value: BigInt(0), // Replace with actual value if sending ETH
              data: '0x', // Replace with actual data if interacting with a contract
            }),
          },
        });
        addLog(`UserOperation hash: ${userOpHash}`);
        
        const bundlerClient = kernelClient.extend(bundlerActions(ENTRYPOINT_ADDRESS_V07));
        const receipt = await bundlerClient.waitForUserOperationReceipt({
          hash: userOpHash,
        });
        setTransactionHash(receipt.receipt.transactionHash);
        addLog(`Transaction completed. Hash: ${receipt.receipt.transactionHash}`);
      } catch (error) {
        addLog(`Transaction failed: ${error.message}`);
        console.error('Transaction failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLogout = () => {
    logout();
    setKernelClient(null);
    setTransactionHash('');
    setLogs([]);
    addLog('Logged out');
  };

  if (!ready) {
    return <div>Loading Privy...</div>;
  }

  return (
    <div>
      {!authenticated ? (
        <button onClick={login}>Login with Privy</button>
      ) : (
        <div>
          <p>Logged in!</p>
          <button onClick={handleLogout}>Logout</button>
          <button 
            onClick={handleSendTransaction} 
            disabled={!kernelClient || isLoading}
          >
            {isLoading ? 'Processing...' : 'Send Gas Sponsored Transaction'}
          </button>
          {!kernelClient && !isLoading && (
            <p>Setting up your smart account... This may take a moment.</p>
          )}
          {transactionHash && <p>Transaction sent! Hash: {transactionHash}</p>}
          <div>
            <h3>Logs:</h3>
            <ul>
              {logs.map((log, index) => (
                <li key={index}>{log}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
export default PrivyZeroDevDemo;