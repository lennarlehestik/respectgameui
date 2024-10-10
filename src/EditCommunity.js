/* global BigInt */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link} from 'react-router-dom';
import { custom, encodeFunctionData, parseAbi } from 'viem';
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
import { customSwal, customCenteredSwal } from './customSwal';

const EditCommunity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authenticated, ready, sendTransaction } = useAuth();

  const [communityData, setCommunityData] = useState(null);
  const [communityName, setCommunityName] = useState('');
  const [communityDescription, setCommunityDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contractAddress = '0x589302b32b60434470C47898905eBe1ADA67E151';
  const abi = parseAbi([
    "function editCommunity(uint256 _communityId, string _name, string _description, string _imageUrl) public"
  ]);

  useEffect(() => {
    const fetchCommunityData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://respectgameapi-d34365572ae7.herokuapp.com/api/community/${id}`);
        const data = await response.json();
        setCommunityData(data.data.community);
        setCommunityName(data.data.community.name);
        setCommunityDescription(data.data.community.description);
        setImageUrl(data.data.community.imageUrl);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [id]);

  const handleImageUploaded = (url) => {
    setImageUrl(url);
    console.log(`Image uploaded successfully: ${url}`);
    customSwal("Image uploaded successfully.");
  };

  const handleEditCommunity = async () => {
    if (!authenticated || !ready) {
      customSwal("Wallet not initialized. Please try again.");
      return;
    }

    if(communityName.length > 24) {
        customSwal("Community name must be less than 24 characters.");
        return;
      }

      if(communityName.length < 3) {
        customSwal("Community name must be more than 3 characters.");
        return;
     }
  
      if(communityDescription.length > 240) {
        customSwal("Community mission description must be less than 240 characters.");
        return;
      }

    setIsSubmitting(true);
    setError('');

    try {
      const callData = encodeFunctionData({
        abi,
        functionName: 'editCommunity',
        args: [BigInt(id), communityName, communityDescription, imageUrl]
      });

      const txHash = await sendTransaction({
        to: contractAddress,
        value: BigInt(0),
        data: callData
      });

      customCenteredSwal("Community updated successfully! You'll be redirected to the community page.");
      
      setTimeout(() => {
        navigate(`/respectgame/${id}`);
      }, 3000);

    } catch (err) {
      customSwal("Error updating community: " + err.message);
      console.error(`Error updating community:`, err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="danger">{error}</Typography>;
  }

  return (
    <Box 
      className="editcommunity" 
      sx={{ 
        display: 'flex', 
        height: '100vh',
        flexDirection: { xs: 'column', md: 'row' },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Drawer bg="none" />
      <Box 
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
          <Typography level="h3" sx={{ mb: 1 }}>Edit Community</Typography>
          <Typography level="body" sx={{ mb: 2 }}>If you are the creator of the community, you can edit the details.</Typography>
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
            <ImageUpload onImageUploaded={handleImageUploaded} currentImage={imageUrl} />
          </FormControl>

          <Button 
            variant="solid" 
            color="primary" 
            fullWidth 
            sx={{ mt: 2 }} 
            onClick={handleEditCommunity}
            disabled={isSubmitting || !ready}
          >
            {isSubmitting ? 'Processing...' : 'Update Community'}
          </Button>

          <Link to={`/respectgame/${id}`} style={{ textDecoration: 'none' }}>
            <Button fullWidth variant="outlined" color="primary" sx={{ mb: 3 }}>
              Go back to community
            </Button>
          </Link>
        </Card>
      </Box>
      <Box 
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
};

export default EditCommunity;