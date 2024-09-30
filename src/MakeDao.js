/* global BigInt */

import React, { useState, useEffect, useRef } from 'react';
import { base } from 'viem/chains';
import { encodeFunctionData, parseAbi } from 'viem';
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
import { useAuth } from './AuthProvider';
import ImageUpload from './ImageUpload';
import Drawer from './Drawer';
import customSwal from './customSwal';
import Confetti from './Confetti';

function MakeDao() {
  const { authenticated, ready, login, logout, sendTransaction, getSmartWalletAddress } = useAuth();
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [smartWalletAddress, setSmartWalletAddress] = useState('');

  const confettiRef = useRef(null);

  const shootConfetti = () => {
    if (confettiRef.current) {
      confettiRef.current.triggerConfetti();
    } else {
      console.error('Confetti ref is not available');
    }
  };


  const contractAddress = '0x589302b32b60434470C47898905eBe1ADA67E151';
  const abi = parseAbi([
    "function createCommunity(string _name, string _description, string _imageUrl, string _tokenName, string _tokenSymbol) public returns (uint256)"
  ]);

  useEffect(() => {
    if (authenticated && ready) {
      const address = getSmartWalletAddress();
      setSmartWalletAddress(address || 'Initializing...');
      console.log(`Smart wallet address: ${address}`);
    }
  }, [authenticated, ready, getSmartWalletAddress]);

  const handleImageUploaded = (url) => {
    setImageUrl(url);
    console.log(`Image uploaded successfully: ${url}`);
    customSwal("Image uploaded successfully.");
  };

  const handleCreateCommunity = async () => {
    if (!authenticated || !ready) {
      customSwal("Wallet not initialized. Please try again.");
      return;
    }

    if (!imageUrl) {
      customSwal("Please upload an image before creating the community.");
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');
    console.log('Creating community...');

    try {
      const callData = encodeFunctionData({
        abi,
        functionName: 'createCommunity',
        args: [communityName, communityDescription, imageUrl, tokenName, tokenSymbol]
      });

      const txHash = await sendTransaction({
        to: contractAddress,
        value: BigInt(0),
        data: callData
      });
      customSwal("Community created! Transaction hash: " + txHash);
      console.log(`Transaction sent. Hash: ${txHash}`);

      // Reset form fields
      setCommunityName('');
      setCommunityDescription('');
      setImageUrl('');
      setTokenName('');
      setTokenSymbol('');
    } catch (err) {
      customSwal("Error creating community:" + err.message);
      console.error(`Error creating community:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <Confetti ref={confettiRef} duration={3000} />
      <Drawer bg={"none"}/>
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
          {/*<button onClick={shootConfetti}>Shoot confetti</button>*/}
          {!authenticated ? (
            <Button fullWidth onClick={login} sx={{ mb: 1 }}>
              Login to Create Community
            </Button>
          ) : (
            <>
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
                disabled={isSubmitting || !ready}
              >
                {isSubmitting ? 'Processing...' : 'Create Respect Game Community'}
              </Button>

              <Button 
                variant="outlined" 
                color="neutral" 
                fullWidth 
                sx={{ mt: 2 }} 
                onClick={logout}
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