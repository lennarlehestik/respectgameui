import * as React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import Box from '@mui/joy/Box';
import Drawer from '@mui/joy/Drawer';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import DialogTitle from '@mui/joy/DialogTitle';
import ModalClose from '@mui/joy/ModalClose';
import Divider from '@mui/joy/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link } from 'react-router-dom';

export default function InsetDrawer() {
  const [open, setOpen] = React.useState(false);
  const { login, logout, authenticated, user } = usePrivy();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Sheet sx={{p:2, width:"100%", height:"50px", background:"white", zIndex:"10", position:"fixed", top:"0", left:"0", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
      <Link to="/">Home</Link>
      <Button
        variant="outlined"
        color="neutral"
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </Button>
      <Drawer
        size="md"
        variant="plain"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          content: {
            sx: {
              bgcolor: 'transparent',
              p: { md: 3, sm: 0 },
              boxShadow: 'none',
            },
          },
        }}
      >
        <Sheet
          sx={{
            borderRadius: 'md',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            height: '100%',
            overflow: 'auto',
          }}
        >
          <DialogTitle>Respect Game</DialogTitle>
          {authenticated && user && (
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              {JSON.stringify(user.wallet?.address)}
            </Typography>
          )}
          <ModalClose />
          {authenticated ? (
            <Link to="/makedao">
            <Button
              variant="solid"
              color="primary"
              startDecorator={<AddIcon />}
              sx={{ mb: 2 }}
            >
              Create Community
            </Button>
            </Link>
          ) : (
            <Button
              variant="solid"
              color="primary"
              startDecorator={<LoginIcon />}
              onClick={handleLogin}
              sx={{ mb: 2 }}
            >
              Login
            </Button>
          )}

          <Divider />
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <List size="sm" sx={{ '--ListItem-radius': '8px' }}>
              <ListItem nested>
                <Typography level="body-sm" sx={{ fontWeight: 'bold', my: 1 }}>
                  Navigation
                </Typography>
                <List>
                  <ListItem>
                    <ListItemButton>
                      <HomeIcon sx={{ mr: 2 }} />
                      Home
                    </ListItemButton>
                  </ListItem>
                  {authenticated && (
                    <ListItem>
                      <ListItemButton>
                        <GroupIcon sx={{ mr: 2 }} />
                        My Communities
                      </ListItemButton>
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemButton onClick={() => window.location.href = '/draggableprofilecards'}>
                      <EmojiEventsIcon sx={{ mr: 2 }} />
                      Try draggable voting ui
                    </ListItemButton>
                  </ListItem>
                </List>
              </ListItem>
              {authenticated && (
                <ListItem nested sx={{ mt: 2 }}>
                  <Typography level="body-sm" sx={{ fontWeight: 'bold', my: 1 }}>
                    Account
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemButton>
                        <SettingsIcon sx={{ mr: 2 }} />
                        Settings
                      </ListItemButton>
                    </ListItem>
                  </List>
                </ListItem>
              )}
            </List>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            {authenticated ? (
              <Button 
                variant="outlined" 
                color="danger" 
                onClick={handleLogout}
                startDecorator={<LogoutIcon />}
              >
                Logout
              </Button>
            ) : (
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleLogin}
                startDecorator={<LoginIcon />}
              >
                Login
              </Button>
            )}
            <Button variant="outlined" color="neutral" onClick={() => setOpen(false)}>
              Close
            </Button>
          </Box>
        </Sheet>
      </Drawer>
    </Sheet>
  );
}