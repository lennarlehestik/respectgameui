import * as React from 'react';
import { useAuth } from './AuthProvider';
import { ethers } from 'ethers';
import axios from 'axios';
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
import AddIcon from '@mui/icons-material/Add';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Link, useNavigate } from 'react-router-dom';
import LibraryAddCheckIcon from '@mui/icons-material/LibraryAddCheck';
import ArticleIcon from '@mui/icons-material/Article';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import Avatar from '@mui/joy/Avatar';
import Tooltip from '@mui/joy/Tooltip';

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function symbol() view returns (string)"
];

export default function InsetDrawer({bg, communityId, communityTokenAddress}) {
  const [open, setOpen] = React.useState(false);
  const { login, logout, authenticated, user, getSmartWalletAddress, ready } = useAuth();
  const navigate = useNavigate();
  const [smartAccountAddress, setSmartAccountAddress] = React.useState(null);
  const [tokenBalance, setTokenBalance] = React.useState(null);
  const [tokenSymbol, setTokenSymbol] = React.useState(null);
  const [userProfile, setUserProfile] = React.useState(null);
  const [copyTooltip, setCopyTooltip] = React.useState('Copy to clipboard');

  React.useEffect(() => {
    const fetchSmartWalletAddress = async () => {
      if (authenticated && ready) {
        const address = await getSmartWalletAddress();
        setSmartAccountAddress(address);
        fetchUserProfile(address);
      }
    };
    fetchSmartWalletAddress();
  }, [authenticated, ready, getSmartWalletAddress]);

  const fetchUserProfile = async (address) => {
    try {
      const response = await axios.get(`https://respectgameapi-d34365572ae7.herokuapp.com/api/profile/${address}`);
      if (response.data.success) {
        console.log(response)
        setUserProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  React.useEffect(() => {
    const fetchTokenInfo = async () => {
      if (smartAccountAddress && communityTokenAddress) {
        try {
          const provider = new ethers.providers.JsonRpcProvider("https://mainnet.base.org");
          const tokenContract = new ethers.Contract(communityTokenAddress, ERC20_ABI, provider);
          
          const [balance, symbol] = await Promise.all([
            tokenContract.balanceOf(smartAccountAddress),
            tokenContract.symbol()
          ]);
          
          setTokenBalance(ethers.utils.formatUnits(balance, 18)); // Assuming 18 decimals, adjust if different
          setTokenSymbol(symbol);
        } catch (error) {
          console.error('Error fetching token info:', error);
          setTokenBalance('Error');
          setTokenSymbol('Error');
        }
      }
    };

    fetchTokenInfo();
  }, [smartAccountAddress, communityTokenAddress]);

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
      setTokenBalance(null);
      setTokenSymbol(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(smartAccountAddress);
    setCopyTooltip('Copied!');
    setTimeout(() => setCopyTooltip('Copy to clipboard'), 2000);
  };

  return (
    <Sheet sx={{p:2, width:"100%", height:"50px", background:bg ? bg : "white", zIndex:"10", position:"fixed", top:"0", left:"0", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
      <Link to="/" style={{textDecoration:"none", fontSize:"18px", fontWeight:600, display:"flex", alignItems:"center", gap:"5px"}} color="primary"><img src={process.env.PUBLIC_URL + '/rglogo.png'} width="32px"/> Respect Game</Link>
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
          <ModalClose />
          {authenticated && userProfile && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={userProfile?.profilepic}
                alt={userProfile?.username}
                sx={{ width: 80, height: 80, mb: 1 }}
              />
              <Typography level="h5" sx={{ mb: 1 }}>
                {userProfile?.username}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <Typography level="body-sm" sx={{ mr: 1, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {smartAccountAddress}
                </Typography>
                <Tooltip title={copyTooltip}>
                  <Button
                    size="sm"
                    variant="plain"
                    color="neutral"
                    onClick={copyToClipboard}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </Button>
                </Tooltip>
              </Box>
              {tokenBalance !== null && tokenSymbol !== null && (
                <Typography level="body-sm" sx={{ mt: 1 }}>
                  Token Balance: {tokenBalance} {tokenSymbol}
                </Typography>
              )}
            </Box>
          )}
                    <Divider />

          {authenticated ? (
            <Link to="/makedao">
              <Button
                variant="solid"
                color="primary"
                startDecorator={<AddIcon />}
                sx={{ mb: 2 }}
                fullWidth
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
                  {communityId && (
                  <>
                    <ListItem>
                      <ListItemButton component={Link} to={"/memberapproval/"+communityId}>
                        <LibraryAddCheckIcon sx={{ mr: 2 }} />
                        Approve members
                      </ListItemButton>
                    </ListItem>
                    <ListItem>
                      <ListItemButton component={Link} to={"/proposals/"+communityId}>
                        <ArticleIcon sx={{ mr: 2 }} />
                        Proposals
                      </ListItemButton>
                    </ListItem>
                    <ListItem>
                      <ListItemButton component={Link} to={"/editprofile/"+communityId}>
                        <AccountBoxIcon sx={{ mr: 2 }} />
                        Edit profile
                      </ListItemButton>
                    </ListItem>
                    <ListItem>
                      <ListItemButton component={Link} to={"/editcommunity/"+communityId}>
                        <AccountBoxIcon sx={{ mr: 2 }} />
                        Edit community
                      </ListItemButton>
                    </ListItem>
                  </>
                  )}
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