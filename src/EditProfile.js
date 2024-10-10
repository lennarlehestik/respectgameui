/* global BigInt */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link} from 'react-router-dom';
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
import { customSwal, customCenteredSwal, customModalSwal } from './customSwal';

function EditProfile() {
  const { id: communityId } = useParams();
  const navigate = useNavigate();
  const { authenticated, sendTransaction, getSmartWalletAddress, ready } = useAuth();
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [smartAccountAddress, setSmartAccountAddress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (authenticated && ready) {
        const address = await getSmartWalletAddress();
        setSmartAccountAddress(address);
        console.log(`Smart wallet address: ${address}`);
        
        // Fetch current profile data
        try {
          const response = await fetch(`https://respectgameapi-d34365572ae7.herokuapp.com/api/profile/${address}`);
          const data = await response.json();
          if (data.success) {
            setUsername(data.profile.username);
            setDescription(data.profile.description);
            setProfilePicUrl(data.profile.profilepic);
          }
        } catch (err) {
          console.error('Error fetching profile data:', err);
          customSwal('Error fetching profile data. Please try again.');
        }
        setIsLoading(false);
      }
    };
    fetchProfileData();
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

  const handleUpdateProfile = async () => {
    if (!authenticated || !ready) {
      customSwal("Please authenticate to update your profile.");
      return;
    }
  
    if (!username || !description || !profilePicUrl) {
      customSwal("Please fill in all fields before updating your profile.");
      return;
    }
  
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    console.log('Updating profile...');
    customSwal("Updating profile...");
  
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
      
      console.log(`Transaction sent. Hash: ${txHash}`);
  
      customModalSwal(
        'Success!',
        "Your profile has been updated successfully.",
        'Go to community page',
        () => navigate(`/respectgame/${communityId}`)
      );
    } catch (err) {
      setError(`Error updating profile: ${err.message}`);
      customSwal("Error updating profile: " + err.message);
      console.error(`Error updating profile:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ready || isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>;
  }

  return (
    <Box 
      className="editprofile" 
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
        className="editprofileleft" 
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
          <Typography level="h3">Edit Your Profile</Typography>
          <Typography level="body-md" sx={{ mb: 3 }}>Update your profile information for the Respect Game community.</Typography>

          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }} 
            />
          </FormControl>

          <FormControl>
            <FormLabel>Description</FormLabel>
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
            <ImageUpload onImageUploaded={handleImageUploaded} initialImage={profilePicUrl} />
          </FormControl>

          <Button 
            variant="solid" 
            color="primary" 
            fullWidth 
            sx={{ mt: 3 }} 
            onClick={handleUpdateProfile}
            disabled={isSubmitting || !ready}
          >
            {isSubmitting ? 'Updating...' : 'Update Profile'}
          </Button>
          <Link to={`/respectgame/${communityId}`} style={{ textDecoration: 'none' }}>
            <Button fullWidth variant="outlined" color="primary" sx={{ mb: 3 }}>
              Go back to community
            </Button>
          </Link>

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
        className="editprofileright" 
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

export default EditProfile;