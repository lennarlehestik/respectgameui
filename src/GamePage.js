/* global BigInt */

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Avatar, 
  Input, 
  Textarea,
  Button, 
  Divider,
  Grid,
  AspectRatio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
  Stack,
  IconButton,
  Modal,
  ModalDialog,
  ModalClose,
  List,
  ListItem,
  ListItemContent,
  CardContent
} from '@mui/joy';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { base } from 'viem/chains';
import { createPublicClient, http, encodeFunctionData, parseAbi } from 'viem';
import { providerToSmartAccountSigner, ENTRYPOINT_ADDRESS_V07, bundlerActions } from "permissionless";
import { createZeroDevPaymasterClient, createKernelAccount, createKernelAccountClient } from "@zerodev/sdk";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import Drawer from './Drawer';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DraggableProfileCards from './DraggableProfileCards';
import { useParams, Link } from 'react-router-dom';

const ElectionRoom = ({ roomNumber, participants, contributions, rankings, profiles }) => {
  const [expanded, setExpanded] = useState(false);

  const getUsername = (address) => {
    const profile = profiles.find(p => p.user.toLowerCase() === address.toLowerCase());
    return profile ? profile.username : 'Unknown';
  };

  const getUserRanking = (address) => {
    const ranking = rankings.find(r => r.eventId.toLowerCase().includes(address.toLowerCase()));
    return ranking ? ranking.ranking : [];
  };

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary
        indicator={expanded ? '▲' : '▼'}
        aria-controls={`room${roomNumber}-content`}
        id={`room${roomNumber}-header`}
        sx={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          '& .MuiAccordionSummary-content': {
            flexDirection: 'column',
            alignItems: 'flex-start',
            width: '100%',
          },
        }}
      >
        <Typography level="h6" sx={{ mb: 1, width:"100px"}}>Room {roomNumber}</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, width: '100%' }}>
          {participants?.map((participant, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mr: 2, mb: 1 }}>
              <Avatar src={profiles.find(p => p.user.toLowerCase() === participant.toLowerCase())?.profilepic || "./placeholderimage.jpg"} alt={getUsername(participant)} size="sm" />
              <Typography level="body2" sx={{ ml: 1 }}>
                {getUsername(participant)}
              </Typography>
            </Box>
          ))}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {participants?.map((participant, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar src={profiles.find(p => p.user.toLowerCase() === participant.toLowerCase())?.profilepic || "./placeholderimage.jpg"} alt={getUsername(participant)} />
              <Typography level="body1" sx={{ ml: 2 }}>
                {getUsername(participant)}
              </Typography>
            </Box>
            <Box sx={{ ml: 4, mb: 2 }}>
              <Typography level="body2" sx={{ fontWeight: 'bold' }}>Rankings given:</Typography>
              {getUserRanking(participant).map((rank, rIndex) => (
                <Chip key={rIndex} sx={{ mr: 1 }} size="sm">
                  {getUsername(participants[rIndex])}: {rank}
                </Chip>
              ))}
            </Box>
            {contributions.find(c => c.contributionId.toLowerCase().includes(participant.toLowerCase()))?.contributions.map((contribution, cIndex) => (
              <Box key={cIndex} sx={{ ml: 4, mt: 1 }}>
                <Typography level="body2">Name: {contribution.name}</Typography>
                <Typography level="body2">Description: {contribution.description}</Typography>
                <Typography level="body2">
                  Links: {contribution.links.map((link, lIndex) => (
                    <a key={lIndex} href={link} target="_blank" rel="noopener noreferrer" sx={{ mr: 1 }}>
                      Link {lIndex + 1}
                    </a>
                  ))}
                </Typography>
              </Box>
            ))}
          </Box>
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

const PreviousElectionCard = ({ electionData, profiles }) => {
  return (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <Typography level="h3" gutterBottom>
        Election #{electionData.weekNumber}
      </Typography>
      {electionData.rooms?.map((room, index) => (
        <ElectionRoom 
          key={index} 
          roomNumber={index + 1} 
          participants={room.memberAddresses} 
          contributions={electionData.contributions} 
          rankings={electionData.rankings}
          profiles={profiles}
        />
      ))}
    </Card>
  );
};

const UserProfileModal = ({ open, onClose, userAddress, profiles }) => {
  const userProfile = profiles?.find(
    profile => profile.user.toLowerCase() === userAddress.toLowerCase()
  );

  if (!userProfile) {
    return (
      <Modal open={open} onClose={onClose}>
        <ModalDialog>
          <ModalClose />
          <Typography level="body1">User profile not found</Typography>
        </ModalDialog>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ maxWidth: 600, width: '100%' }}>
        <ModalClose />
        <Typography level="h4" sx={{ mb: 2 }}>User Profile</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={userProfile.profilepic || "./placeholderimage.jpg"} alt={userProfile.username} />
          <Box sx={{ ml: 2 }}>
            <Typography level="h5">{userProfile.username}</Typography>
            <Typography level="body2">{userProfile.user}</Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography level="body1">Description: {userProfile.description}</Typography>
        <Typography level="body2">Created At: {new Date(parseInt(userProfile.createdAt) * 1000).toLocaleString()}</Typography>
        <Typography level="body2">Updated At: {new Date(parseInt(userProfile.updatedAt) * 1000).toLocaleString()}</Typography>
      </ModalDialog>
    </Modal>
  );
};

function GamePage() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [communityData, setCommunityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contributions, setContributions] = useState([{ name: '', description: '', links: [''] }]);
  const [kernelClient, setKernelClient] = useState(null);
  const [smartAccountAddress, setSmartAccountAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserAddress, setSelectedUserAddress] = useState('');
  const { id } = useParams();

  const findUserGroup = () => {
    if (!communityData?.community?.weeklyGames[0]?.rooms) return -1;
    return communityData.community.weeklyGames[0].rooms.findIndex(room => 
      room.memberAddresses.some(address => address.toLowerCase() === smartAccountAddress.toLowerCase())
    );
  };

  useEffect(() => {
    console.log('Smart Account Address:', smartAccountAddress);
  }, [smartAccountAddress]);

  const contractAddress = '0xb51658dD0d05F4a7c038c3035f6cC839e8378c32';
  const abi = [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_communityId",
          type: "uint256"
        },
        {
          components: [
            {
              internalType: "string",
              name: "name",
              type: "string"
            },
            {
              internalType: "string",
              name: "description",
              type: "string"
            },
            {
              internalType: "string[]",
              name: "links",
              type: "string[]"
            }
          ],
          internalType: "struct ICommunityGovernanceContributions.Contribution[]",
          name: "_contributions",
          type: "tuple[]"
        }
      ],
      name: "submitContributions",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    }
  ];

  useEffect(() => {
    const fetchCommunityData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://respectgameapi-d34365572ae7.herokuapp.com/api/community/${id}`);
        const data = await response.json();
        setCommunityData(data.data);
        console.log(data)
      } catch (err) {
        setError('An error occurred while fetching data');
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [id]);

  useEffect(() => {
    const setupSmartAccount = async () => {
      if (authenticated && wallets?.length > 0) {
        setLoading(true);
        try {
          let provider;
          const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
          if (embeddedWallet) {
            provider = await embeddedWallet.getEthereumProvider();
          } else {
            const externalWallet = wallets[0];
            provider = await externalWallet.getEthereumProvider();
          }

          const smartAccountSigner = await providerToSmartAccountSigner(provider);
          
          const publicClient = createPublicClient({
            chain: base,
            transport: http('https://rpc.zerodev.app/api/v2/bundler/a1511783-a97b-4114-9d91-c86b20673729'),
          });

          const entryPoint = ENTRYPOINT_ADDRESS_V07;
          const kernelVersion = KERNEL_V3_1;

          const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
            signer: smartAccountSigner,
            entryPoint,
            kernelVersion,
          });

          const account = await createKernelAccount(publicClient, {
            plugins: {
              sudo: ecdsaValidator,
            },
            entryPoint,
            kernelVersion,
          });
          setSmartAccountAddress(account.address);

          const client = createKernelAccountClient({
            account,
            chain: base,
            entryPoint,
            bundlerTransport: http('https://rpc.zerodev.app/api/v2/bundler/a1511783-a97b-4114-9d91-c86b20673729'),
            middleware: {
              sponsorUserOperation: async ({ userOperation }) => {
                const zerodevPaymaster = createZeroDevPaymasterClient({
                  chain: base,
                  entryPoint,
                  transport: http('https://rpc.zerodev.app/api/v2/paymaster/a1511783-a97b-4114-9d91-c86b20673729'),
                });
                return await zerodevPaymaster.sponsorUserOperation({
                  userOperation,
                  entryPoint,
                });
              }
            }
          });

          setKernelClient(client);
        } catch (error) {
          setError(`Error setting up smart account: ${error.message}`);
        } finally {
          setLoading(false);
        }
      }
    };

    setupSmartAccount();
  }, [authenticated, wallets]);

  const handleAddContribution = () => {
    setContributions([...contributions, { name: '', description: '', links: [''] }]);
  };

  const handleRemoveContribution = (index) => {
    const newContributions = contributions.filter((_, i) => i !== index);
    setContributions(newContributions);
  };

  const handleAddLink = (contributionIndex) => {
    const newContributions = [...contributions];
    newContributions[contributionIndex].links.push('');
    setContributions(newContributions);
  };

  const handleRemoveLink = (contributionIndex, linkIndex) => {
    const newContributions = [...contributions];
    newContributions[contributionIndex].links = newContributions[contributionIndex].links.filter((_, i) => i !== linkIndex);
    setContributions(newContributions);
  };

  const handleContributionChange = (index, field, value) => {
    const newContributions = [...contributions];
    newContributions[index][field] = value;
    setContributions(newContributions);
  };

  const handleLinkChange = (contributionIndex, linkIndex, value) => {
    const newContributions = [...contributions];
    newContributions[contributionIndex].links[linkIndex] = value;
    setContributions(newContributions);
  };

  const handleSubmitContributions = async () => {
    console.log('Attempting to submit contributions...');
    
    if (!kernelClient) {
      setError('Smart account not set up. Please try again.');
      console.error('Smart account not set up');
      return;
    }
  
    if (!communityData) {
      setError('Community data not loaded. Please refresh the page.');
      console.error('Community data not loaded');
      return;
    }
  
    if (communityData.community.state !== "0") {
      setError('Contributions can only be submitted during the Contribution Submission phase.');
      console.error('Incorrect community state:', communityData.community.state);
      return;
    }
  
    const isMember = communityData.community.memberAddresses.some(address => address.toLowerCase() === smartAccountAddress.toLowerCase());
    if (!isMember) {
      setError('You must be a member of this community to submit contributions.');
      console.error('User is not a member of the community');
      return;
    }
  
    const validContributions = contributions.filter(contribution => 
      contribution.name && contribution.description && contribution.links?.length > 0 && contribution.links[0] !== ''
    );
  
    if (validContributions.length === 0) {
      setError('Please add at least one valid contribution with name, description, and at least one non-empty link.');
      console.error('No valid contributions found');
      return;
    }
  
    const formattedContributions = validContributions.map(c => ({
      name: c.name,
      description: c.description,
      links: c.links.filter(link => link !== '') // Remove any empty links
    }));
  
    console.log('Community ID:', id);
    console.log('Smart Account Address:', smartAccountAddress);
    console.log('Formatted contributions:', JSON.stringify(formattedContributions, null, 2));
  
    setIsSubmitting(true);
    try {
      const callData = encodeFunctionData({
        abi,
        functionName: "submitContributions",
        args: [BigInt(id), formattedContributions]
      });
  
      console.log('Encoded function data:', callData);
  
      // Send the user operation without gas estimation
      const userOpHash = await kernelClient.sendUserOperation({
        userOperation: {
          callData: await kernelClient.account.encodeCallData({
            to: contractAddress,
            value: BigInt(0),
            data: callData,
          }),
        },
      });
      console.log('User operation hash:', userOpHash);
  
      const bundlerClient = kernelClient.extend(bundlerActions(ENTRYPOINT_ADDRESS_V07));
      console.log('Waiting for user operation receipt...');
      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });
      const txHash = receipt.receipt.transactionHash;
      console.log(`Contributions submitted successfully! Transaction hash: ${txHash}`);
      
      // Reset the contributions after successful submission
      setContributions([{ name: '', description: '', links: [''] }]);
      
      // Optionally, refresh the community data here
      // await fetchCommunityData();
    } catch (err) {
      console.error('Full error object:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      if (err.message.includes('user rejected transaction')) {
        setError('Transaction was rejected by the user.');
      } else if (err.message.includes('insufficient funds')) {
        setError('Insufficient funds to execute the transaction.');
      } else if (err.message.includes('execution reverted')) {
        setError('Transaction reverted. You may not have permission to submit contributions or the community might be in an incorrect state.');
      } else {
        setError(`Error submitting contributions: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="danger">{error}</Typography>;
  }

  if (!communityData) {
    return <Typography>No data available</Typography>;
  }

  const { community, profiles } = communityData;
  const currentGame = community.weeklyGames[0];

  return (
    <Box className="gamepage">
      <Drawer userAddress={smartAccountAddress}/>
      <UserProfileModal
        open={showUserModal}
        onClose={() => setShowUserModal(false)}
        userAddress={selectedUserAddress}
        profiles={profiles}
      />
      <Grid container spacing={3}>
        <Grid xs={12} md={5}>
          <Card variant="outlined">
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <AspectRatio ratio="1" sx={{ width: 80, borderRadius: 'md' }}>
                <img 
                  src={community.imageUrl} 
                  alt="Community"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "./placeholderimage.jpg";
                  }}
                />
              </AspectRatio>
              <Box>
                <Typography level="h4">{community.name || "Unnamed Community"}</Typography>
                <Typography level="body2">{community.description || "No description available"}</Typography>
                <Typography level="body2" sx={{ mt: 1 }}>
                  {community.memberAddresses.length} members | {community.games.length} respect games
                </Typography>
              </Box>
            </Box>
            <Link to={"/invite/" + id}><Button>Invite page</Button></Link>

            <Typography level="h5" sx={{ mt: 3, mb: 2 }}>
              Members
            </Typography>
            {profiles.map((profile, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={profile.profilepic} alt={profile.username} />
                <Box sx={{ ml: 2 }}>
                  <Typography level="body1">
                    {profile.username} ({profile.user.substring(0, 6)}...{profile.user.substring(38)})
                  </Typography>
                </Box>
              </Box>
            ))}
            {profiles.length === 0 && (
              <Typography level="body2">No members yet</Typography>
            )}
          </Card>
        </Grid>
        <Grid xs={12} md={7}>
          <Card variant="outlined">
            <Typography level="h2" gutterBottom>
              Current Game State
            </Typography>
            <Typography level="body1" gutterBottom>
              Phase: {community.state === "0" ? "Contribution Submission" : "Contribution Ranking"}
            </Typography>
            <Typography level="body1" gutterBottom>
              Current Week: {currentGame.weekNumber}
            </Typography>
            {community.state === "0" && (
              <>
                <Typography level="p" sx={{ mt: 3, mb: 2 }}>
                  Submit your contributions to participate.
                </Typography>
                {contributions?.map((contribution, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Typography level="h6">Contribution {index + 1}</Typography>
                    <Input 
                      placeholder="Contribution Name"
                      value={contribution.name}
                      onChange={(e) => handleContributionChange(index, 'name', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Textarea
                      placeholder="Contribution Description"
                      value={contribution.description}
                      onChange={(e) => handleContributionChange(index, 'description', e.target.value)}
                      minRows={3}
                      sx={{ mb: 2 }}
                    />
                    <Typography level="body1" sx={{ mt: 2, mb: 1 }}>
                      Links
                    </Typography>
                    {contribution.links?.map((link, linkIndex) => (
                      <Box key={linkIndex} sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                        <Input 
                          placeholder="Link"
                          value={link}
                          onChange={(e) => handleLinkChange(index, linkIndex, e.target.value)}
                          size="sm"
                          sx={{ flexGrow: 1 }}
                        />
                        <IconButton 
                          size="sm" 
                          onClick={() => handleRemoveLink(index, linkIndex)}
                          disabled={contribution.links?.length === 1}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Box>
                    ))}
                    <Button 
                      variant="outlined" 
                      size="sm" 
                      startDecorator={<AddIcon />}
                      onClick={() => handleAddLink(index)}
                      sx={{ mb: 2 }}
                    >
                      Add Link
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="danger"
                      size="sm" 
                      onClick={() => handleRemoveContribution(index)}
                      disabled={contributions?.length === 1}
                      sx={{ ml: 2, mb: 2 }}
                    >
                      Remove Contribution
                    </Button>
                  </Box>
                ))}
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startDecorator={<AddIcon />}
                  onClick={handleAddContribution}
                  sx={{ mb: 2 }}
                >
                  Add Another Contribution
                </Button>
                <Divider sx={{ my: 3 }} />
                <Button 
                  variant="solid" 
                  fullWidth
                  onClick={handleSubmitContributions}
                  disabled={isSubmitting || !authenticated}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Contributions'}
                </Button>
              </>
            )}
            {community.state === "1" && (
              <>
                <Typography level="p" sx={{ mt: 3, mb: 2 }}>
                  Ranking phase is ongoing. Please rank the contributions in your group.
                </Typography>
                {(() => {
                  const userGroupIndex = findUserGroup();
                  if (userGroupIndex === -1) {
                    return <Typography level="body2">You are not assigned to a group for ranking.</Typography>;
                  }
                  const userGroup = currentGame.rooms[userGroupIndex];
                  return (
                    <Box sx={{ mb: 3 }}>
                      <Typography level="h6">Your Group (Group {userGroupIndex + 1})</Typography>
                      <DraggableProfileCards
                        communityId={id}
                        weekNumber={currentGame.weekNumber}
                        groupId={userGroupIndex}
                        roomMembers={userGroup.memberAddresses.map(address => ({
                          address,
                          username: profiles.find(profile => profile.user.toLowerCase() === address.toLowerCase())?.username || 'Unknown'
                        }))}
                        kernelClient={kernelClient}
                        smartAccountAddress={smartAccountAddress}
                      />
                    </Box>
                  );
                })()}
              </>
            )}
          </Card>

          <Typography level="h3" sx={{ mt: 4, mb: 2 }}>Previous Elections</Typography>
          {community.weeklyGames.length > 1 ? (
            community.weeklyGames.slice(1).map((electionData, index) => (
              <PreviousElectionCard key={index} electionData={electionData} profiles={profiles} />
            ))
          ) : (
            <Typography level="body1">No previous elections available yet.</Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default GamePage;