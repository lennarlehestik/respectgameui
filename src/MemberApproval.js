/* global BigInt */

import React, { useState, useEffect } from 'react';
import { useParams, Link} from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Avatar,
  Button,
  Stack,
  CircularProgress
} from '@mui/joy';
import Drawer from './Drawer';
import { useAuth } from './AuthProvider';
import { customSwal } from './customSwal';
import axios from 'axios';
import { encodeFunctionData, parseAbi } from 'viem';

function MemberApproval() {
  const { communityId } = useParams();
  const { authenticated, sendTransaction } = useAuth();
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [community, setCommunity] = useState(null);

  const contractAddress = '0x589302b32b60434470C47898905eBe1ADA67E151';
  const abi = parseAbi([
    "function approveUser(address _user, uint256 _communityId) public"
  ]);

  useEffect(() => {
    fetchPendingMembers();
  }, [communityId]);

  const fetchPendingMembers = async () => {
    try {
      console.log("Community ID", communityId);
      const response = await axios.get(`https://respectgameapi-d34365572ae7.herokuapp.com/api/community/${communityId}/pending-members`);
      const communityData = response.data.data.community;
      const allPendingMembers = response.data.data.pendingMembers;
      console.log('All pending members:', allPendingMembers);
      
      // Filter out pending members who are already in memberAddresses
      const filteredPendingMembers = allPendingMembers.filter(
        member => !communityData.memberAddresses.includes(member.user)
      );

      setPendingMembers(filteredPendingMembers);
      setCommunity(communityData);
      console.log('Filtered pending members:', filteredPendingMembers);
      
      // Create a map of user addresses to profiles
      const profileMap = {};
      response.data.data.profiles.forEach(profile => {
        profileMap[profile.user] = profile;
      });
      setProfiles(profileMap);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pending members:', error);
      customSwal('Error fetching pending members. Please try again.');
      setLoading(false);
    }
  };

  const handleApprove = async (userAddress) => {
    if (!authenticated) {
      customSwal('Please authenticate to approve members.');
      return;
    }

    setApproving(true);
    try {
      const callData = encodeFunctionData({
        abi,
        functionName: 'approveUser',
        args: [userAddress, BigInt(communityId)]
      });

      const txHash = await sendTransaction({
        to: contractAddress,
        value: BigInt(0),
        data: callData
      });

      customSwal(`Member approved successfully! Transaction hash: ${txHash}`);
      fetchPendingMembers(); // Refresh the list
    } catch (error) {
      console.error('Error approving member:', error);
      customSwal('Error approving member. Please try again.');
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="member-approval-page">
      <Drawer />
      <Box sx={{ pt: '100px', px: 3, display: 'flex', justifyContent: 'center'}}>
        <Box sx={{ maxWidth: '600px', width: '100%', display:"flex", flexDirection:"column", alignItems:"center"}}>
          <Typography level="h2" sx={{ mb: 3, textAlign: 'center' }}>
            Approve members for {community?.name}
          </Typography>
          <Link to={`/respectgame/${communityId}`} style={{ textDecoration: 'none' }}>
            <Button variant="outlined" color="primary" sx={{ mb: 3 }}>
              Go back to community
            </Button>
          </Link>
          <Stack spacing={3} alignItems="center">
            {pendingMembers.map((member) => {
              const profile = profiles[member.user];
              return (
                <Card key={member.id} variant="outlined" sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      src={profile?.profilepic} 
                      alt={profile?.username || 'Unknown'}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    />
                    <Box>
                      <Typography level="h5">{profile?.username || 'Unknown'}</Typography>
                      <Typography level="body2" sx={{ color: 'text.secondary' }}>
                        {member.user}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography level="body1" sx={{ mb: 2 }}>
                    {profile?.description || 'No description provided.'}
                  </Typography>
                  <Button
                    variant="solid"
                    color="primary"
                    fullWidth
                    onClick={() => handleApprove(member.user)}
                    disabled={approving}
                  >
                    {approving ? 'Approving...' : `Approve (${member.approvalCount}/2)`}
                  </Button>
                </Card>
              );
            })}
            {pendingMembers.length === 0 && (
              <Typography level="body1" sx={{ textAlign: 'center' }}>
                No pending members to approve.
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default MemberApproval;