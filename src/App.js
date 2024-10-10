import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Box, Typography, Button, Grid, Card, Avatar, CircularProgress, Sheet, Divider} from '@mui/joy';
import MakeDao from './MakeDao';
import GamePage from './GamePage';
import './App.css';
import DraggableProfileCards from './DraggableProfileCards';
import Invite from './Invite';
import Profile from './Profile';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MemberApproval from './MemberApproval';
import Proposals from './Proposals';
import EditProfile from './EditProfile';
import EditCommunity from './EditCommunity';
import ScrollAnimation from 'react-animate-on-scroll';
import "animate.css/animate.compat.css"

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
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchCommunities = useCallback(() => {
    setLoading(true);
    fetch('https://respectgameapi-d34365572ae7.herokuapp.com/api/communities')
      .then(response => response.json())
      .then(data => {
        if (data.data && data.data.communities) {
          setCommunities(data.data.communities);
        } else {
          console.error('Failed to fetch communities:', data);
        }
      })
      .catch(error => console.error('Error fetching communities:', error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const Landing = React.memo(() => (
    <Box className="App">
      <Sheet sx={{p:4, borderBottom:"1px solid #D3D3D3", width:"100%", height:"50px", background:"rgba(255, 255, 255, 0.85)", zIndex:"10", position:"fixed", top:"0", left:"0", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
      <Link to="/" style={{textDecoration:"none", fontSize:"18px", fontWeight:600, display:"flex", alignItems:"center", gap:"9px"}} color="primary"><img src={process.env.PUBLIC_URL + '/rglogo.png'} width="32px"/> Respect Game</Link>
    </Sheet>

      <Box className="landing-content">
      <ScrollAnimation animateIn="fadeIn" animateOnce={true} style={{maxWidth:"90vw"}}>
        <Typography className="landingtitle" level="h1" sx={{mb:1, fontSize:"56px"}}>Organize a <span style={{color:"#7D24EF"}}>Respect Game</span></Typography>
        <Typography className="landingtitle" level="h3" sx={{mb:7, fontSize:"24px", fontWeight:"400", opacity:0.7}}>to build a strong and thriving community.</Typography>

        <Link to="/makedao">
          <Button className="getstartedbutton" >
            Make a respect game
          </Button>
        </Link>
        <Typography className="takesaminute" level="body3" sx={{fontSize:"14px", mt:1}}>Takes under 1 minute</Typography>

        <Box component="img" className="landingimage" src="landingimagefinalcomp.png" alt="Landing" sx={{mt:-10, display: isMobile ? "none" : "block"}} />
        </ScrollAnimation>
      </Box>

      <Box sx={{ 
        my: 4, 
        px: 2, 
        mb: 10, 
        maxWidth: isMobile ? '95vw' : '50vw',
        mx: 'auto'
      }}>
        <ScrollAnimation animateIn="fadeIn" animateOnce={true}>
          <Typography level="h1" sx={{ mb: 2, textAlign: 'center' }}>How do respect games work?</Typography>
          <Typography level="body1" sx={{ mb: 3, fontStyle: 'italic', textAlign: 'center' }}>Who are the most respected members in your community?</Typography>
          <Typography level="body2" sx={{ mb: 4, textAlign: 'center' }}>
            Respect games are played weekly. The goal is to find the most respected members, and to reward them for their contributions.
          </Typography>
        </ScrollAnimation>

        <ScrollAnimation animateIn="fadeIn" animateOnce={true}>
          <Box sx={{ 
            display: 'flex', 
            mb: 4, 
            gap: 3, 
            alignItems: 'center', 
            justifyContent: "flex-start",
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <Box component="img" src="landingillustration1.png" alt="Placeholder for First 6 days" sx={{ width: 300, flexShrink: 0 }} />
            <Box>
              <Typography level="h4" sx={{ mb: 1, textAlign: isMobile ? 'center' : 'left' }}>First 6 days of the game</Typography>
              <Typography level="body1" sx={{ fontStyle: 'italic', mb: 1, textAlign: isMobile ? 'center' : 'left' }}>What have you done to further the community's mission?</Typography>
              <Typography level="body2" sx={{ textAlign: isMobile ? 'center' : 'left' }}>Community members submit their contributions.</Typography>
            </Box>
          </Box>
        </ScrollAnimation>

        <ScrollAnimation animateIn="fadeIn" animateOnce={true}>
          <Box sx={{ 
            display: 'flex', 
            mb: 4, 
            gap: 3, 
            alignItems: 'center', 
            justifyContent: "flex-start",
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <Box component="img" src="landingillustration2.png" alt="Placeholder for 7 day" sx={{ width: 300, flexShrink: 0 }} />
            <Box>
              <Typography level="h4" sx={{ mb: 1, textAlign: isMobile ? 'center' : 'left' }}>7th day of the game</Typography>
              <Typography level="body1" sx={{ fontStyle: 'italic', mb: 1, textAlign: isMobile ? 'center' : 'left' }}>Who do you think contributed the most this week?</Typography>
              <Typography level="body2" sx={{ textAlign: isMobile ? 'center' : 'left' }}>
              Contributors are distributed into small groups of 6 members. <br/> They can rank group members based on their contributions.
              </Typography>
            </Box>
          </Box>
        </ScrollAnimation>

        <ScrollAnimation animateIn="fadeIn" animateOnce={true}>
          <Box sx={{ 
            display: 'flex', 
            mb: 4, 
            gap: 3, 
            alignItems: 'center', 
            justifyContent: "flex-start",
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <Box component="img" src="landingillustration3.png" alt="Placeholder game ends" sx={{ width: 300, flexShrink: 0 }} />
            <Box>
              <Typography level="h4" sx={{ mb: 1, textAlign: isMobile ? 'center' : 'left' }}>Game ends</Typography>
              <Typography level="body2" sx={{ textAlign: isMobile ? 'center' : 'left' }}>Respect points are distributed based on game results.</Typography>
            </Box>
          </Box>
        </ScrollAnimation>

        <ScrollAnimation animateIn="fadeIn" animateOnce={true}>
          <Box sx={{ 
            display: 'flex', 
            mb: 4, 
            gap: 3, 
            alignItems: 'center', 
            justifyContent: "flex-start",
            flexDirection: isMobile ? 'column' : 'row'
          }}>
            <Box component="img" src="council.png" alt="Placeholder council" sx={{ width: 300, flexShrink: 0 }} />
            <Box>
              <Typography level="h4" sx={{ mb: 1, textAlign: isMobile ? 'center' : 'left' }}>Council is formed</Typography>
              <Typography level="body2" sx={{ textAlign: isMobile ? 'center' : 'left' }}>Most respected members from last 12 weeks form a council. Council controls the community’s treasury, can steer the community and 
              has other privileges. </Typography>
            </Box>
          </Box>
        </ScrollAnimation>

        {/*<ScrollAnimation animateIn="fadeIn" animateOnce={true}>
          <Typography level="h4" sx={{ mb: 2, textAlign: 'center' }}>Why play respect games?</Typography>
          <Typography level="body2" sx={{ mb: 2, textAlign: 'center' }}>
            The games <b>determine who the most respected members in your community</b> are. They get access to the community treasury.
          </Typography>
          <Typography level="body2" sx={{ textAlign: 'center' }}>
            The games also <b>reward contributing members</b>. This <b>incentivizes</b> them to be even <b>more active</b> in moving the community forward in its mission.
          </Typography>
        </ScrollAnimation>*/}

        <ScrollAnimation animateIn="fadeIn" animateOnce={true} style={{marginTop:"200px"}}>
        <Typography level="h4" sx={{ mb: 2, textAlign: 'center' }}>Learn more</Typography>
  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      gap: 2,
      justifyContent: 'center',
      alignItems: 'stretch',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: 2,
      marginTop: 2,
    }}
  >
    {[
      {
        title: "Article",
        content: "Read our medium article to learn more about the Respect Game.",
        href: "https://medium.com/@vladislavhramtsov/3ef28ea7c8e9"
      },
      {
        title: "Whitepaper",
        content: "Read the whitepaper that Respect Game is based on.",
        href: "https://fractally.com/uploads/Fractally%20White%20Paper%201.0.pdf"
      },
      {
        title: "Telegram",
        content: "Join our telegram group.",
        href: "https://t.me/respectgameofficial"
      }
    ].map((item, index) => (
      <Box
        key={index}
        component="a"
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          flex: 1,
          aspectRatio: '1 / 1',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
          textDecoration: 'none',
          color: 'inherit',
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: '#7D24EF',
            '& .MuiTypography-root': {
              color: 'white',
            },
          },
        }}
      >
        <Typography level="h4">{item.title}</Typography>
        <Typography>{item.content}</Typography>
      </Box>
    ))}
  </Box>
</ScrollAnimation>
        
      </Box>

      <Divider  sx={{opacity:0.5, width:"50vw", marginLeft:"auto", marginRight:"auto", mb:15, mt:10}}/>

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

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/makedao" element={<MakeDao />} />
        <Route path="/respectgame/:id" element={<GamePage />} />
        <Route path="/draggableprofilecards" element={<DraggableProfileCards />} />
        <Route path="/invite/:id" element={<Invite />} />
        <Route path="/editprofile/:id" element={<EditProfile />} /> 
        <Route path="/profile" element={<Profile />} />
        <Route path="/memberapproval/:communityId" element={<MemberApproval />} />
        <Route path="/proposals/:communityId" element={<Proposals />} />
        <Route path="/editcommunity/:id" element={<EditCommunity />} />
      </Routes>
    </Router>
  );
}

export default React.memo(App);