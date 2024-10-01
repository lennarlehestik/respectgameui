import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Stack,
  Select,
  Option,
  Input,
  Divider,
  CircularProgress,
} from '@mui/joy';
import Drawer from './Drawer';
import { useAuth } from './AuthProvider';
import { customSwal } from './customSwal';

// Dummy data for existing proposals
const dummyProposals = [
  {
    id: 1,
    type: 'Remove member',
    details: '0x1234...5678',
    signaturesRequired: 3,
    signatureCount: 1,
  },
  {
    id: 2,
    type: 'Mint tokens',
    details: '1000 tokens',
    signaturesRequired: 3,
    signatureCount: 2,
  },
  {
    id: 3,
    type: 'Change weekly distribution amount',
    details: '500 tokens',
    signaturesRequired: 3,
    signatureCount: 0,
  },
];

function ProposalManagement() {
  const { authenticated, sendTransaction } = useAuth();
  const [loading, setLoading] = useState(false);
  const [proposalType, setProposalType] = useState('');
  const [proposalDetails, setProposalDetails] = useState('');
  const [proposals, setProposals] = useState(dummyProposals);

  const getPlaceholder = (type) => {
    switch (type) {
      case 'Remove member':
        return 'Enter member address';
      case 'Mint tokens':
        return 'Enter amount of tokens to mint';
      case 'Change weekly distribution amount':
        return 'Enter new weekly distribution amount';
      default:
        return 'Enter proposal details';
    }
  };

  const handleCreateProposal = async () => {
    if (!authenticated) {
      customSwal('Please authenticate to create a proposal.');
      return;
    }

    if (!proposalType || !proposalDetails) {
      customSwal('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      // Simulating a transaction for proposal creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newProposal = {
        id: proposals.length + 1,
        type: proposalType,
        details: proposalDetails,
        signaturesRequired: 5,
        signatureCount: 0,
      };
      setProposals([newProposal, ...proposals]);
      setProposalType('');
      setProposalDetails('');
      customSwal('Proposal created successfully!');
    } catch (error) {
      console.error('Error creating proposal:', error);
      customSwal('Error creating proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignProposal = async (proposalId) => {
    if (!authenticated) {
      customSwal('Please authenticate to sign a proposal.');
      return;
    }

    setLoading(true);
    try {
      // Simulating a transaction for proposal signing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedProposals = proposals.map(proposal => 
        proposal.id === proposalId
          ? { ...proposal, signatureCount: proposal.signatureCount + 1 }
          : proposal
      );
      setProposals(updatedProposals);
      customSwal('Proposal signed successfully!');
    } catch (error) {
      console.error('Error signing proposal:', error);
      customSwal('Error signing proposal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="proposal-management-page">
      <Drawer />
      <Box sx={{ pt: '100px', px: 3, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ maxWidth: '600px', width: '100%' }}>
          <Typography level="h2" sx={{ mb: 3, textAlign: 'center' }}>
            Proposals Mockup
          </Typography>
          
          <Card variant="outlined" sx={{ mb: 4 }}>
            <Typography level="h5" sx={{ mb: 2 }}>Create New Proposal</Typography>
            <Stack spacing={2}>
              <Select
                placeholder="Select proposal type"
                value={proposalType}
                onChange={(_, newValue) => setProposalType(newValue)}
              >
                <Option value="Remove member">Remove member</Option>
                <Option value="Mint tokens">Mint tokens</Option>
                <Option value="Change weekly distribution amount">Change weekly distribution amount</Option>
              </Select>
              <Input
                placeholder={getPlaceholder(proposalType)}
                value={proposalDetails}
                onChange={(e) => setProposalDetails(e.target.value)}
              />
              <Button
                variant="solid"
                color="primary"
                onClick={handleCreateProposal}
                disabled={loading || !proposalType || !proposalDetails}
              >
                Create Proposal
              </Button>
            </Stack>
          </Card>

          <Divider sx={{ my: 4 }} />

          <Typography level="h5" sx={{ mb: 3 }}>Existing Proposals</Typography>
          <Stack spacing={3}>
            {proposals.map((proposal) => (
              <Card key={proposal.id} variant="outlined">
                <Typography level="h6">{proposal.type}</Typography>
                <Typography level="body2" sx={{ mb: 2 }}>{proposal.details}</Typography>
                <Typography level="body2" sx={{ mb: 2 }}>
                  Signatures: {proposal.signatureCount} / {proposal.signaturesRequired}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleSignProposal(proposal.id)}
                  disabled={loading || proposal.signatureCount >= proposal.signaturesRequired}
                >
                  {proposal.signatureCount >= proposal.signaturesRequired ? 'Fully Signed' : 'Sign'}
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

export default ProposalManagement;