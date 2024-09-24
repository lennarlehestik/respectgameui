/* global BigInt */

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Typography, Avatar, Box, Button, CircularProgress } from '@mui/joy';
import { encodeFunctionData } from 'viem';
import { providerToSmartAccountSigner, ENTRYPOINT_ADDRESS_V07, bundlerActions } from "permissionless";

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
  maxWidth: '300px',
  margin: '0 auto'
});

const DraggableProfileCards = ({ 
  communityId, 
  weekNumber, 
  groupId, 
  roomMembers, 
  kernelClient, 
  smartAccountAddress 
}) => {
  const [profiles, setProfiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (roomMembers) {
      console.log('Room members:', roomMembers);
      setProfiles(roomMembers.map((member, index) => ({
        id: `profile-${index}`,
        name: member.username || `Address ${member.address.slice(0, 6)}...`,
        avatar: member.avatar || '/placeholderimage.jpg',
        address: member.address
      })));
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
    setIsSubmitting(true);
    setError(null);

    const rankingContractAddress = '0xe0DF8059637EEB20464Faa169227DFeA819c36d7'; // Rankings contract address
    const abi = [
      {
        inputs: [
          { internalType: "uint256", name: "_communityId", type: "uint256" },
          { internalType: "uint256", name: "_weekNumber", type: "uint256" },
          { internalType: "uint256", name: "_groupId", type: "uint256" },
          { internalType: "uint256[]", name: "_ranking", type: "uint256[]" }
        ],
        name: "submitRanking",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
      }
    ];

    try {
      const ranking = profiles.map(profile => 
        roomMembers.findIndex(member => member.address === profile.address) + 1
      );

      const callData = encodeFunctionData({
        abi,
        functionName: "submitRanking",
        args: [BigInt(communityId), BigInt(weekNumber), BigInt(groupId), ranking]
      });

      const userOpHash = await kernelClient.sendUserOperation({
        userOperation: {
          callData: await kernelClient.account.encodeCallData({
            to: rankingContractAddress,
            value: BigInt(0),
            data: callData,
          }),
        },
      });

      const bundlerClient = kernelClient.extend(bundlerActions(ENTRYPOINT_ADDRESS_V07));
      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });
      
      console.log('Ranking submitted successfully!', receipt);
    } catch (err) {
      console.error('Error submitting ranking:', err);
      setError(`Error submitting ranking: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}>
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
        disabled={isSubmitting}
        sx={{ mt: 2 }}
      >
        {isSubmitting ? <CircularProgress size="sm" /> : 'Submit Ranking'}
      </Button>
      {error && (
        <Typography color="danger" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default DraggableProfileCards;