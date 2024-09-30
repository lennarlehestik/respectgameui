/* global BigInt */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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

function Invite() {
  const { id: communityId } = useParams();
  const { authenticated, login, logout, sendTransaction, getSmartWalletAddress, ready } = useAuth();
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [smartAccountAddress, setSmartAccountAddress] = useState(null);

  useEffect(() => {
    const fetchSmartWalletAddress = async () => {
      if (authenticated && ready) {
        const address = await getSmartWalletAddress();
        setSmartAccountAddress(address);
        console.log(`Smart wallet address: ${address}`);
      }
    };
    fetchSmartWalletAddress();
  }, [authenticated, ready, getSmartWalletAddress]);

  const contractAddress = '0x589302b32b60434470C47898905eBe1ADA67E151';
  const abi = parseAbi([
    "function createProfileAndJoinCommunity(string _username, string _description, string _profilePicUrl, uint256 _communityId) public"
  ]);

  const handleImageUploaded = (url) => {
    setProfilePicUrl(url);
    console.log(`Profile picture uploaded successfully: ${url}`);
    customSwal("Profile picture uploaded successfully.");
  };

  const handleJoinCommunity = async () => {
    if (!authenticated || !ready) {
      customSwal("Please authenticate to join the community.");
      return;
    }

    if (!username || !description || !profilePicUrl) {
      customSwal("Please fill in all fields before joining the community.");
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');
    console.log('Joining community...');
    customSwal("Joining community...");

    try {
      const callData = encodeFunctionData({
        abi,
        functionName: 'createProfileAndJoinCommunity',
        args: [username, description, profilePicUrl, BigInt(communityId)]
      });

      const txHash = await sendTransaction({
        to: contractAddress,
        value: BigInt(0),
        data: callData
      });
      
      setSuccess(`Joined community successfully! Transaction hash: ${txHash}`);
      customSwal("Joined community successfully!");
      console.log(`Transaction sent. Hash: ${txHash}`);

      // Reset form fields
      setUsername('');
      setDescription('');
      setProfilePicUrl('');
    } catch (err) {
      setError(`Error joining community: ${err.message}`);
      customSwal("Error joining community: " + err.message);
      console.error(`Error joining community:`, err);
    } finally {
      setIsSubmitting(false);
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
                disabled={isSubmitting || !ready}
              >
                {isSubmitting ? 'Processing...' : 'Join Respect Game'}
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
          backgroundImage: 'url("/makegamebg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} 
      />
    </Box>
  );
}

export default Invite;