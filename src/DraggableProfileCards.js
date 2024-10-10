/* global BigInt */
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  roomMembers,
  onRankingSubmitted
}) => {
  const { authenticated, sendTransaction, getSmartWalletAddress, ready } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const profilesRef = useRef(roomMembers);
  const orderRef = useRef(roomMembers.map(member => member.address));
  const [, forceUpdate] = useState({});

  useEffect(() => {
    if (JSON.stringify(roomMembers) !== JSON.stringify(profilesRef.current)) {
      profilesRef.current = roomMembers;
      orderRef.current = roomMembers.map(member => member.address);
      forceUpdate({});
    }
  }, [roomMembers]);

  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;

    const newOrder = Array.from(orderRef.current);
    const [reorderedItem] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, reorderedItem);

    orderRef.current = newOrder;
    forceUpdate({});
  }, []);

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
      const addressPositions = orderRef.current.reduce((acc, address, index) => {
        acc[address.toLowerCase()] = index;
        return acc;
      }, {});

      // Calculate rankings based on the original order of roomMembers
      const ranking = orderRef.current.map(address => 
        roomMembers.findIndex(member => member.address.toLowerCase() === address.toLowerCase()) + 1
      );

      console.log('Ranking:', ranking);

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
      
      customSwal("Ranking submitted successfully!");
      console.log(`Transaction sent. Hash: ${txHash}`);

      if (onRankingSubmitted) {
        onRankingSubmitted(orderRef.current, ranking);
      }
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
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="profileList">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {orderRef.current.map((address, index) => {
                const profile = profilesRef.current.find(p => p.address === address);
                return (
                  <Draggable key={address} draggableId={address} index={index}>
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
                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          <Avatar
                            src={profile.avatar}
                            alt={profile.username}
                            sx={{ width: 40, height: 40, mr: 2, flexShrink: 0 }}
                          />
                          <Typography level="body1" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {profile.username}
                          </Typography>
                        </Box>
                        <Typography 
                          level="body2" 
                          sx={{ 
                            minWidth: '24px', 
                            height: '24px', 
                            borderRadius: '50%', 
                            backgroundColor: 'primary.light', 
                            color: 'primary.contrastText', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontWeight: 'bold'
                          }}
                        >
                          #{index + 1}
                        </Typography>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <Button 
        variant="solid" 
        fullWidth 
        onClick={handleSubmitRanking}
        disabled={isSubmitting || !authenticated || !ready}
        sx={{ mt: 2 }}
      >
        {isSubmitting ? <CircularProgress size="sm" /> : 'Submit Ranking'}
      </Button>
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

export default React.memo(DraggableProfileCards);