/* global BigInt */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { base } from 'viem/chains';
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

function Invite() {
  const { id } = useParams();
  console.log("COMMUNITYID", id)
  const communityId = id;
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [kernelClient, setKernelClient] = useState(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const contractAddress = '0x589302b32b60434470C47898905eBe1ADA67E151';
  const abi = parseAbi([
    "function createProfileAndJoinCommunity(string _username, string _description, string _profilePicUrl, uint256 _communityId) public"
  ]);

  const addLog = (message) => {
    setLogs((prevLogs) => [...prevLogs, `${new Date().toISOString()}: ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    const setupSmartAccount = async () => {
      if (!authenticated || wallets.length === 0 || kernelClient) {
        return;
      }

      console.log(wallets)

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
    };

    setupSmartAccount();
  }, [authenticated, wallets]);

  const handleImageUploaded = (url) => {
    setProfilePicUrl(url);
    addLog(`Profile picture uploaded successfully: ${url}`);
  };

  const handleJoinCommunity = async () => {
    if (!kernelClient) {
      setError('Smart account not set up. Please try again.');
      return;
    }

    if (!username || !description || !profilePicUrl) {
      setError('Please fill in all fields before joining the community.');
      return;
    }

    setIsLoading(true);
    console.log([username, description, profilePicUrl, BigInt(communityId)])
    addLog('Joining community...');
    try {
      const callData = encodeFunctionData({
        abi,
        functionName: 'createProfileAndJoinCommunity',
        args: [username, description, profilePicUrl, BigInt(communityId)]
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
      setSuccess(`Joined community successfully! Transaction hash: ${txHash}`);
      addLog(`Transaction completed. Hash: ${txHash}`);

      // Reset form fields
      setUsername('');
      setDescription('');
      setProfilePicUrl('');
    } catch (err) {
      setError(`Error joining community: ${err.message}`);
      addLog(`Error joining community: ${err.message}`);
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
          backgroundColor: 'rgba(255, 255, 255, 0.8)', 
          backdropFilter: 'blur(10px)', 
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            zIndex: -1
          }
        }}
      >
        <Card 
          variant="outlined" 
          sx={{ 
            width: { xs: '90%', sm: '80%' }, 
            maxWidth: 400,
            backgroundColor: 'transparent', 
            boxShadow: 'none', 
          }}
        >
          <Typography level="h3">Join a Respect Game!</Typography>
          <Typography level="body-md" sx={{ mb: 3 }}>You have been invited to community {communityId}! Create a profile and you can participate.</Typography>

          {!authenticated ? (
            <Button fullWidth onClick={login} sx={{ mb: 1 }}>
              Login to Join Community
            </Button>
          ) : (
            <>
              <Typography level="body2" sx={{ mb: 0, fontSize:"12px" }}>
                EOA: {wallets[0]?.address}
              </Typography>
              <Typography level="body2" sx={{ mb: 2, fontSize:"12px" }}>
                Smart Account: {smartAccountAddress || 'Initializing...'}
              </Typography>

              <FormControl>
                <FormLabel>What should we call you?</FormLabel>
                <Input 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{ mb: 2 }} 
                />
              </FormControl>

              <FormControl>
                <FormLabel>Describe yourself</FormLabel>
                <Textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  minRows={3} 
                  maxRows={5} 
                  sx={{ mb: 2 }} 
                />
              </FormControl>

              <FormControl>
                <FormLabel>Profile picture</FormLabel>
                <ImageUpload onImageUploaded={handleImageUploaded} />
              </FormControl>

              <Button 
                variant="solid" 
                color="primary" 
                fullWidth 
                sx={{ mt: 3 }} 
                onClick={handleJoinCommunity}
                disabled={isLoading || !kernelClient}
              >
                {isLoading ? 'Processing...' : 'Join Respect Game'}
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
          backgroundImage: 'url("/makegamebg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} 
      />
    </Box>
  );
}

export default Invite;