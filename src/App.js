import React, { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Box, Typography, Button, Container, Grid, Card, Avatar } from '@mui/joy';
import MakeDao from './MakeDao';
import GamePage from './GamePage';
import './App.css';
import DraggableProfileCards from './DraggableProfileCards';
import Invite from './Invite';
import Profile from './Profile';

const CommunityCard = ({ community }) => (
  <Card variant="outlined" sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
    <Avatar src={community.profilePic} alt={community.name} sx={{ width: 60, height: 60, mr: 2 }} />
    <Box>
      <Typography level="h6">{community.name}</Typography>
      <Typography level="body2">{community.members} members</Typography>
      <Typography level="body2">{community.gamesHeld} games held</Typography>
    </Box>
  </Card>
);

function App() {
  const { ready, authenticated, login, sendTransaction, logout } = usePrivy();
  const [view, setView] = useState('landing');

  const [communities] = useState([
    { name: "Tech Innovators", profilePic: "tech.jpg", members: 150, gamesHeld: 12 },
    { name: "Green Earth", profilePic: "earth.jpg", members: 89, gamesHeld: 8 },
    { name: "Art Collective", profilePic: "art.jpg", members: 76, gamesHeld: 6 },
    { name: "Crypto Pioneers", profilePic: "crypto.jpg", members: 210, gamesHeld: 15 },
    { name: "Health & Wellness", profilePic: "health.jpg", members: 120, gamesHeld: 10 },
    { name: "Education First", profilePic: "edu.jpg", members: 95, gamesHeld: 7 },
  ]);

  useEffect(() => {
    if (window.location.pathname.includes('/respectgame')) {
      setView('gamepage');
    }
    if(window.location.pathname.includes('/draggableprofilecards')) {
      setView('draggableprofilecards');
    }
    if(window.location.pathname.includes('/invite')) {
      setView('invite');
    }
    if(window.location.pathname.includes('/profile')) {
      setView('profile');
    }
  }, []);

  const renderLanding = () => (
    <Box className="App">
      <Box className="navbar">
        <Typography className="navbarbrand" level="h6">Respect game</Typography>
        <Typography className="navbartry" level="body2" color="secondary">Try it out!</Typography>
      </Box>
      <Box className="landing-content">
        <Typography className="landingsubtitle" level="body2" color="secondary">Next generation of DAOs.</Typography>
        <Typography className="landingtitle" level="h2">Organize a weekly respect game</Typography>
        <Typography className="takesaminute" level="body3">Takes under 1 minute</Typography>
        <Button 
          className="getstartedbutton"
          onClick={() => setView('makedao')}
        >
          Make a respect game
        </Button>
        <Box component="img" className="landingimage" src="landingimage.png" alt="Landing" />
      </Box>
      <Box sx={{ mt: 4, mb: 4}}>
      <Typography level="h4" sx={{ mb: 2 }}>Featured Communities</Typography>
      <Grid container spacing={2}>
        {communities.map((community, index) => (
          <Grid key={index} item xs={12} sm={6} md={4}>
            <Card variant="outlined" sx={{ display: 'flex', flexDirection:"row", p: 2 }}>
              <Avatar
                src={community.profilePic} 
                alt={community.name} 
                sx={{ width: 80, height: 80}}
              />
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection:"column", alignItems:"flex-start" }}>
                <Typography level="h5" sx={{ mb: 1 }}><b>{community.name}</b></Typography>
                <Typography level="body2">{community.members} members</Typography>
                <Typography level="body2">{community.gamesHeld} games held</Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
    </Box>
  );

  return (
    <>
      {view === 'landing' && renderLanding()}
      {view === 'makedao' && <MakeDao />}
      {view === 'gamepage' && <GamePage />}
      {view === 'draggableprofilecards' && <DraggableProfileCards />}
      {view === 'invite' && <Invite />}
      {view === 'profile' && <Profile />}
    </>
  );
}

export default App;