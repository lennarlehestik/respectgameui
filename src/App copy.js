import React, { useEffect, useState, useCallback, useRef} from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Box, Typography, Button, Container, Grid, Card, Avatar } from '@mui/joy';
import { useAuth } from './AuthProvider';
import MakeDao from './MakeDao';
import GamePage from './GamePage';
import './App.css';
import DraggableProfileCards from './DraggableProfileCards';
import Invite from './Invite';
import Profile from './Profile';
import Drawer from './Drawer';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import customSwal from './customSwal';

const CommunityCard = React.memo(({ community }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Link to={`/respectgame/${community?.communityId}`} style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
      <Card 
        variant="outlined" 
        sx={{
          display: 'flex',
          flexDirection: "row",
          p: 2,
          width: '100%',
          maxWidth: isMobile ? '100%' : '350px',
          mb: 2,
          margin: '0 auto',
        }}
      >
        <Avatar
          src={community.imageUrl} 
          alt={community.name} 
          sx={{ width: 80, height: 80 }}
        />
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: "column", alignItems: "flex-start", ml: 2 }}>
          <Typography level="h6" sx={{ mb: 1 }}><b>{community.name}</b></Typography>
          <Typography level="body2">
            {community.description.length > 20 
              ? community.description.slice(0, 20) + '...' 
              : community.description}
          </Typography>
        </Box>
      </Card>
    </Link>
  );
});

function App() {
  console.log('App rendering');
  const { ready, authenticated, login, logout, smartWalletAddress } = useAuth();
  const [communities, setCommunities] = useState([]);

  const fetchCommunities = useCallback(() => {
    console.log('Fetching communities');
    fetch('https://respectgameapi-d34365572ae7.herokuapp.com/api/communities')
      .then(response => response.json())
      .then(data => {
        if (data.data && data.data.communities) {
          console.log('Communities fetched:', data.data.communities);
          setCommunities(data.data.communities);
        } else {
          console.error('Failed to fetch communities:', data);
        }
      })
      .catch(error => console.error('Error fetching communities:', error));
  }, []);

  useEffect(() => {
    console.log('App mounted');
    fetchCommunities();
    return () => console.log('App unmounted');
  }, [fetchCommunities]);

  useEffect(() => {
    console.log('Auth state changed', { ready, authenticated, smartWalletAddress });
  }, [ready, authenticated, smartWalletAddress]);

  const Landing = React.memo(() => (
    <Box className="App">
      <Drawer />
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
      <Box sx={{ mt: 4, mb: 4, width: '100%', maxWidth: '1200px', mx: 'auto', px: 2 }}>
        <Typography level="h4" sx={{ mb: 2 }}>Featured Communities</Typography>
        <Grid container spacing={2} justifyContent="center">
          {communities.map((community, index) => (
            <Grid key={index} item xs={12} sm={6} md={4} lg={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <CommunityCard community={community} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  ));

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

export default React.memo(App);