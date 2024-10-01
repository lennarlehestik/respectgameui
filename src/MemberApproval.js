import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Avatar,
  Button,
  Stack,
  CircularProgress,
} from '@mui/joy';
import Drawer from './Drawer';
import { useAuth } from './AuthProvider';
import { customSwal } from './customSwal';

// Dummy data for pending members
const pendingMembers = [
  {
    id: 1,
    name: 'Alice Johnson',
    address: '0x1234...5678',
    description: 'Passionate about blockchain technology and its potential to revolutionize industries. Excited to contribute to this community!',
    profilePic: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: 2,
    name: 'Bob Smith',
    address: '0xabcd...efgh',
    description: 'Software engineer with a focus on decentralized applications. Looking forward to collaborating with like-minded individuals.',
    profilePic: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: 3,
    name: 'Carol Williams',
    address: '0x9876...5432',
    description: 'Researcher in cryptography and privacy-preserving technologies. Eager to share knowledge and learn from the community.',
    profilePic: 'https://i.pravatar.cc/150?img=3',
  },
];

function MemberApproval() {
  const { authenticated, sendTransaction } = useAuth();
  const [loading, setLoading] = useState(false);
  const [approvedMembers, setApprovedMembers] = useState([]);

  const handleApprove = async (memberId) => {
    if (!authenticated) {
      customSwal('Please authenticate to approve members.');
      return;
    }

    setLoading(true);
    try {
      // Simulating a transaction for member approval
      // In a real scenario, you would call your smart contract here
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setApprovedMembers([...approvedMembers, memberId]);
      customSwal('Member approved successfully!');
    } catch (error) {
      console.error('Error approving member:', error);
      customSwal('Error approving member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="member-approval-page">
      <Drawer />
      <Box sx={{ pt: '100px', px: 3, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ maxWidth: '600px', width: '100%' }}>
          <Typography level="h2" sx={{ mb: 3, textAlign: 'center' }}>
            Member Approval Mockup
          </Typography>
          <Stack spacing={3} alignItems="center">
            {pendingMembers.map((member) => (
              <Card key={member.id} variant="outlined" sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={member.profilePic} 
                    alt={member.name}
                    sx={{ width: 60, height: 60, mr: 2 }}
                  />
                  <Box>
                    <Typography level="h5">{member.name}</Typography>
                    <Typography level="body2" sx={{ color: 'text.secondary' }}>
                      {member.address}
                    </Typography>
                  </Box>
                </Box>
                <Typography level="body1" sx={{ mb: 2 }}>
                  {member.description}
                </Typography>
                <Button
                  variant="solid"
                  color="primary"
                  fullWidth
                  onClick={() => handleApprove(member.id)}
                  disabled={loading || approvedMembers.includes(member.id)}
                >
                  {approvedMembers.includes(member.id) ? 'Approved' : 'Approve (0/2)'}
                </Button>
              </Card>
            ))}
          </Stack>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default MemberApproval;