import * as React from 'react';
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

export default function InsetDrawer() {
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <Button
        variant="outlined"
        color="neutral"
        onClick={() => setOpen(true)}
        sx={{ position: 'fixed', top: 0, right: 0, m: 2, zIndex: 1, background: 'white' }}
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
          <Button
            variant="solid"
            color="primary"
            startDecorator={<AddIcon />}
            sx={{ mb: 2 }}
          >
            Create Community
          </Button>

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
                  <ListItem>
                    <ListItemButton>
                      <GroupIcon sx={{ mr: 2 }} />
                      My Communities
                    </ListItemButton>
                  </ListItem>
                  <ListItem>
                    <ListItemButton onClick={() => window.location.href = '/draggableprofilecards'}>
                      <EmojiEventsIcon sx={{ mr: 2 }} />
                      Try draggable voting ui
                    </ListItemButton>
                  </ListItem>
                </List>
              </ListItem>
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
            </List>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button variant="outlined" color="neutral" onClick={() => setOpen(false)}>
              Close
            </Button>
          </Box>
        </Sheet>
      </Drawer>
    </React.Fragment>
  );
}