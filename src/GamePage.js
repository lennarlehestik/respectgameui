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
import { base } from 'viem/chains';
import { encodeFunctionData, parseAbi } from 'viem';
import Drawer from './Drawer';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DraggableProfileCards from './DraggableProfileCards';
import { useParams, Link } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tooltip } from '@mui/joy';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';


import { useAuth } from './AuthProvider';
import { customSwal, customCenteredSwal } from './customSwal';


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
                <Typography level="body2" sx={{ fontWeight: 'bold' }}>{contribution.name}</Typography>
                <Typography level="body2">{contribution.description}</Typography>
                <Typography level="body2">
                  Links: {contribution.links.map((link, lIndex) => {
                    // Ensure the link is an absolute URL
                    const absoluteLink = link.startsWith('http://') || link.startsWith('https://')
                      ? link
                      : `https://${link}`;

                    return (
                      <a key={lIndex} href={absoluteLink} target="_blank" rel="noopener noreferrer" sx={{ mr: 1 }}>
                        <Chip sx={{ mr: 1, cursor: "pointer" }} size="sm">
                          Link {lIndex + 1}
                        </Chip>
                      </a>
                    );
                  })}
</Typography>
              </Box>
            ))}
          </Box>
        ))}
      </AccordionDetails>
    </Accordion>
  );
};

