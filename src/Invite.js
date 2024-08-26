import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { 
  Box, 
  Typography, 
  Input, 
  Textarea, 
  Button,
  FormControl,
  FormLabel,
  Card
} from '@mui/joy';

function Invite() {
  const { ready, authenticated, login, sendTransaction, logout } = usePrivy();
  const [view, setView] = useState('landing');

  const handleMakeRespectGame = () => {
    window.location.href = '/respectgame';
  };

  return (
    <Box 
      className="makedao" 
      sx={{ 
        display: 'flex', 
        height: '100vh',
        flexDirection: { xs: 'column', md: 'row' },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box 
        className="makedaoleft" 
        sx={{ 
          width: { xs: '100%', md: '50%' }, 
          height: '100%',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          zIndex: 1,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-5%',
            left: '-5%',
            right: '-5%',
            bottom: '-5%',
            backgroundImage: { xs: 'url("./makegamebg.png")', md: 'none' },
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            transform: 'scale(1.1)', // Slightly enlarge the background
            zIndex: -1
          }
        }}
      >
        <Card 
          variant="outlined" 
          sx={{ 
            width: { xs: '90%', sm: '80%' }, 
            maxWidth: 400,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography level="h3">Join a Respect Game!</Typography>
          <Typography level="body-md" sx={{ mb: 3 }}>You have been invited to a respect game! Create a profile and you can participate.</Typography>

          <FormControl>
            <FormLabel>What should we call you?</FormLabel>
            <Input sx={{ mb: 2 }} />
          </FormControl>

          <FormControl>
            <FormLabel>Describe yourself</FormLabel>
            <Textarea minRows={3} maxRows={5} sx={{ mb: 2 }} />
          </FormControl>

          <FormControl>
            <FormLabel>Profile picture</FormLabel>
            <Box 
              sx={{ 
                border: '1px dashed', 
                borderColor: 'neutral.outlinedBorder',
                borderRadius: 'sm',
                p: 2,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'background.level1' }
              }}
            >
              <Typography level="body2">Drop or click to upload</Typography>
            </Box>
          </FormControl>

          <Button 
            variant="solid" 
            color="primary" 
            fullWidth 
            sx={{ mt: 3 }} 
            onClick={handleMakeRespectGame}
          >
            Join Respect Game
          </Button>
        </Card>
      </Box>
      <Box 
        className="makedaoright" 
        sx={{ 
          display: { xs: 'none', md: 'block' },
          width: '50%',
          height: '100%',
          backgroundImage: 'url("./makegamebg.png")', // Make sure to use the correct path to your image
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} 
      />
    </Box>
  );
}

export default Invite;