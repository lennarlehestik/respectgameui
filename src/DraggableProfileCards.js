import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Typography, Avatar } from '@mui/joy';

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
  // Add touch action to enable smooth scrolling on mobile while allowing dragging
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

const DraggableProfileCards = () => {
  const [profiles, setProfiles] = useState([
    { id: 'profile-1', name: 'Alice Johnson', avatar: '/path/to/alice.jpg' },
    { id: 'profile-2', name: 'Bob Smith', avatar: '/path/to/bob.jpg' },
    { id: 'profile-3', name: 'Charlie Brown', avatar: '/path/to/charlie.jpg' },
    { id: 'profile-4', name: 'Diana Ross', avatar: '/path/to/diana.jpg' },
  ]);

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const newProfiles = Array.from(profiles);
    const [reorderedItem] = newProfiles.splice(result.source.index, 1);
    newProfiles.splice(result.destination.index, 0, reorderedItem);

    setProfiles(newProfiles);
  };

  return (
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
  );
};

export default DraggableProfileCards;