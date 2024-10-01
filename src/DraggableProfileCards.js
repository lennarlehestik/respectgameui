/* global BigInt */

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Typography, Avatar, Box, Button, CircularProgress, Alert } from '@mui/joy';
import { encodeFunctionData, parseAbi } from 'viem';
import { useAuth } from './AuthProvider';
import { customSwal, customCenteredSwal } from './customSwal';

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  background: isDragging ? 'rgba(83, 12, 175, 0.4)' : 'white',
  color: isDragging ? 'white' : 'black',
  display: 'flex',
  alignItems: 'center',
  borderRadius: '4px',
  boxShadow: isDragging ? '0 5px 10px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
  touchAction: 'none',
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'transparent' : 'transparent',
  padding: grid,
  width: '100%',
  margin: '0 auto'
});

const DraggableProfileCards = ({ 
  communityId, 
  weekNumber, 
  groupId, 
  roomMembers
}) => {
  const { authenticated, login, sendTransaction, getSmartWalletAddress, ready } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  useEffect(() => {
    if (roomMembers) {
      const newProfiles = roomMembers.map((member, index) => ({
        id: `profile-${member.address}`,
        name: member.username || `Address ${member.address.slice(0, 6)}...`,
        avatar: member.profilePic || '/placeholderimage.jpg',
        address: member.address
      }));
      setProfiles(newProfiles);
    }
  }, [roomMembers]);

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const newProfiles = Array.from(profiles);
    const [reorderedItem] = newProfiles.splice(result.source.index, 1);
    newProfiles.splice(result.destination.index, 0, reorderedItem);

    setProfiles(newProfiles);
  };

  const handleSubmitRanking = async () => {
    if (!authenticated || !ready) {
      customSwal("Please authenticate to submit ranking.");
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');
    console.log('Submitting ranking...');
    customSwal("Submitting ranking...");

    const rankingContractAddress = '0xe0DF8059637EEB20464Faa169227DFeA819c36d7';
    const abi = parseAbi([
      "function submitRanking(uint256 _communityId, uint256 _weekNumber, uint256 _groupId, uint256[] _ranking) public"
    ]);

    try {
      // Create a mapping of addresses to their current positions
      const addressPositions = profiles.reduce((acc, profile, index) => {
        acc[profile.address.toLowerCase()] = index;
        return acc;
      }, {});

      // Calculate rankings based on the original order of roomMembers
      const ranking = roomMembers.map(member => 
        addressPositions[member.address.toLowerCase()] + 1
      );

      console.log(ranking)

      const callData = encodeFunctionData({
        abi,
        functionName: "submitRanking",
        args: [BigInt(communityId), BigInt(weekNumber), BigInt(groupId), ranking]
      });

      const txHash = await sendTransaction({
        to: rankingContractAddress,
        value: BigInt(0),
        data: callData
      });
      
      setSuccess(`Ranking submitted successfully! Transaction hash: ${txHash}`);
      customSwal("Ranking submitted successfully!");
      console.log(`Transaction sent. Hash: ${txHash}`);
    } catch (err) {
      customSwal("Error submitting ranking: " + err.message);
      console.error('Error submitting ranking:', err);
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
    <Box sx={{ width: '100%', margin: '0 auto' }}>
      {!authenticated ? (
        <Button fullWidth onClick={login} sx={{ mb: 2 }}>
          Login to Submit Ranking
        </Button>
      ) : (
        <>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="profileList">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {profiles.map((profile, index) => (
                    <Draggable key={profile.id} draggableId={profile.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          <Avatar
                            src={profile.avatar}
                            alt={profile.name}
                            sx={{ width: 40, height: 40, mr: 2, flexShrink: 0 }}
                          />
                          <Typography level="body1" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {profile.name}
                          </Typography>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <Button 
            variant="solid" 
            fullWidth 
            onClick={handleSubmitRanking}
            disabled={isSubmitting || !ready}
            sx={{ mt: 2 }}
          >
            {isSubmitting ? <CircularProgress size="sm" /> : 'Submit Ranking'}
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
    </Box>
  );
};

export default DraggableProfileCards;