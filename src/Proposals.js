/* global BigInt */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Chip
} from '@mui/joy';
import { encodeFunctionData, parseAbi } from 'viem';
import Drawer from './Drawer';
import { useAuth } from './AuthProvider';
import { customSwal } from './customSwal';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

const proposalTypes = [
  { value: 0, label: 'Remove member' },
  { value: 1, label: 'Distribute tokens' },
  { value: 2, label: 'Mint tokens' },
];

const generateProposalId = () => {
  return Math.floor(Math.random() * 900000000000000) + 100000000000000;
};

function Proposals() {
  const { communityId } = useParams();
  const { authenticated, sendTransaction, ready, getSmartWalletAddress } = useAuth();
  const [loading, setLoading] = useState(false);
  const [proposalType, setProposalType] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [proposals, setProposals] = useState([]);
  const [fetchingProposals, setFetchingProposals] = useState(true);
  const [communityData, setCommunityData] = useState(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState(null);
  const [isInTopRespectedMembers, setIsInTopRespectedMembers] = useState(false);

  const contractAddress = '0x64357a6B498BC91455B5A62126A76afDb882925B';
  const abi = parseAbi([
    "function createProposal(uint256 _communityId, uint256 _proposalId, uint8 _type, uint256 _value, address _targetMember) public",
    "function signProposal(uint256 _communityId, uint256 _proposalId) public"
  ]);

  const fetchSmartAccountAddress = useCallback(async () => {
    const address = await getSmartWalletAddress();
    setSmartAccountAddress(address);
  }, [getSmartWalletAddress]);

  const fetchCommunityData = useCallback(async () => {
    try {
      const response = await fetch(`https://respectgameapi-d34365572ae7.herokuapp.com/api/community/${communityId}`);
      const data = await response.json();
      setCommunityData(data.data);
    } catch (error) {
      console.error('Error fetching community data:', error);
      customSwal('Failed to fetch community data. Please try again later.');
    }
  }, [communityId]);

  const fetchProposals = useCallback(async () => {
    setFetchingProposals(true);
    try {
      const response = await fetch(`https://respectgameapi-d34365572ae7.herokuapp.com/api/proposals/${communityId}`);
      const data = await response.json();
      if (data.data && data.data.proposals) {
        console.log('Fetched proposals:', data.data.proposals);
        setProposals(data.data.proposals);
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
      customSwal('Failed to fetch proposals. Please try again later.');
    } finally {
      setFetchingProposals(false);
    }
  }, [communityId]);

  useEffect(() => {
    fetchProposals();
    fetchCommunityData();
    fetchSmartAccountAddress();
  }, [fetchProposals, fetchCommunityData, fetchSmartAccountAddress]);

  const getTopRespectedMembers = useCallback(() => {
    if (!communityData) return [];
    return [...communityData.community.memberAddresses].sort((a, b) => {
      const respectA = communityData.community.memberRespect.find(member => member.address.toLowerCase() === a.toLowerCase());
      const respectB = communityData.community.memberRespect.find(member => member.address.toLowerCase() === b.toLowerCase());
      const avgA = respectA ? parseInt(respectA.averageRespect) : 0;
      const avgB = respectB ? parseInt(respectB.averageRespect) : 0;
      return avgB - avgA;
    }).slice(0, 5);
  }, [communityData]);

  useEffect(() => {
    if (smartAccountAddress && communityData) {
      const topMembers = getTopRespectedMembers();
      const isInTop = topMembers.some(member => member.toLowerCase() === smartAccountAddress.toLowerCase());
      setIsInTopRespectedMembers(isInTop);
    }
  }, [smartAccountAddress, communityData, getTopRespectedMembers]);

  const getTokenAmountPlaceholder = (type) => {
    switch (Number(type)) {
      case 1:
        return 'Enter amount of tokens to distribute';
      case 2:
        return 'Enter amount of tokens to mint';
      default:
        return '';
    }
  };

  const getAddressPlaceholder = (type) => {
    switch (Number(type)) {
      case 0:
        return 'Enter member address to remove';
      case 2:
        return 'Enter address to mint tokens to';
      default:
        return '';
    }
  };

  const handleCreateProposal = async () => {
    if (!authenticated || !ready) {
      customSwal('Please authenticate to create a proposal.');
      return;
    }

    if (!proposalType || (Number(proposalType) !== 0 && !tokenAmount) || (Number(proposalType) !== 1 && !addressInput)) {
      customSwal('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      let value = BigInt(0);
      let targetMember = '0x0000000000000000000000000000000000000000';
      let proposalId = generateProposalId();

      if (Number(proposalType) === 0 || Number(proposalType) === 2) {
        targetMember = addressInput;
      }

      if (Number(proposalType) === 1 || Number(proposalType) === 2) {
        // Convert whole tokens to wei (1e18 wei = 1 token)
        value = BigInt(Math.floor(parseFloat(tokenAmount) * 1e18));
      }

      console.log('Creating proposal:', communityId, proposalId, proposalType, value.toString(), targetMember);

      const callData = encodeFunctionData({
        abi,
        functionName: 'createProposal',
        args: [BigInt(communityId), BigInt(proposalId), Number(proposalType), value, targetMember]
      });

      const txHash = await sendTransaction({
        to: contractAddress,
        value: BigInt(0),
        data: callData
      });

      console.log(`Transaction sent to network. Hash: ${txHash}`);
      console.log(`You can view this transaction on the Base block explorer:`);
      console.log(`https://basescan.org/tx/${txHash}`);

      customSwal(`Proposal created successfully! Transaction hash: ${txHash}`);

      // Refetch proposals after creation
      setTimeout(() => fetchProposals(), 4000);
      
      setProposalType('');
      setTokenAmount('');
      setAddressInput('');
    } catch (error) {
      console.error('Error creating proposal:', error);
      customSwal(`Error creating proposal: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignProposal = async (proposalId) => {
    if (!authenticated || !ready) {
      customSwal('Please authenticate to sign a proposal.');
      return;
    }

    if (!isInTopRespectedMembers) {
      customSwal("You can't approve proposals as you are not in the council (top 5 most respected members).");
      return;
    }

    setLoading(true);
    console.log(communityId, proposalId);
    console.log(BigInt(communityId), BigInt(proposalId))
    try {
      const callData = encodeFunctionData({
        abi,
        functionName: 'signProposal',
        args: [BigInt(communityId), BigInt(proposalId)]
      });

      const txHash = await sendTransaction({
        to: contractAddress,
        value: BigInt(0),
        data: callData
      });

      console.log(`Proposal signed. Transaction hash: ${txHash}`);
      console.log(`You can view this transaction on the Base block explorer:`);
      console.log(`https://basescan.org/tx/${txHash}`);

      customSwal(`Proposal signed successfully! Transaction hash: ${txHash}`);

      // Refetch proposals to update the UI
      await fetchProposals();
    } catch (error) {
      console.error('Error signing proposal:', error);
      customSwal(`Error signing proposal: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderProposalDetails = (proposal) => {
    switch (Number(proposal.proposalType)) {
      case 0:
        return `Remove member: ${proposal.creator}`; // Here, creator is actually the member to remove
      case 1:
        return `Distribute tokens: ${(Number(proposal.amount) / 1e18).toFixed(2)} tokens`;
      case 2:
        return `Mint ${(Number(proposal.amount) / 1e18).toFixed(2)} tokens to: ${proposal.creator}`;
      default:
        return 'Unknown proposal type';
    }
  };

  return (
    <Box className="proposal-management-page">
      <Drawer />
      <Box sx={{ pt: '100px', px: 3, display: 'flex', justifyContent: 'center' }}>
        <Box sx={{ maxWidth: '600px', width: '100%', display:"flex", flexDirection:"column", alignItems:"stretch"}}>
          <Typography level="h2" sx={{ mb: 3, textAlign: 'center' }}>
            Proposals for Community {communityId}
          </Typography>
          <Link to={`/respectgame/${communityId}`} style={{ textDecoration: 'none' }}>
            <Button variant="outlined" color="primary" sx={{ mb: 3 }}>
              Go back to community
            </Button>
          </Link>
          <Card variant="outlined" sx={{ mb: 4 }}>
            <Typography level="h5" sx={{ mb: 2 }}>Create New Proposal</Typography>
            <Stack spacing={2}>
              <Select
                placeholder="Select proposal type"
                value={proposalType}
                onChange={(_, newValue) => {
                  setProposalType(newValue);
                  setTokenAmount('');
                  setAddressInput('');
                }}
              >
                {proposalTypes.map((type) => (
                  <Option key={type.value} value={type.value.toString()}>{type.label}</Option>
                ))}
              </Select>
              {proposalType && (
                <>
                  {(Number(proposalType) === 1 || Number(proposalType) === 2) && (
                    <Input
                      placeholder={getTokenAmountPlaceholder(proposalType)}
                      value={tokenAmount}
                      onChange={(e) => setTokenAmount(e.target.value)}
                    />
                  )}
                  {(Number(proposalType) === 0 || Number(proposalType) === 2) && (
                    <Input
                      placeholder={getAddressPlaceholder(proposalType)}
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                    />
                  )}
                </>
              )}
              <Button
                variant="solid"
                color="primary"
                onClick={handleCreateProposal}
                disabled={loading || !proposalType || (Number(proposalType) !== 0 && !tokenAmount) || (Number(proposalType) !== 1 && !addressInput)}
              >
                Create Proposal
              </Button>
            </Stack>
          </Card>

          <Divider sx={{ my: 4 }} />

          <Typography level="h3" sx={{ mb: 3 }}>Existing Proposals</Typography>
          {fetchingProposals ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3}>
              {proposals.map((proposal) => (
                <Card key={proposal.id} variant="outlined" sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography level="h4" fontWeight="bold">
                      {proposalTypes.find(t => t.value === Number(proposal.proposalType))?.label || 'Unknown Type'}
                    </Typography>
                    <Chip
                      variant="soft"
                      color={Number(proposal.approvalCount) >= 3 ? 'success' : 'warning'}
                      startDecorator={Number(proposal.approvalCount) >= 3 ? <CheckCircleIcon /> : <PendingIcon />}
                    >
                      {Number(proposal.approvalCount) >= 3 ? 'Approved' : 'Pending'}
                    </Chip>
                  </Box>
                  
                  <Box sx={{ mb: 1, fontSize:"15px"}}>
                    {renderProposalDetails(proposal)}
                  </Box>
                  
                  <Stack direction="row" spacing={2} sx={{ mb: 0}}>
                    <Chip
                      variant="outlined"
                      color="neutral"
                      startDecorator={<AccessTimeIcon />}
                    >
                      {new Date(Number(proposal.createdAt)).toLocaleString()}
                    </Chip>
                    <Chip
                      variant="outlined"
                      color="primary"
                      startDecorator={<HowToVoteIcon />}
                    >
                      Signatures: {proposal.approvalCount} / 3
                    </Chip>
                  </Stack>

                  <Button
                    variant="solid"
                    color="primary"
                    onClick={() => handleSignProposal(proposal.proposalId)}
                    disabled={loading || Number(proposal.approvalCount) >= 3 || !isInTopRespectedMembers}
                    fullWidth
                    startDecorator={<HowToVoteIcon />}
                  >
                    {Number(proposal.approvalCount) >= 3 ? 'Fully Signed' : 'Sign Proposal'}
                  </Button>
                </Card>
              ))}
              {proposals.length === 0 && (
                <Typography level="body1" sx={{ textAlign: 'center' }}>
                  No proposals found for this community.
                </Typography>
              )}
            </Stack>
          )}

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

export default Proposals;