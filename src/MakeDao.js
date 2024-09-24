/* global BigInt */

import React, { useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { optimism, base } from 'viem/chains';
import { createPublicClient, http, encodeFunctionData, parseAbi } from 'viem';
import { providerToSmartAccountSigner, ENTRYPOINT_ADDRESS_V07, bundlerActions } from "permissionless";
import { createZeroDevPaymasterClient, createKernelAccount, createKernelAccountClient } from "@zerodev/sdk";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { 
  Box, 
  Typography, 
  Input, 
  Textarea, 
  Button,
  FormControl,
  FormLabel,
  Card,
  Alert,
  CircularProgress
} from '@mui/joy';
import ImageUpload from './ImageUpload';  // Assuming ImageUpload component is in a separate file

function MakeDao() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [kernelClient, setKernelClient] = useState(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const contractAddress = '0x589302b32b60434470C47898905eBe1ADA67E151';
  const abi = parseAbi([
    "function createCommunity(string _name, string _description, string _imageUrl, string _tokenName, string _tokenSymbol) public returns (uint256)"
  ]);

  const addLog = (message) => {
    setLogs((prevLogs) => [...prevLogs, `${new Date().toISOString()}: ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    const setupSmartAccount = async () => {
      if (ready && authenticated && wallets.length > 0 && !kernelClient) {
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
            const externalWallet = wallets[0];
            provider = await externalWallet.getEthereumProvider();
          }

          addLog('Got Ethereum provider');
          const smartAccountSigner = await providerToSmartAccountSigner(provider);
          addLog('Created smart account signer');
          
          const publicClient = createPublicClient({
            chain: base,
            transport: http('https://rpc.zerodev.app/api/v2/bundler/a1511783-a97b-4114-9d91-c86b20673729'),
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
          setSmartAccountAddress(account.address);

          addLog('Creating Kernel account client...');
          const client = createKernelAccountClient({
            account,
            chain: base,
            entryPoint,
            bundlerTransport: http('https://rpc.zerodev.app/api/v2/bundler/a1511783-a97b-4114-9d91-c86b20673729'),
            middleware: {
              sponsorUserOperation: async ({ userOperation }) => {
                addLog('Sponsoring user operation...');
                const zerodevPaymaster = createZeroDevPaymasterClient({
                  chain: base,
                  entryPoint,
                  transport: http('https://rpc.zerodev.app/api/v2/paymaster/a1511783-a97b-4114-9d91-c86b20673729'),
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
          setError(`Error setting up smart account: ${error.message}`);
        } finally {
          setIsLoading(false);
        }
      }
    };

    setupSmartAccount();
  }, [ready, authenticated, wallets]);

  const handleImageUploaded = (url) => {
    setImageUrl(url);
    addLog(`Image uploaded successfully: ${url}`);
  };

  const handleCreateCommunity = async () => {
    if (!kernelClient) {
      setError('Smart account not set up. Please try again.');
      return;
    }

    if (!imageUrl) {
      setError('Please upload an image before creating the community.');
      return;
    }

    setIsLoading(true);
    addLog('Creating community...');
    try {
      const callData = encodeFunctionData({
        abi,
        functionName: 'createCommunity',
        args: [communityName, communityDescription, imageUrl, tokenName, tokenSymbol]
      });

      const userOpHash = await kernelClient.sendUserOperation({
        userOperation: {
          callData: await kernelClient.account.encodeCallData({
            to: contractAddress,
            value: BigInt(0),
            data: callData,
          }),
        },
      });
      addLog(`UserOperation hash: ${userOpHash}`);
      
      const bundlerClient = kernelClient.extend(bundlerActions(ENTRYPOINT_ADDRESS_V07));
      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });
      const txHash = receipt.receipt.transactionHash;
      setSuccess(`Community created! Transaction hash: ${txHash}`);
      addLog(`Transaction completed. Hash: ${txHash}`);

      // Reset form fields
      setCommunityName('');
      setCommunityDescription('');
      setImageUrl('');
      setTokenName('');
      setTokenSymbol('');
    } catch (err) {
      setError(`Error creating community: ${err.message}`);
      addLog(`Error creating community: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setSuccess('Logged out successfully');
      setKernelClient(null);
      setSmartAccountAddress('');
      setLogs([]);
    } catch (err) {
      setError(`Error logging out: ${err.message}`);
    }
  };

  if (!ready) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>;
  }

  return (
    <Box 
      className="makedao" 
      sx={{ 
        display: 'flex', 
        height: '100vh',
        flexDirection: { xs: 'column', md: 'row' },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box 
        className="makedaoleft" 
        sx={{ 
          width: { xs: '100%', md: '50%' }, 
          height: '100%',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          zIndex: 1,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-5%',
            left: '-5%',
            right: '-5%',
            bottom: '-5%',
            backgroundImage: { xs: 'url("./makegamebg.png")', md: 'none' },
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            transform: 'scale(1.1)',
            zIndex: -1
          }
        }}
      >
        <Card 
          variant="outlined" 
          sx={{ 
            width: { xs: '90%', sm: '80%' }, 
            maxWidth: 400,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography level="h3" sx={{ mb: 1 }}>Create a Respect Game Community</Typography>
          
          {!authenticated ? (
            <Button fullWidth onClick={login} sx={{ mb: 1 }}>
              Login to Create Community
            </Button>
          ) : (
            <>
              <Typography level="body2" sx={{ mb: 0, fontSize:"12px" }}>
                EOA: {wallets[0]?.address}
              </Typography>
              <Typography level="body2" sx={{ mb: 0, fontSize:"12px" }}>
                Smart Account: {smartAccountAddress || 'Initializing...'}
              </Typography>

              <FormControl>
                <FormLabel>Community name</FormLabel>
                <Input 
                  value={communityName} 
                  onChange={(e) => setCommunityName(e.target.value)} 
                  sx={{ mb: 1 }} 
                />
              </FormControl>

              <FormControl>
                <FormLabel>Community description</FormLabel>
                <Textarea 
                  value={communityDescription}
                  onChange={(e) => setCommunityDescription(e.target.value)}
                  minRows={3} 
                  maxRows={5} 
                  sx={{ mb: 1 }} 
                />
              </FormControl>

              <FormControl>
                <FormLabel>Community image</FormLabel>
                <ImageUpload onImageUploaded={handleImageUploaded} />
              </FormControl>

              <FormControl>
                <FormLabel>Token name</FormLabel>
                <Input 
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  sx={{ mb: 1 }} 
                />
              </FormControl>

              <FormControl>
                <FormLabel>Token symbol</FormLabel>
                <Input 
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                  sx={{ mb: 1 }} 
                />
              </FormControl>

              <Button 
                variant="solid" 
                color="primary" 
                fullWidth 
                sx={{ mt: 2 }} 
                onClick={handleCreateCommunity}
                disabled={isLoading || !kernelClient}
              >
                {isLoading ? 'Processing...' : 'Create Respect Game Community'}
              </Button>

              <Button 
                variant="outlined" 
                color="neutral" 
                fullWidth 
                sx={{ mt: 2 }} 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          )}

          {error && (
            <Alert color="danger" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert color="success" sx={{ mt: 2 }}>
              {success}
            </Alert>
          )}
        </Card>
      </Box>
      <Box 
        className="makedaoright" 
        sx={{ 
          display: { xs: 'none', md: 'block' },
          width: '50%',
          height: '100%',
          backgroundImage: 'url("./makegamebg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} 
      />
    </Box>
  );
}

export default MakeDao;