import * as React from 'react';
import { useAuth } from './AuthProvider'; // Import from AuthProvider instead of useAuth
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
import { Link, useNavigate } from 'react-router-dom';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import ArticleIcon from '@mui/icons-material/Article';

export default function InsetDrawer({bg}) {
  const [open, setOpen] = React.useState(false);
  const { login, logout, authenticated, user, getSmartWalletAddress, ready } = useAuth();
  const navigate = useNavigate();
  const [smartAccountAddress, setSmartAccountAddress] = React.useState(null);

  React.useEffect(() => {
    const fetchSmartWalletAddress = async () => {
      if (authenticated && ready) {
        const address = await getSmartWalletAddress();
        setSmartAccountAddress(address);
      }
    };
    fetchSmartWalletAddress();
  }, [authenticated, ready, getSmartWalletAddress]);

  const handleLogin = async () => {
    try {
      setOpen(false);
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setSmartAccountAddress(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Sheet sx={{p:2, width:"100%", height:"50px", background:bg ? bg : "white", zIndex:"10", position:"fixed", top:"0", left:"0", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
      <Link to="/" style={{textDecoration:"none", fontSize:"18px", fontWeight:600}}>Respect Game</Link>
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
            <>
              {/*<Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                EOA: {user.wallet?.address}
              </Typography>*/}
              <Sheet>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                Your account address:
              </Typography>
              <Typography level="body-sm" sx={{ color: 'text.primary'}}>
              {smartAccountAddress || 'Initializing...'}
              </Typography>
              </Sheet>
            </>
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
              disabled={!ready}
            >
              {!ready ? 'Initializing...' : 'Login'}
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
                    <ListItemButton component={Link} to="/">
                      <HomeIcon sx={{ mr: 2 }} />
                      Home
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton component={Link} to="/memberapproval">
                      <LibraryAddCheckIcon sx={{ mr: 2 }} />
                      Approve members
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton component={Link} to="/proposals">
                      <ArticleIcon sx={{ mr: 2 }} />
                      Proposals
                    </ListItemButton>
                  </ListItem>
                </List>
              </ListItem>
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
                disabled={!ready}
              >
                {!ready ? 'Processing...' : 'Logout'}
              </Button>
            ) : (
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={handleLogin}
                startDecorator={<LoginIcon />}
                disabled={!ready}
              >
                {!ready ? 'Initializing...' : 'Login'}
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