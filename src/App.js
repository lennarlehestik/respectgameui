import React, { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Box, Typography, Button, Container, Grid, Card, Avatar } from '@mui/joy';
import MakeDao from './MakeDao';
import GamePage from './GamePage';
import './App.css';
import DraggableProfileCards from './DraggableProfileCards';
import Invite from './Invite';
import Profile from './Profile';

const CommunityCard = ({ community }) => (
  <Link to={"/respectgame/" + community?.id}>
  <Card variant="outlined" sx={{ display: 'flex', flexDirection:"row", p: 2 }}>
    <Avatar
      src={community.imageUrl} 
      alt={community.name} 
      sx={{ width: 80, height: 80}}
    />
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection:"column", alignItems:"flex-start" }}>
      <Typography level="h5" sx={{ mb: 1 }}><b>{community.name}</b></Typography>
      <Typography level="body2">{community.memberCount} members</Typography>
      <Typography level="body2">{community.eventCount} games held</Typography>
    </Box>
  </Card>
  </Link>
);

function App() {
  const { ready, authenticated, login, sendTransaction, logout } = usePrivy();
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    // Fetch communities from the API
    fetch('https://cuddly-powerful-stage.glitch.me/get-all-communities')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log(data)
          setCommunities(data.communities);
        } else {
          console.error('Failed to fetch communities:', data.error);
        }
      })
      .catch(error => console.error('Error fetching communities:', error));
  }, []);

  const Landing = () => (
    <Box className="App">
      <Box className="navbar">
        <Typography className="navbarbrand" level="h6">Respect game</Typography>
        <Typography className="navbartry" level="body2" color="secondary">Try it out!</Typography>
      </Box>
      <Box className="landing-content">
        <Typography className="landingsubtitle" level="body2" color="secondary">Next generation of DAOs.</Typography>
        <Typography className="landingtitle" level="h2">Organize a weekly respect game</Typography>
        <Typography className="takesaminute" level="body3">Takes under 1 minute</Typography>
        <Link to="/makedao">
          <Button className="getstartedbutton">
            Make a respect game
          </Button>
        </Link>
        <Box component="img" className="landingimage" src="landingimage.png" alt="Landing" />
      </Box>
      <Box sx={{ mt: 4, mb: 4, maxWidth:"80vw"}}>
        <Typography level="h4" sx={{ mb: 2 }}>Featured Communities</Typography>
        <Grid container spacing={2}>
          {communities.map((community, index) => (
            <Grid key={index} item>
              <CommunityCard community={community} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/makedao" element={<MakeDao />} />
        <Route path="/respectgame/:id" element={<GamePage />} />
        <Route path="/draggableprofilecards" element={<DraggableProfileCards />} />
        <Route path="/invite/:id" element={<Invite />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;