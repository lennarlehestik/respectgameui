import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { 
  Box, 
  Typography, 
  Input, 
  Textarea, 
  Button,
  FormControl,
  FormLabel,
  Card,
  Alert
} from '@mui/joy';
import { createPublicClient, http } from 'viem';
import { optimism } from 'viem/chains';
import { ENTRYPOINT_ADDRESS_V07, bundlerActions } from 'permissionless';
import { createZeroDevPaymasterClient, createKernelAccount, createKernelAccountClient } from "@zerodev/sdk";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { providerToSmartAccountSigner } from 'permissionless';

function MakeDao() {
  const { login, authenticated, ready, logout } = usePrivy();
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

  const contractAddress = '0xb46A3ff0122907ee7EAaD5123B5A2aCd2f1F293f';
  const abi = [
    "function createCommunity(string memory _name, string memory _description, string memory _imageUrl, string memory _tokenName, string memory _tokenSymbol) public returns (uint256)"
  ];

  const bundlerRPC = 'https://rpc.zerodev.app/api/v2/bundler/3e1ef186-3996-436f-a4ec-12b39e6d037a';
  const paymasterRPC = 'https://rpc.zerodev.app/api/v2/paymaster/3e1ef186-3996-436f-a4ec-12b39e6d037a';
  const [walletDetails, setWalletDetails] = useState(null);

  useEffect(() => {
    if (authenticated && wallets.length > 0) {
      setWalletDetails(wallets[0]);
      initializeSmartAccount();
    }
  }, [authenticated, wallets]);

  const initializeSmartAccount = async () => {
    try {
      console.log("All wallets:", wallets);

      if (wallets.length === 0) {
        throw new Error("No wallets found");
      }

      // Use the first available wallet instead of looking specifically for 'privy' type
      const wallet = wallets[0];
      console.log("Selected wallet:", wallet);

      let provider;
      if (typeof wallet.getEthereumProvider === 'function') {
        provider = await wallet.getEthereumProvider();
      } else if (wallet.provider) {
        provider = wallet.provider;
      } else {
        throw new Error("No suitable provider found on the wallet");
      }

      console.log("Ethereum provider:", provider);

      const smartAccountSigner = await providerToSmartAccountSigner(provider);

      const publicClient = createPublicClient({
        chain: optimism,
        transport: http(bundlerRPC),
      });

      const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
        signer: smartAccountSigner,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        kernelVersion: KERNEL_V3_1,
      });

      const account = await createKernelAccount(publicClient, {
        plugins: {
          sudo: ecdsaValidator,
        },
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        kernelVersion: KERNEL_V3_1,
      });

      const client = createKernelAccountClient({
        account,
        entryPoint: ENTRYPOINT_ADDRESS_V07,
        chain: optimism,
        bundlerTransport: http(bundlerRPC),
        middleware: {
          sponsorUserOperation: async ({ userOperation }) => {
            const paymasterClient = createZeroDevPaymasterClient({
              chain: optimism,
              transport: http(paymasterRPC),
              entryPoint: ENTRYPOINT_ADDRESS_V07,
            });
            return paymasterClient.sponsorUserOperation({
              userOperation,
              entryPoint: ENTRYPOINT_ADDRESS_V07,
            });
          }
        }
      });

      setKernelClient(client);
      setSmartAccountAddress(account.address);
    } catch (err) {
      setError(`Error initializing smart account: ${err.message}`);
    }
  };

  const handleCreateCommunity = async () => {
    if (!authenticated || !kernelClient) {
      setError('Please login first and wait for smart account initialization');
      return;
    }
  
    try {
      const iface = new ethers.utils.Interface(abi);
      const data = iface.encodeFunctionData("createCommunity", [
        communityName,
        communityDescription,
        imageUrl,
        tokenName,
        tokenSymbol
      ]);
  
      const userOpHash = await kernelClient.sendUserOperation({
        userOperation: {
          callData: await kernelClient.account.encodeCallData({
            to: contractAddress,
            value: '0', // Use '0' as a string instead of BigInt(0)
            data: data,
          }),
        },
      });
  
      console.log("UserOperation Hash:", userOpHash);
  
      const bundlerClient = kernelClient.extend(bundlerActions(ENTRYPOINT_ADDRESS_V07));
      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });
  
      setSuccess(`Community created! Transaction hash: ${receipt.receipt.transactionHash}`);
      // Reset form fields
      setCommunityName('');
      setCommunityDescription('');
      setImageUrl('');
      setTokenName('');
      setTokenSymbol('');
    } catch (err) {
      setError(`Error creating community: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setSuccess('Logged out successfully');
      setKernelClient(null);
      setSmartAccountAddress('');
    } catch (err) {
      setError(`Error logging out: ${err.message}`);
    }
  };

  if (!ready) {
    return <div>Loading...</div>;
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
            transform: 'scale(1.1)', // Slightly enlarge the background
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
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography level="h3" sx={{ mb: 3 }}>Make a Respect Game</Typography>
          
          {!authenticated ? (
            <Button 
              variant="solid" 
              color="primary" 
              fullWidth 
              onClick={login}
              sx={{ mb: 2 }}
            >
              Login to Create Community
            </Button>
          ) : (
            <>
              <Typography level="body2" sx={{ mb: 1 }}>
                EOA: {wallets[0]?.address}
              </Typography>
              <Typography level="body2" sx={{ mb: 2 }}>
                Smart Account: {smartAccountAddress || 'Initializing...'}
              </Typography>

              <FormControl>
                <FormLabel>Community name</FormLabel>
                <Input 
                  value={communityName} 
                  onChange={(e) => setCommunityName(e.target.value)} 
                  sx={{ mb: 2 }} 
                />
              </FormControl>

              <FormControl>
                <FormLabel>Community description</FormLabel>
                <Textarea 
                  value={communityDescription}
                  onChange={(e) => setCommunityDescription(e.target.value)}
                  minRows={3} 
                  maxRows={5} 
                  sx={{ mb: 2 }} 
                />
              </FormControl>

              <FormControl>
                <FormLabel>Community image URL</FormLabel>
                <Input 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  sx={{ mb: 2 }} 
                />
              </FormControl>

              <FormControl>
                <FormLabel>Token name</FormLabel>
                <Input 
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  sx={{ mb: 2 }} 
                />
              </FormControl>

              <FormControl>
                <FormLabel>Token symbol</FormLabel>
                <Input 
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                  sx={{ mb: 2 }} 
                />
              </FormControl>

              <Button 
                variant="solid" 
                color="primary" 
                fullWidth 
                sx={{ mt: 3 }} 
                onClick={handleCreateCommunity}
                disabled={!kernelClient}
              >
                Make respect game
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
          backgroundImage: 'url("./makegamebg.png")', // Make sure to use the correct path to your image
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} 
      />
    </Box>
  );
}

export default MakeDao;