const CurrentGameContributions = ({ group, contributions, profiles }) => {
  const [expanded, setExpanded] = useState(false);

  const getUsername = (address) => {
    const profile = profiles.find(p => p.user.toLowerCase() === address.toLowerCase());
    return profile ? profile.username : 'Unknown';
  };

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary
        aria-controls="current-game-content"
        id="current-game-header"
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
        <Typography level="h6" sx={{ mb: 1 }}>Contributions</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, width: '100%' }}>
          {group.memberAddresses?.map((participant, index) => (
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
        {group.memberAddresses?.map((participant, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar src={profiles.find(p => p.user.toLowerCase() === participant.toLowerCase())?.profilepic || "./placeholderimage.jpg"} alt={getUsername(participant)} />
              <Typography level="body1" sx={{ ml: 2 }}>
                {getUsername(participant)}
              </Typography>
            </Box>
            {contributions.find(c => c.contributionId.toLowerCase().includes(participant.toLowerCase()))?.contributions.map((contribution, cIndex) => (
              <Box key={cIndex} sx={{ ml: 4, mt: 1 }}>
                <Typography level="body2" sx={{ fontWeight: 'bold' }}>{contribution.name}</Typography>
                <Typography level="body2">{contribution.description}</Typography>
                <Typography level="body2">
                  Links: {contribution.links.map((link, lIndex) => {
                    const absoluteLink = link.startsWith('http://') || link.startsWith('https://')
                      ? link
                      : `https://${link}`;

                    return (
                      <a key={lIndex} href={absoluteLink} target="_blank" rel="noopener noreferrer" sx={{ mr: 1 }}>
                        <Chip sx={{ mr: 1, cursor: "pointer" }} size="sm">
                          Link {lIndex + 1}
                        </Chip>
                      </a>
                    );
                  })}
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
        Game #{Number(electionData?.weekNumber) + 1}
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

const UserProfileModal = ({ open, onClose, userAddress, profiles, communityData }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const userProfile = profiles?.find(
    profile => profile.user.toLowerCase() === userAddress.toLowerCase()
  );

  const getUserHistory = () => {
    if (!communityData || !communityData.community.weeklyGames) return [];

    return communityData.community.weeklyGames.map(game => {
      const userContribution = game.contributions.find(c => 
        c.contributionId.toLowerCase().includes(userAddress.toLowerCase())
      );
      const userRanking = game.rankings.find(r => 
        r.eventId.toLowerCase().includes(userAddress.toLowerCase())
      );

      return {
        gameNumber: Number(game.weekNumber) + 1,
        contributions: userContribution ? userContribution.contributions : [],
        ranking: userRanking ? userRanking.ranking : []
      };
    }).filter(game => game.contributions.length > 0 || game.ranking.length > 0);
  };

  const handleShare = () => {
    const currentUrl = window.location.href;
    const baseUrl = currentUrl?.split('?')[0]; // Remove any existing query parameters
    const shareUrl = `${baseUrl}?user=${userAddress}`;

    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

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

  const userHistory = getUserHistory();

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ maxWidth: 600, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography level="h4">{userProfile?.username} profile</Typography>
          <Tooltip title={copySuccess ? "Copied!" : "Copy share link"} placement="top">
            <Button
              variant="outlined"
              color="neutral"
              startDecorator={copySuccess ? <ContentCopyIcon /> : <ShareIcon />}
              onClick={handleShare}
            >
              {copySuccess ? "Copied" : "Share"}
            </Button>
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={userProfile.profilepic || "./placeholderimage.jpg"} alt={userProfile.username} />
          <Box sx={{ ml: 2 }}>
            <Typography level="h5">{userProfile.username}</Typography>
            <Typography level="body-sm">{userProfile.user}</Typography>
          </Box>
        </Box>
        <Typography level="body1">{userProfile.description}</Typography>
        <Divider sx={{ my: 2 }} />

        {userHistory.length > 0 ? (
          userHistory.map((game, index) => (
            <Accordion key={index}>
              <AccordionSummary>Game #{game.gameNumber}</AccordionSummary>
              <AccordionDetails>
                <br/>
                {game.contributions.map((contribution, cIndex) => (
                  <Box key={cIndex} sx={{ mb: 3, borderLeft:"3px solid #bc92fc", paddingLeft:"10px"}}>
                    <Typography level="body2" sx={{ fontWeight: 'bold' }}>{contribution.name}</Typography>
                    <Typography level="body2">{contribution.description}</Typography>
                    <Typography level="body2">
                      Links: {contribution.links.map((link, lIndex) => {
                        const absoluteLink = link.startsWith('http://') || link.startsWith('https://')
                          ? link
                          : `https://${link}`;

                        return (
                          <a key={lIndex} href={absoluteLink} target="_blank" rel="noopener noreferrer" sx={{ mr: 1 }}>
                            <Chip sx={{ mr: 1, cursor: "pointer" }} size="sm">
                              Link {lIndex + 1}
                            </Chip>
                          </a>
                        );
                      })}
                    </Typography>
                  </Box>
                ))}
                <Typography level="body-sm"><b>Rankings given:</b></Typography>
                <Box>
                  {game.ranking.map((rank, rIndex) => {
                    const rankedUser = communityData.profiles.find(
                      profile => profile.user.toLowerCase() === game.contributions[rIndex]?.contributionId?.split('-')[0].toLowerCase()
                    );
                    return (
                      <Chip key={rIndex} sx={{ mr: 1, mb: 1 }} size="sm">
                        {rankedUser ? rankedUser.username : `User ${rIndex + 1}`}: {rank}
                      </Chip>
                    );
                  })}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography level="body2">No history available for this user.</Typography>
        )}
      </ModalDialog>
    </Modal>
  );
};

function GamePage() {
  const { authenticated, sendTransaction, getSmartWalletAddress } = useAuth();
  const [communityData, setCommunityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contributions, setContributions] = useState([{ name: '', description: '', links: [''] }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserAddress, setSelectedUserAddress] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [smartAccountAddress, setSmartAccountAddress] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userAddress = params.get('user');
    if (userAddress) {
      setSelectedUserAddress(userAddress);
      setShowUserModal(true);
      // Remove the 'user' parameter from the URL
      params.delete('user');
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchSmartAccountAddress = async () => {
      const address = await getSmartWalletAddress();
      setSmartAccountAddress(address);
    };
    fetchSmartAccountAddress();
  }, [getSmartWalletAddress]);

  const findUserGroup = () => {
    const weeklyGames = communityData?.community?.weeklyGames;
    if (!weeklyGames || weeklyGames.length === 0) return -1;
  
    const currentGame = weeklyGames[weeklyGames.length - 1];
    if (!currentGame.rooms) return -1;
  
    return currentGame.rooms.findIndex(room => 
      room.memberAddresses.some(address => 
        address.toLowerCase() === smartAccountAddress?.toLowerCase()
      )
    );
  };

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
        console.log(data);
      } catch (err) {
        customSwal('An error occurred while fetching data');
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, [id]);

    // New useEffect to set contributions when smartAccountAddress is available
    useEffect(() => {
      if (communityData && smartAccountAddress) {
        const currentGame = communityData?.community?.weeklyGames[communityData.community.weeklyGames.length - 1];
        const userContributions = currentGame?.contributions?.find(c => 
          c.contributionId.toLowerCase().includes(smartAccountAddress.toLowerCase())
        );
  
        if (userContributions) {
          setContributions(userContributions.contributions.map(contribution => ({
            name: contribution.name,
            description: contribution.description,
            links: contribution.links
          })));
        }
      }
    }, [smartAccountAddress, communityData]);

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
    
    if (!authenticated) {
      customSwal('Please authenticate to submit contributions.');
      return;
    }
  
    if (!communityData) {
      customSwal('Community data not loaded. Please refresh the page.');
      return;
    }
  
    if (communityData.community.state !== "0") {
      customSwal('Contributions can only be submitted during the Contribution Submission phase.');
      return;
    }
  
    const isMember = communityData.community.memberAddresses.some(address => address.toLowerCase() === smartAccountAddress?.toLowerCase());
    if (!isMember) {
      customSwal('You must be a member of this community to submit contributions.');
      return;
    }
  
    const validContributions = contributions.filter(contribution => 
      contribution.name && contribution.description && contribution.links?.length > 0 && contribution.links[0] !== ''
    );
  
    if (validContributions.length === 0) {
      customSwal('Please add at least one valid contribution with name, description, and at least one non-empty link.');
      return;
    }
  
    const formattedContributions = validContributions.map(c => ({
      name: c.name,
      description: c.description,
      links: c.links.filter(link => link !== '')
    }));
  
    setIsSubmitting(true);
    try {
      const callData = encodeFunctionData({
        abi,
        functionName: "submitContributions",
        args: [BigInt(id), formattedContributions]
      });
  
      const txHash = await sendTransaction({
        to: contractAddress,
        value: BigInt(0),
        data: callData
      });
      
      console.log(`Contributions submitted successfully! Transaction hash: ${txHash}`);
      customSwal(`Contributions submitted successfully! Transaction hash: ${txHash}`);
    } catch (err) {
      console.error('Error submitting contributions:', err);
      customSwal(`Error submitting contributions: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{height:"100vh", width:"100%", display:"flex", alignItems:"center", justifyContent:"center"}}><CircularProgress /></div>;
  }

  if (error) {
    return <Typography color="danger">{error}</Typography>;
  }

  if (!communityData) {
    return <Typography>No data available</Typography>;
  }

  const { community, profiles } = communityData;
  const currentGame = community.weeklyGames.length > 0 
  ? community.weeklyGames[community.weeklyGames.length - 1] 
  : null;
  const getMemberProfile = (address) => {
    return profiles.find(profile => profile.user.toLowerCase() === address.toLowerCase());
  };

  return (
    <Box className="gamepage">
      <Drawer userAddress={smartAccountAddress}/>
      <UserProfileModal
        open={showUserModal}
        onClose={() => {
          setShowUserModal(false);
          setSelectedUserAddress('');
        }}
        userAddress={selectedUserAddress}
        profiles={profiles}
        communityData={communityData}
      />
      <Grid container spacing={3}>
        <Grid xs={12} md={5}>
          <Card variant="outlined">
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <AspectRatio ratio="1" sx={{ width: 80, borderRadius: 'md' }}>
                <img 
                  src={community.imageUrl} 
                  alt="Community"
                />
              </AspectRatio>
              <Box>
                <Typography level="h4">{community.name || "Unnamed Community"}</Typography>
                <Typography level="body2" style={{wordBreak: "break-word"}}>{community.description || "No description available"}</Typography>
                <Typography level="body2" sx={{ mt: 1 }}>
                  {community.memberAddresses.length} members | {community.games.length} respect games
                </Typography>
              </Box>
            </Box>
            <Link to={"/invite/" + id}><Button>Invite page</Button></Link>

            <Typography level="h5" sx={{ mt: 3, mb: 2 }}>
              Members ({community.memberAddresses.length})
            </Typography>
            {community.memberAddresses.map((address, index) => {
              const profile = getMemberProfile(address);
              return (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2, 
                    cursor: 'pointer' 
                  }}
                  onClick={() => {
                    setSelectedUserAddress(address);
                    setShowUserModal(true);
                    // Update the URL when clicking on a user
                    navigate(`?user=${address}`, { replace: true });
                  }}
                >
                  <Avatar 
                    src={profile?.profilepic || "./placeholderimage.jpg"} 
                    alt={profile?.username || 'Unknown'} 
                  />
                  <Box sx={{ ml: 2 }}>
                    <Typography level="body1">
                      {profile?.username || 'Unknown'} ({address.substring(0, 6)}...{address.substring(38)})
                    </Typography>
                  </Box>
                </Box>
              );
            })}
            {community.memberAddresses.length === 0 && (
              <Typography level="body2">No members yet</Typography>
            )}
          </Card>
        </Grid>
        <Grid xs={12} md={7}>
          <Card variant="outlined">
            <Typography level="h2" gutterBottom>
              Current Game (#{(Number(currentGame?.weekNumber) + 1) || 1})
            </Typography>
            <Typography level="body1" gutterBottom>
              {community.state === "0" ? "Contribution Submission" : "Contribution Ranking"} is ongoing for game number {(Number(currentGame?.weekNumber) + 1) || 1}! {community.state === "0" ? "Submit your contributions to participate." : "Rank the contributions in your group."}
            </Typography>
            {community.state === "0" && (
              <>
                {contributions?.map((contribution, index) => (
                  <Box key={index} sx={{ mb: 3, borderLeft:"3px solid #bc92fc", paddingLeft:"10px"}}>
                    <Typography level="h5" sx={{fontWeight:"600", marginBottom:"5px"}}>Contribution {index + 1}</Typography>
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
                  sx={{ mb: 0 }}
                >
                  Add Another Contribution
                </Button>
                <Divider sx={{ my: 1 }} />
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
                {(() => {
                  const userGroupIndex = findUserGroup();
                  if (userGroupIndex === -1) {
                    return <Typography level="body2">You are not assigned to a group for ranking.</Typography>;
                  }
                  const userGroup = currentGame.rooms[userGroupIndex];
                  return (
                    <Box sx={{ mb: 3 }}>
                      <Typography level="h6">Your Group (Group {userGroupIndex + 1})</Typography>
                      <CurrentGameContributions 
                        group={userGroup}
                        contributions={currentGame.contributions}
                        profiles={profiles}
                      />
                      <DraggableProfileCards
                        communityId={id}
                        weekNumber={currentGame?.weekNumber}
                        groupId={userGroupIndex}
                        roomMembers={userGroup.memberAddresses.map(address => ({
                          address,
                          username: profiles.find(profile => profile.user.toLowerCase() === address.toLowerCase())?.username || 'Unknown'
                        }))}
                        smartAccountAddress={smartAccountAddress}
                      />
                    </Box>
                  );
                })()}
              </>
            )}
          </Card>

          <Typography level="h3" sx={{ mt: 4, mb: 2 }}>Previous Games</Typography>
          {community.weeklyGames.length > 1 ? (
              community.weeklyGames
                .filter(game => game.id !== community.currentGame)
                .sort((a, b) => parseInt(b.weekNumber) - parseInt(a.weekNumber))
                .map((electionData, index) => (
                  <PreviousElectionCard 
                    key={electionData.id} 
                    electionData={electionData} 
                    profiles={profiles} 
                  />
                ))
            ) : (
              <Typography level="body1">No previous games available yet.</Typography>
            )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default GamePage;